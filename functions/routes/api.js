const express = require('express');
const mammoth = require('mammoth');
const { Resend } = require('resend');
const admin = require('firebase-admin');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { authenticate, validateWorkspace } = require('../middleware/auth');
const { getModel, cleanJsonResponse, genAI } = require('../utils/ai');
const { checkWorkspaceLimit } = require('../utils/limits');
const { handleUpgradeRequest } = require('../utils/upgradeRequest');

const router = express.Router();

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// --- Security Utilities ---

/**
 * Escape HTML special characters to prevent HTML injection
 */
const escapeHtml = (unsafe) => {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');
};

/**
 * Strip internal error details in production to prevent information disclosure
 */
const sanitizeError = (err) => {
  const isDev = process.env.FUNCTIONS_EMULATOR === 'true' || !process.env.K_SERVICE;
  if (isDev) {
    return { error: err.message || 'An unexpected error occurred', details: err.message };
  }
  return { error: 'An internal server error occurred' };
};

/**
 * Firestore-based rate limiter for public endpoints.
 * Stores rate limit counters in Firestore with TTL-based cleanup via scheduled function.
 * This avoids the cold-start reset issue of in-memory rate limiters.
 */
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5;

const rateLimiter = async (req, res, next) => {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  const db = getFirestore();
  const limitRef = db.collection('rateLimits').doc(`support_${ip.replace(/[.\[\]:]/g, '_')}`);

  try {
    await db.runTransaction(async (transaction) => {
      const docSnap = await transaction.get(limitRef);
      
      let timestamps = [];
      if (docSnap.exists) {
        timestamps = (docSnap.data().timestamps || []).filter(ts => ts > windowStart);
      }

      if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
        const retryAfter = Math.ceil((timestamps[0] + RATE_LIMIT_WINDOW_MS - now) / 1000);
        throw Object.assign(new Error('Too many requests'), { 
          statusCode: 429, 
          retryAfter: Math.max(retryAfter, 1)
        });
      }

      timestamps.push(now);
      transaction.set(limitRef, {
        timestamps,
        expiresAt: new Date(now + RATE_LIMIT_WINDOW_MS * 2), // TTL for cleanup
        ip
      });
    });

    next();
  } catch (error) {
    if (error.statusCode === 429) {
      return res.status(429).json({
        error: 'Too many requests. Please try again later.',
        retryAfter: error.retryAfter || 60
      });
    }
    // If Firestore fails, fall through gracefully (don't block legitimate traffic)
    console.error('Rate limiter error (falling through):', error);
    next();
  }
};

// --- API Routes ---

router.post('/parse-cv', authenticate, validateWorkspace(['owner', 'admin', 'editor']), async (req, res) => {
  try {
    const { cvUrl } = req.body;
    if (!cvUrl) return res.status(400).json({ error: 'cvUrl is required' });

    // Validate limit for cvParsesThisMonth
    const db = getFirestore();
    try {
      await checkWorkspaceLimit(db, req.workspaceId, 'cvParsesThisMonth');
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

    if (!genAI) {
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

    const response = await fetch(cvUrl);
    if (!response.ok) throw new Error(`Failed to download CV: ${response.statusText}`);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) throw new Error("Downloaded CV buffer is empty.");

    const urlLower = cvUrl.toLowerCase();
    const isDocx = urlLower.includes('.docx');
    const isTxt = urlLower.includes('.txt');
    let aiInput;

    const model = getModel();
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
      const result = await mammoth.extractRawText({ buffer });
      const extractedText = result.value;
      aiInput = [basePrompt + "\n\nResume Text Content:\n" + extractedText];
    } else if (isTxt) {
      const extractedText = buffer.toString('utf8');
      aiInput = [basePrompt + "\n\nResume Text Content:\n" + extractedText];
    } else {
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

    const result = await model.generateContent(aiInput);
    const responseText = result.response.text();
    const parsedData = cleanJsonResponse(responseText);

    res.json(parsedData);
  } catch (error) {
    console.error('Error parsing CV:', error);
    res.status(500).json(sanitizeError(error));
  }
});

router.post('/compare', authenticate, validateWorkspace(['owner', 'admin', 'editor', 'viewer']), async (req, res) => {
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

    const model = getModel();
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
    console.error('Error comparing:', error);
    res.status(500).json(sanitizeError(error));
  }
});

router.post('/send-email', authenticate, async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;

    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ error: 'Missing required fields (to, subject, and either html or text)' });
    }

    if (!resend) {
      return res.json({
        success: true,
        message: 'Resend API Key missing. Email not sent, but request was valid (mock mode).',
        mock: true
      });
    }

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text
    });

    if (error) {
      return res.status(400).json({ error: 'Resend API Error', details: error });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error in send-email endpoint:', error);
    res.status(500).json(sanitizeError(error));
  }
});

