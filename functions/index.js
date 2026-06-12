const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onCall } = require("firebase-functions/v2/https");
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

// Initialize Firebase Admin globally
admin.initializeApp();

// Auto-seed plans collection
const db = getFirestore();
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
// Skip during `firebase deploy` local code analysis (no ADC on developer machine).
if (process.env.K_SERVICE || process.env.FUNCTIONS_EMULATOR === 'true') {
  seedPlans();
}

const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');

const app = express();

// Trust proxy for accurate client IP in rate limiting (Cloud Functions runs behind proxy)
app.set('trust proxy', true);

// Restricted CORS — allow production domains and localhost for development
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL || 'https://tnhrlite.com',
  'https://tnhrlite.web.app',
  'https://tnhrlite.firebaseapp.com',
  'http://localhost:5173',
  'http://localhost:3001',
  'http://127.0.0.1:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, mobile, Postman, etc.)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    // Allow any localhost port for development
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    console.warn(`CORS blocked origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Body parser with size limit to prevent DoS via oversized payloads
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api', apiRoutes);

// Export the Express app as a Cloud Function
exports.api = onRequest({
  timeoutSeconds: 120, // Give Gemini time to process
  cors: true,
  maxInstances: 10,
  secrets: ["GEMINI_API_KEY", "RESEND_API_KEY", "RESEND_FROM_EMAIL"]
}, app);

// Scheduled function to reset monthly AI resume parses count on 1st of every month
exports.resetMonthlyUsage = onSchedule("0 0 1 * *", async (_event) => {
  const workspacesRef = db.collection('workspaces');
  
  try {
    const snapshot = await workspacesRef.get();
    const batch = db.batch();
    let count = 0;
    
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const currentUsage = data.usage || {};
      
      // Only reset if usage is actually greater than 0
      if (currentUsage.cvParsesThisMonth && currentUsage.cvParsesThisMonth > 0) {
        const newUsage = {
          ...currentUsage,
          cvParsesThisMonth: 0
        };
        
        batch.update(doc.ref, {
          usage: newUsage,
          usageResetAt: FieldValue.serverTimestamp()
        });
        count++;
      }
    });
    
    if (count > 0) {
      await batch.commit();
    }
    console.log(`Successfully reset cvParsesThisMonth for ${count} workspaces.`);
  } catch (error) {
    console.error("Error resetting monthly usage:", error);
  }
});

// Callable function: Cascade-delete all related data when a workspace is deleted.
// Called by the client BEFORE deleting the workspace document.
// (Firestore triggers not available in asia-southeast3 region for this project)
exports.deleteWorkspaceCascade = onCall({
  cors: [/tnhrlite\.com$/, /tnhrlite\.web\.app$/, /tnhrlite\.firebaseapp\.com$/, /localhost:\d+$/],
  secrets: []
}, async (request) => {
  const workspaceId = request.data?.workspaceId;
  if (!workspaceId) {
    throw new Error('workspaceId is required');
  }

  // Verify caller is workspace owner
  const callerUid = request.auth?.uid;
  if (!callerUid) {
    throw new Error('Authentication required');
  }

  const wsRef = db.collection('workspaces').doc(workspaceId);
  const wsDoc = await wsRef.get();
  if (!wsDoc.exists) {
    throw new Error('Workspace not found');
  }
  if (wsDoc.data().ownerId !== callerUid) {
    throw new Error('Only the workspace owner can delete a workspace');
  }

  console.log(`[Cascade] Deleting workspace ${workspaceId} and all related data...`);

  const collections = ['jobs', 'candidates', 'applications', 'invites', 'activities'];
  let totalDeleted = 0;

  // 1. Delete all scoped data collections
  for (const collName of collections) {
    try {
      const snapshot = await db.collection(collName)
        .where('workspaceId', '==', workspaceId)
        .get();

      if (snapshot.empty) continue;

      // Batch in groups of 500 (Firestore limit)
      for (let i = 0; i < snapshot.docs.length; i += 500) {
        const batch = db.batch();
        const chunk = snapshot.docs.slice(i, i + 500);
        chunk.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
      }
      
      totalDeleted += snapshot.size;
      console.log(`[Cascade] Deleted ${snapshot.size} documents from '${collName}'`);
    } catch (err) {
      console.error(`[Cascade] Error deleting from ${collName}:`, err);
      throw new Error(`Failed to delete ${collName}: ${err.message}`);
    }
  }

  // 2. Delete workspaceMembers
  try {
    const membersSnap = await db.collection('workspaceMembers')
      .where('workspaceId', '==', workspaceId)
      .get();

    if (!membersSnap.empty) {
      for (let i = 0; i < membersSnap.docs.length; i += 500) {
        const batch = db.batch();
        const chunk = membersSnap.docs.slice(i, i + 500);
        chunk.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
      }
      totalDeleted += membersSnap.size;
      console.log(`[Cascade] Deleted ${membersSnap.size} workspace member records`);
    }
  } catch (err) {
    console.error('[Cascade] Error deleting workspace members:', err);
    throw new Error(`Failed to delete workspace members: ${err.message}`);
  }

  // 3. Delete upgrade requests
  try {
    const requestsSnap = await db.collection('upgradeRequests')
      .where('workspaceId', '==', workspaceId)
      .get();

    if (!requestsSnap.empty) {
      const batch = db.batch();
      requestsSnap.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      totalDeleted += requestsSnap.size;
    }
  } catch (err) {
    console.error('[Cascade] Error deleting upgrade requests:', err);
  }

  // 4. Finally, delete the workspace document itself
  await wsRef.delete();

  console.log(`[Cascade] Workspace ${workspaceId} cleanup complete. Total deleted: ${totalDeleted} documents`);
  return { success: true, workspaceId, totalDeleted };
});

// Scheduled function: Clean up expired rate limit entries (hourly)
exports.cleanupRateLimits = onSchedule("0 * * * *", async (_event) => {
  const now = new Date();
  const rateLimitsRef = db.collection('rateLimits');
  
  try {
    const snapshot = await rateLimitsRef.where('expiresAt', '<', now).get();
    
    if (snapshot.empty) {
      console.log('[RateLimit Cleanup] No expired entries found.');
      return;
    }

    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    
    console.log(`[RateLimit Cleanup] Deleted ${snapshot.size} expired rate limit entries.`);
  } catch (error) {
    console.error('[RateLimit Cleanup] Error:', error);
  }
});
