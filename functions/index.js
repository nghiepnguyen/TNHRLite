const { onRequest } = require("firebase-functions/v2/https");
const express = require('express');
const cors = require('cors');
const mammoth = require('mammoth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const admin = require('firebase-admin');

// Initialize Firebase Admin globally
admin.initializeApp();

// In Firebase Functions, environment variables are set differently,
// but for standard Secrets Manager integration or process.env (Gen 2):
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const app = express();

// Permissive CORS for the function
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

/**
 * Utility to extract JSON from AI response, handling markdown blocks or extra chatter.
 */
function cleanJsonResponse(text) {
  try {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, text];
    const rawJson = jsonMatch[1].trim();
    return JSON.parse(rawJson);
  } catch (e) {
    console.error("Critical: Failed to extract valid JSON from Gemini response. Raw text:", text);
    throw new Error("AI returned an invalid data format.");
  }
}

// --- AUTH & RBAC MIDDLEWARE ---

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
    console.error("Auth verify error:", error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

/**
 * Admin Middleware: Ensures caller is a global administrator.
 */
const verifyAdmin = async (req, res, next) => {
  // Use authenticate first, then check email
  await authenticate(req, res, async () => {
    const adminEmail = process.env.ADMIN_EMAIL || 'thanhnghiep@gmail.com';
    if (req.user.email !== adminEmail) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
  });
};

/**
 * Workspace Authorization: Checks membership and role in a specific workspace.
 * @param {string[]} requiredRoles - List of roles permitted for this action.
 */
const validateWorkspace = (requiredRoles = []) => async (req, res, next) => {
  const { workspaceId } = req.body; // Expecting workspaceId in JSON body
  const userId = req.user.uid;

  if (!workspaceId) {
    return res.status(400).json({ error: 'workspaceId is required in request body' });
  }

  try {
    const db = admin.firestore();
    
    // 1. Check if workspace exists
    const wsSnap = await db.collection('workspaces').doc(workspaceId).get();
    if (!wsSnap.exists) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // 2. Check membership and role
    // Using the established top-level collection with UID_WSID keys
    const memberId = `${userId}_${workspaceId}`;
    const memberSnap = await db.collection('workspaceMembers').doc(memberId).get();

    if (!memberSnap.exists) {
      return res.status(403).json({ error: 'Forbidden: You are not a member of this workspace' });
    }

    const memberData = memberSnap.data();
    if (requiredRoles.length > 0 && !requiredRoles.includes(memberData.role)) {
      return res.status(403).json({ error: `Forbidden: Sufficient role required (${requiredRoles.join(', ')})` });
    }

    // Attach workspace/member data for the handler
    req.workspaceId = workspaceId;
    req.member = memberData;
    next();
  } catch (error) {
    console.error("Workspace validation error:", error);
    res.status(500).json({ error: 'Internal security check failure' });
  }
};

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
    
    // 1. Delete associated Applications (where createdBy implies the candidate or job belonged to them)
    // To strictly delete applications linked to this user's jobs or candidates, we first find their items.
    const userJobDocs = await db.collection('jobs').where('createdBy', '==', uid).get();
    const userCandidateDocs = await db.collection('candidates').where('createdBy', '==', uid).get();
    
    const batch = db.batch();
    
    // Optionally: fetch apps by candidate id and delete
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

    // 2. Delete the actual Auth User
    await admin.auth().deleteUser(uid);

    res.json({ success: true, message: 'User and all associated data deleted.' });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: 'Failed to delete user and data.', details: error.message });
  }
});

app.post('/api/parse-cv', authenticate, validateWorkspace(['owner', 'admin', 'editor']), async (req, res) => {
  try {
    const { cvUrl } = req.body;
    if (!cvUrl) return res.status(400).json({ error: 'cvUrl is required' });

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

    console.log("Downloading CV from Storage URL:", cvUrl);
    const response = await fetch(cvUrl);
    if (!response.ok) throw new Error(`Failed to download CV: ${response.statusText}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log(`Downloaded buffer size: ${buffer.length} bytes`);
    if (buffer.length === 0) throw new Error("Downloaded CV buffer is empty.");

    const urlLower = cvUrl.toLowerCase();
    const isDocx = urlLower.includes('.docx');
    const isTxt = urlLower.includes('.txt');
    let aiInput;

    const model = genAI.getGenerativeModel(
      { model: "gemini-3-flash-preview" },
      { apiVersion: "v1beta" }
    );
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

    console.log("Calling Gemini 3 Flash (Live Spec)...");
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

app.post('/api/compare', authenticate, validateWorkspace(['owner', 'admin', 'editor', 'viewer']), async (req, res) => {
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

    const model = genAI.getGenerativeModel(
      { model: "gemini-3-flash-preview" },
      { apiVersion: "v1beta" }
    );
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

// Export the Express app as a Cloud Function
exports.api = onRequest({
  timeoutSeconds: 120, // Give Gemini time to process
  cors: true,
  maxInstances: 10
}, app);