/**
 * Public Support Email Endpoint — rate-limited, HTML-escaped
 */
router.post('/support', rateLimiter, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Tất cả các trường đều là bắt buộc.' });
    }

    const recipient = 'thanhnghiep.top@gmail.com';
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);
    const supportSubject = `[SUPPORT] ${subject} - Từ: ${name}`;
    const supportHtml = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #007bff;">Yêu cầu hỗ trợ mới</h2>
        <p><strong>Họ tên:</strong> ${safeName}</p>
        <p><strong>Email khách hàng:</strong> ${safeEmail}</p>
        <p><strong>Chủ đề:</strong> ${safeSubject}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p><strong>Nội dung:</strong></p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; white-space: pre-wrap;">
          ${safeMessage}
        </div>
      </div>
    `;

    if (!resend) {
      console.log('Mock support email:', { recipient, supportSubject, safeName, safeEmail });
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
      console.error('Resend error in /support:', error);
      return res.status(400).json({ error: 'Lỗi khi gửi email hỗ trợ.', details: error });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error in /support endpoint:', error);
    res.status(500).json(sanitizeError(error));
  }
});

/**
 * Endpoint to create a job securely, checking limits first.
 */
router.post('/jobs', authenticate, validateWorkspace(['owner', 'admin', 'editor']), async (req, res) => {
  try {
    const { workspaceId, jobData } = req.body;
    if (!workspaceId || !jobData) {
      return res.status(400).json({ error: 'workspaceId and jobData are required' });
    }

    const db = getFirestore();

    // 1. Check workspace limit
    try {
      await checkWorkspaceLimit(db, workspaceId, 'jobs');
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
      createdAt: FieldValue.serverTimestamp()
    };

    await jobRef.set(newJob);

    res.json({ id: jobRef.id, ...newJob });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json(sanitizeError(error));
  }
});

/**
 * Endpoint to create a candidate securely, checking limits first.
 */
router.post('/candidates', authenticate, validateWorkspace(['owner', 'admin', 'editor']), async (req, res) => {
  try {
    const { workspaceId, candidateData } = req.body;
    if (!workspaceId || !candidateData) {
      return res.status(400).json({ error: 'workspaceId and candidateData are required' });
    }

    const db = getFirestore();

    // 1. Check workspace limit
    try {
      await checkWorkspaceLimit(db, workspaceId, 'candidates');
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
      createdAt: FieldValue.serverTimestamp()
    };

    await candidateRef.set(newCandidate);

    res.json({ id: candidateRef.id, ...newCandidate });
  } catch (error) {
    console.error('Error creating candidate:', error);
    res.status(500).json(sanitizeError(error));
  }
});

/**
 * Workspace plan upgrade request — emails owners/admins + billing, confirms to requester.
 */
router.post('/upgrade-request', authenticate, async (req, res) => {
  try {
    await handleUpgradeRequest(req, res, resend);
  } catch (error) {
    console.error('Error in /upgrade-request:', error);
    res.status(500).json(sanitizeError(error));
  }
});

// Workspace Usage Synchronization Endpoint (Self-Healing)
router.post('/workspaces/:workspaceId/sync-usage', authenticate, validateWorkspace(['owner', 'admin', 'editor', 'viewer']), async (req, res) => {
  const { workspaceId } = req.params;
  try {
    const db = getFirestore();

    // Fetch counts with graceful fallback for missing indexes
    let actualJobs = 0;
    let actualCandidates = 0;

    try {
      const jobsSnap = await db.collection('jobs').where('workspaceId', '==', workspaceId).get();
      actualJobs = jobsSnap.size;
    } catch (err) {
      console.warn(`[Sync] Could not count jobs for ${workspaceId}:`, err.message);
    }

    try {
      const candSnap = await db.collection('candidates').where('workspaceId', '==', workspaceId).get();
      actualCandidates = candSnap.size;
    } catch (err) {
      console.warn(`[Sync] Could not count candidates for ${workspaceId}:`, err.message);
    }

    // Fetch current workspace data
    const wsRef = db.collection('workspaces').doc(workspaceId);
    const wsDoc = await wsRef.get();

    if (!wsDoc.exists) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    const wsData = wsDoc.data();
    const currentUsage = wsData.usage || {};
    const cvParses = currentUsage.cvParsesThisMonth || 0;

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
    console.log(`[Sync] Workspace ${workspaceId}: jobs=${actualJobs}, candidates=${actualCandidates}`);
    res.json({ success: true, usage: { jobs: actualJobs, candidates: actualCandidates, cvParsesThisMonth: cvParses } });
  } catch (error) {
    console.error("Error syncing workspace usage:", error);
    res.status(500).json(sanitizeError(error));
  }
});

module.exports = router;