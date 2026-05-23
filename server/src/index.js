const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Resend } = require('resend');
const { handleUpgradeRequest } = require('../../functions/utils/upgradeRequest');
const {
  listUpgradeRequests,
  reviewUpgradeRequest,
  listAdminWorkspaces,
  setWorkspacePlan,
} = require('../../functions/utils/adminBilling');

dotenv.config();

// Initialize Firebase Admin with Service Account if available
const admin = require('firebase-admin');
const serviceAccountPath = path.join(__dirname, '../service-account.json');

const adminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'tn-hr-lite'
};

if (fs.existsSync(serviceAccountPath)) {
  try {
    const serviceAccount = require(serviceAccountPath);
    adminConfig.credential = admin.credential.cert(serviceAccount);
    console.log("✅ Firebase Admin: Loaded credentials from service-account.json");
  } catch (err) {
    console.error("❌ Firebase Admin: Error loading service-account.json:", err.message);
  }
} else {
  console.warn("⚠️ Firebase Admin: No service-account.json found. Using default credentials.");
}

admin.initializeApp(adminConfig);

console.log(`Firebase Admin initialized for project: ${adminConfig.projectId}`);

// Auto-seed plans collection
const db = admin.firestore();
async function seedPlans() {
  try {
    const plansRef = db.collection('plans');
    const snapshot = await plansRef.get();
    if (snapshot.empty) {
      console.log("🌱 Database is empty of plans. Seeding plans...");
      await plansRef.doc('free').set({
        name: 'Free',
        jobs: 5,
        candidates: 50,
        cvParsesPerMonth: 10
      });
      await plansRef.doc('pro').set({
        name: 'Pro',
        jobs: 50,
        candidates: 500,
        cvParsesPerMonth: 100
      });
      await plansRef.doc('team').set({
        name: 'Team',
        jobs: -1,
        candidates: -1,
        cvParsesPerMonth: -1
      });
      console.log("✨ Plans seeded successfully!");
    } else {
      console.log("✓ Plans already exist in Firestore.");
    }
  } catch (error) {
    console.error("❌ Error seeding plans:", error.message);
  }
}
seedPlans();

const app = express();

// Permissive CORS for local dev - explicit for all methods
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Initialize Gemini if Key exists
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;


/**
 * Utility to extract JSON from AI response, handling markdown blocks or extra chatter.
 */
function cleanJsonResponse(text) {
  try {
    // Attempt to find content between ```json and ``` or just ``` and ```
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, text];
    const rawJson = jsonMatch[1].trim();
    return JSON.parse(rawJson);
  } catch (_e) {
    console.error("Critical: Failed to extract valid JSON from Gemini response. Raw text:", text);
    throw new Error("AI returned an invalid data format.");
  }
}

/**
 * Basic authentication: Verifies Firebase ID Token and attaches user to req.user
 */
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Auth verify error:", error.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid token', details: error.message });
  }
};

// Admin Middleware: Ensures caller is the authenticated admin.
const verifyAdmin = async (req, res, next) => {
  await authenticate(req, res, () => {
    const adminEmail = process.env.ADMIN_EMAIL || 'thanhnghiep@gmail.com';
    
    if (req.user.email !== adminEmail) {
      console.warn(`Unauthorized admin access attempt from: ${req.user.email}`);
      return res.status(403).json({ error: 'Forbidden: Admin access required. Email mismatch.' });
    }
    
    console.log(`Admin verified: ${req.user.email}`);
    next();
  });
};


/**
 * Checks if a workspace has exceeded its usage limit for a specific resource,
 * and increments the usage counter atomically in a transaction if allowed.
 * 
 * @param {string} workspaceId - The workspace ID to verify
 * @param {'jobs' | 'candidates' | 'cvParsesThisMonth'} resource - The resource being added
 * @returns {Promise<{success: boolean, newUsage: number, limit: number}>}
 */
