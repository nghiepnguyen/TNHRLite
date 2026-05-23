const express = require('express');
const admin = require('firebase-admin');
const { Resend } = require('resend');
const { verifyAdmin } = require('../middleware/auth');
const {
  listUpgradeRequests,
  reviewUpgradeRequest,
  listAdminWorkspaces,
  setWorkspacePlan,
} = require('../utils/adminBilling');

const router = express.Router();
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Admin Endpoint: List Users & Stats
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const db = admin.firestore();
    const listUsersResult = await admin.auth().listUsers(1000);
    
    // Process records
    const usersWithStats = await Promise.all(listUsersResult.users.map(async (userRecord) => {
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
router.delete('/users/:uid', verifyAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    const db = admin.firestore();
    
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

router.get('/upgrade-requests', verifyAdmin, async (req, res) => {
  try {
    await listUpgradeRequests(req, res);
  } catch (error) {
    console.error('Admin list upgrade-requests error:', error);
    res.status(500).json({ error: 'Failed to list upgrade requests', details: error.message });
  }
});

router.patch('/upgrade-requests/:id', verifyAdmin, async (req, res) => {
  try {
    await reviewUpgradeRequest(req, res, resend);
  } catch (error) {
    console.error('Admin review upgrade-request error:', error);
    res.status(500).json({ error: 'Failed to review request', details: error.message });
  }
});

router.get('/workspaces', verifyAdmin, async (req, res) => {
  try {
    await listAdminWorkspaces(req, res);
  } catch (error) {
    console.error('Admin list workspaces error:', error);
    res.status(500).json({ error: 'Failed to list workspaces', details: error.message });
  }
});

router.patch('/workspaces/:workspaceId/plan', verifyAdmin, async (req, res) => {
  try {
    await setWorkspacePlan(req, res, resend);
  } catch (error) {
    console.error('Admin set workspace plan error:', error);
    res.status(500).json({ error: 'Failed to update plan', details: error.message });
  }
});

module.exports = router;
