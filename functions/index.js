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

// Admin Middleware: Ensures caller is the authenticated admin.
const verifyAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization token' });
  }
  
  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    // Use environment variable for admin email check
    const adminEmail = process.env.ADMIN_EMAIL || 'thanhnghiep@gmail.com';
    if (decodedToken.email !== adminEmail) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Admin verify error:", error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
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

app.post('/api/parse-cv', async (req, res) => {
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

    const isDocx = cvUrl.toLowerCase().includes('.docx') || cvUrl.toLowerCase().includes('.doc');
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
    } else {
      console.log("PDF detected. Passing as inlineData...");
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

    console.log("Calling Gemini 3 Flash...");
    const result = await model.generateContent(aiInput);

    const responseText = result.response.text();
    const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(jsonStr);

    console.log("Parse successful:", parsedData.fullName);
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
    const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    res.json(JSON.parse(jsonStr));

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