async function checkWorkspaceLimit(workspaceId, resource) {
  if (!workspaceId) {
    throw new Error('Workspace ID is required to verify limits');
  }

  const workspaceRef = db.collection('workspaces').doc(workspaceId);
  
  return db.runTransaction(async (transaction) => {
    const workspaceDoc = await transaction.get(workspaceRef);
    if (!workspaceDoc.exists) {
      throw new Error('Workspace not found');
    }
    
    const workspaceData = workspaceDoc.data();
    const planId = workspaceData.plan || 'free';
    
    const planRef = db.collection('plans').doc(planId);
    const planDoc = await transaction.get(planRef);
    
    // Fallback default values for plans if Firestore query fails/document doesn't exist
    let planData = { jobs: 5, candidates: 50, cvParsesPerMonth: 10 };
    if (planDoc.exists) {
      planData = planDoc.data();
    } else if (planId === 'pro') {
      planData = { jobs: 50, candidates: 500, cvParsesPerMonth: 100 };
    } else if (planId === 'team') {
      planData = { jobs: -1, candidates: -1, cvParsesPerMonth: -1 };
    }
    
    const limit = resource === 'cvParsesThisMonth' ? planData.cvParsesPerMonth : planData[resource];
    const currentUsage = (workspaceData.usage && workspaceData.usage[resource]) || 0;
    
    if (limit !== -1 && currentUsage >= limit) {
      const error = new Error(`Hạn mức sử dụng của bạn đã vượt quá giới hạn cho phép của gói ${planId.toUpperCase()} (${limit}). Vui lòng nâng cấp gói dịch vụ.`);
      error.code = 'LIMIT_EXCEEDED';
      error.resource = resource;
      error.limit = limit;
      error.plan = planId;
      throw error;
    }
    
    // Atomically increment the specific resource usage field in the map
    transaction.update(workspaceRef, {
      [`usage.${resource}`]: admin.firestore.FieldValue.increment(1)
    });
    
    return { 
      success: true, 
      newUsage: currentUsage + 1, 
      limit 
    };
  });
}


// Admin Endpoint: List Users & Stats
app.get('/api/admin/users', verifyAdmin, async (req, res) => {
  try {
    const db = admin.firestore();
    const listUsersResult = await admin.auth().listUsers(1000);
    
    // Process records
    const usersWithStats = await Promise.all(listUsersResult.users.map(async (userRecord) => {
      // Aggregate Queries: count jobs & candidates by this user
      const jobsQuery = db.collection('jobs').where('createdBy', '==', userRecord.uid);
      const candsQuery = db.collection('candidates').where('createdBy', '==', userRecord.uid);

      const [jobsSnapshot, candsSnapshot] = await Promise.all([
        jobsQuery.count().get(),
        candsQuery.count().get()
      ]);

      return {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || 'Unnamed User',
        creationTime: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime,
        jobsCount: jobsSnapshot.data().count,
        candidatesCount: candsSnapshot.data().count
      };
    }));

    res.json(usersWithStats);
  } catch (error) {
    console.error("Fetch admin users error:", error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// Admin Endpoint: Cascade Delete User & Data
app.delete('/api/admin/users/:uid', verifyAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    const db = admin.firestore();
    
    // Delete associated applications, jobs, and candidates
    const userJobDocs = await db.collection('jobs').where('createdBy', '==', uid).get();
    const userCandidateDocs = await db.collection('candidates').where('createdBy', '==', uid).get();
    
    const batch = db.batch();
    
    for (const candDoc of userCandidateDocs.docs) {
       const apps = await db.collection('applications').where('candidateId', '==', candDoc.id).get();
       apps.forEach(appDoc => batch.delete(appDoc.ref));
       batch.delete(candDoc.ref);
    }
    
    for (const jobDoc of userJobDocs.docs) {
       const apps = await db.collection('applications').where('jobId', '==', jobDoc.id).get();
       apps.forEach(appDoc => batch.delete(appDoc.ref));
       batch.delete(jobDoc.ref);
    }

    await batch.commit();
    await admin.auth().deleteUser(uid);

    res.json({ success: true, message: 'User and all associated data deleted.' });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: 'Failed to delete user and data.', details: error.message });
  }
});

app.get('/api/admin/upgrade-requests', verifyAdmin, async (req, res) => {
  try {
    await listUpgradeRequests(req, res);
  } catch (error) {
    console.error('Admin list upgrade-requests error:', error);
    res.status(500).json({ error: 'Failed to list upgrade requests', details: error.message });
  }
});

app.patch('/api/admin/upgrade-requests/:id', verifyAdmin, async (req, res) => {
  try {
    await reviewUpgradeRequest(req, res, resend);
  } catch (error) {
    console.error('Admin review upgrade-request error:', error);
    res.status(500).json({ error: 'Failed to review request', details: error.message });
  }
});

app.get('/api/admin/workspaces', verifyAdmin, async (req, res) => {
  try {
    await listAdminWorkspaces(req, res);
  } catch (error) {
    console.error('Admin list workspaces error:', error);
    res.status(500).json({ error: 'Failed to list workspaces', details: error.message });
  }
});

app.patch('/api/admin/workspaces/:workspaceId/plan', verifyAdmin, async (req, res) => {
  try {
    await setWorkspacePlan(req, res, resend);
  } catch (error) {
    console.error('Admin set workspace plan error:', error);
    res.status(500).json({ error: 'Failed to update plan', details: error.message });
  }
});

app.post('/api/parse-cv', authenticate, async (req, res) => {
  try {
    const { cvUrl, workspaceId } = req.body;
    if (!cvUrl) return res.status(400).json({ error: 'cvUrl is required' });

    // Validate limit for cvParsesThisMonth
    if (workspaceId) {
      try {
        await checkWorkspaceLimit(workspaceId, 'cvParsesThisMonth');
      } catch (limitError) {
        if (limitError.code === 'LIMIT_EXCEEDED') {
          return res.status(403).json({
            error: limitError.message,
            code: 'LIMIT_EXCEEDED',
            resource: 'cvParsesThisMonth',
            limit: limitError.limit,
            plan: limitError.plan
          });
        }
        throw limitError;
      }
    }

    if (!genAI) {
       console.log("No GEMINI_API_KEY found. Sending dummy parsed data.");
       return res.json({
          email: 'dummy@example.com',
          phone: '+1 555-5555',
          currentTitle: 'Unparsed Candidate (Add Google API Key)',
          currentCompany: 'Mock Company',
          yearsExperience: 0,
          location: 'Unknown',
          skills: ['Please', 'add', 'GEMINI_API_KEY'],
          education: 'Unknown',
          certifications: 'Unknown',
          parsedResume: 'This is dummy fallback text because the server lacks an AI key.'
       });
    }

    // 1. Download the file from the Firebase Storage URL into a buffer
    console.log("Downloading CV from Storage URL:", cvUrl);
    const response = await fetch(cvUrl);
    if (!response.ok) throw new Error(`Failed to download CV: ${response.statusText}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log(`Downloaded buffer size: ${buffer.length} bytes`);
    if (buffer.length === 0) throw new Error("Downloaded CV buffer is empty.");

    // 2. Determine file type from URL
    const urlLower = cvUrl.toLowerCase();
    const isDocx = urlLower.includes('.docx');
    const isTxt = urlLower.includes('.txt');
    let aiInput;

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const basePrompt = `
      You are an expert HR recruiter. Analyze the provided resume and extract the following information into a strict JSON format. 
      Only return the JSON block, no markdown, no introduction.
      JSON Schema required:
      {
        "fullName": "string (extract from document text)",
        "email": "string",
        "phone": "string",
        "currentTitle": "string",
        "currentCompany": "string",
        "yearsExperience": "number",
        "location": "string",
        "skills": ["string", "string"],
        "education": "string",
        "certifications": "string",
        "parsedResume": "A 3-5 sentence professional summary of their background"
      }
    `;

    if (isDocx) {
      console.log("DOCX detected. Extracting text via Mammoth...");
      const result = await mammoth.extractRawText({ buffer });
      const extractedText = result.value;
      aiInput = [basePrompt + "\n\nResume Text Content:\n" + extractedText];
    } else if (isTxt) {
      console.log("TXT detected. Reading as UTF-8...");
      const extractedText = buffer.toString('utf8');
      aiInput = [basePrompt + "\n\nResume Text Content:\n" + extractedText];
    } else {
      console.log("PDF/Other detected. Passing as inlineData...");
      aiInput = [
        basePrompt,
        {
          inlineData: {
            data: buffer.toString("base64"),
            mimeType: "application/pdf"
          }
        }
      ];
    }

    // 3. Pass to Gemini 2026 Spec Model
    console.log("Calling Gemini 3 Flash (v1beta/2026-spec)...");
    const result = await model.generateContent(aiInput);

    const responseText = result.response.text();
    const parsedData = cleanJsonResponse(responseText);

    console.log("Parse successful for Candidate:", parsedData.fullName || 'Anonymous');
    res.json(parsedData);
  } catch (error) {
    console.error('Error parsing CV:', error.message || error);
    res.status(500).json({ error: 'Failed to parse CV with AI', details: error.message || error.toString() });
  }
});

app.post('/api/compare', async (req, res) => {
  try {
    const { candidate, job } = req.body;
    if (!candidate || !job) return res.status(400).json({ error: 'Data required' });

    if (!genAI) {
      return res.json({
        fitScore: 50,
        strengths: ['Add GEMINI_API_KEY to test real comparison'],
        gaps: ['Requires real AI setup'],
        aiSummary: 'Fallback comparison mode.'
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const prompt = `
      You are an expert technical recruiter matching a candidate to a job.
      Candidate Data: ${JSON.stringify(candidate)}
      Job Data: ${JSON.stringify(job)}
      
      Compare their skills, experience, and title to the job requirements.
      Output ONLY strict JSON matching this schema exactly:
      {
        "fitScore": number (0-100),
        "strengths": ["string", "string"],
        "gaps": ["string", "string"],
        "aiSummary": "A concise 3-sentence summary of why they fit or do not fit"
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const comparisonResult = cleanJsonResponse(responseText);
    res.json(comparisonResult);

  } catch (error) {
    console.error('Error comparing:', error.message || error);
    res.status(500).json({ error: 'Failed comparison', details: error.message || error.toString() });
  }
});

// Email endpoint
app.post('/api/send-email', authenticate, async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;
    
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ error: 'Missing required fields (to, subject, and either html or text)' });
    }

    if (!resend) {
      console.warn("RESEND_API_KEY not found. Skipping email send.");
      return res.json({ 
        success: true, 
        message: 'Resend API Key missing. Email not sent, but request was valid (mock mode).',
        mock: true 
      });
    }

    console.log(`Sending email to: ${to} | Subject: ${subject}`);
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text
    });

    if (error) {
      console.error("Resend API Error:", error);
      return res.status(400).json({ error: 'Resend API Error', details: error });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error in send-email endpoint:', error);
    res.status(500).json({ error: 'Internal server error while sending email', details: error.message });
  }
});


/**
 * Public Support Email Endpoint
 */
app.post('/api/support', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Tất cả các trường đều là bắt buộc.' });
    }

    const recipient = 'thanhnghiep.top@gmail.com';
    const supportSubject = `[SUPPORT] ${subject} - Từ: ${name}`;
    const supportHtml = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #007bff;">Yêu cầu hỗ trợ mới</h2>
        <p><strong>Họ tên:</strong> ${name}</p>
        <p><strong>Email khách hàng:</strong> ${email}</p>
        <p><strong>Chủ đề:</strong> ${subject}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p><strong>Nội dung:</strong></p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; white-space: pre-wrap;">
          ${message}
        </div>
      </div>
    `;

    if (!resend) {
      console.log('Mock support email (Local):', { recipient, supportSubject });
      return res.json({ 
        success: true, 
        message: 'Request received (Mock mode - RESEND_API_KEY missing).',
        mock: true 
      });
    }

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: [recipient],
      replyTo: email,
      subject: supportSubject,
      html: supportHtml
    });

    if (error) {
      return res.status(400).json({ error: 'Resend API Error', details: error });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error in /support endpoint:', error);
    res.status(500).json({ error: 'Lỗi hệ thống khi gửi yêu cầu hỗ trợ.', details: error.message });
  }
});

/**
 * Workspace plan upgrade request
 */
app.post('/api/upgrade-request', authenticate, async (req, res) => {
  try {
    await handleUpgradeRequest(req, res, resend);
  } catch (error) {
    console.error('Error in /api/upgrade-request:', error);
    res.status(500).json({
      error: 'Failed to submit upgrade request',
      details: error.message,
    });
  }
});

/**
 * Endpoint to create a job securely, checking limits first.
 */
app.post('/api/jobs', authenticate, async (req, res) => {
  try {
    const { workspaceId, jobData } = req.body;
    if (!workspaceId || !jobData) {
      return res.status(400).json({ error: 'workspaceId and jobData are required' });
    }

    // 1. Check workspace limit
    try {
      await checkWorkspaceLimit(workspaceId, 'jobs');
    } catch (limitError) {
      if (limitError.code === 'LIMIT_EXCEEDED') {
        return res.status(403).json({
          error: limitError.message,
          code: 'LIMIT_EXCEEDED',
          resource: 'jobs',
          limit: limitError.limit,
          plan: limitError.plan
        });
      }
      throw limitError;
    }

    // 2. Create Job Document
    const jobRef = db.collection('jobs').doc();
    const newJob = {
      ...jobData,
      workspaceId,
      createdBy: req.user.uid,
      status: jobData.status || 'Active',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await jobRef.set(newJob);

    res.json({ id: jobRef.id, ...newJob });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job', details: error.message });
  }
});

/**
 * Endpoint to create a candidate securely, checking limits first.
 */
app.post('/api/candidates', authenticate, async (req, res) => {
  try {
    const { workspaceId, candidateData } = req.body;
    if (!workspaceId || !candidateData) {
      return res.status(400).json({ error: 'workspaceId and candidateData are required' });
    }

    // 1. Check workspace limit
    try {
      await checkWorkspaceLimit(workspaceId, 'candidates');
    } catch (limitError) {
      if (limitError.code === 'LIMIT_EXCEEDED') {
        return res.status(403).json({
          error: limitError.message,
          code: 'LIMIT_EXCEEDED',
          resource: 'candidates',
          limit: limitError.limit,
          plan: limitError.plan
        });
      }
      throw limitError;
    }

    // 2. Create Candidate Document
    const candidateRef = db.collection('candidates').doc();
    const newCandidate = {
      ...candidateData,
      workspaceId,
      createdBy: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await candidateRef.set(newCandidate);

    res.json({ id: candidateRef.id, ...newCandidate });
  } catch (error) {
    console.error('Error creating candidate:', error);
    res.status(500).json({ error: 'Failed to create candidate', details: error.message });
  }
});

// Workspace Usage Synchronization Endpoint (Self-Healing)
app.post('/api/workspaces/:workspaceId/sync-usage', authenticate, async (req, res) => {
  const { workspaceId } = req.params;
  try {
    const firestoreDb = admin.firestore();
    
    // 1. Fetch counts
    const jobsCountSnap = await firestoreDb.collection('jobs').where('workspaceId', '==', workspaceId).count().get();
    const candidatesCountSnap = await firestoreDb.collection('candidates').where('workspaceId', '==', workspaceId).count().get();
    
    const actualJobs = jobsCountSnap.data().count;
    const actualCandidates = candidatesCountSnap.data().count;
    
    // 2. Fetch current workspace data
    const wsRef = firestoreDb.collection('workspaces').doc(workspaceId);
    const wsDoc = await wsRef.get();
    
    if (!wsDoc.exists) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    
    const wsData = wsDoc.data();
    const currentUsage = wsData.usage || {};
    const cvParses = currentUsage.cvParsesThisMonth || 0;
    
    // 3. Update the workspace document using set with merge: true to safely handle missing map/fields
    const updateData = {
      usage: {
        jobs: actualJobs,
        candidates: actualCandidates,
        cvParsesThisMonth: cvParses
      }
    };
    
    if (!wsData.plan) {
      updateData.plan = 'free';
    }
    
    await wsRef.set(updateData, { merge: true });
    
    console.log(`[Sync] Workspace ${workspaceId} synced: jobs=${actualJobs}, candidates=${actualCandidates}`);
    res.json({
      success: true,
      usage: {
        jobs: actualJobs,
        candidates: actualCandidates,
        cvParsesThisMonth: cvParses
      }
    });
  } catch (error) {
    console.error("Error syncing workspace usage:", error);
    res.status(500).json({ error: 'Failed to sync workspace usage', details: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`AI Proxy Server running on port ${PORT}`);
});
