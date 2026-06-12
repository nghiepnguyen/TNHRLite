const admin = require('firebase-admin');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

async function listUpgradeRequests(req, res) {
  const db = getFirestore();
  const statusFilter = req.query.status || 'pending';
  
  let query = db.collection('upgradeRequests').orderBy('createdAt', 'desc').limit(100);
  if (statusFilter !== 'all') {
    query = query.where('status', '==', statusFilter);
  }
  
  const snap = await query.get();
  res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
}

async function reviewUpgradeRequest(req, res, resend) {
  const { id } = req.params;
  const { action, adminNote } = req.body;
  
  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'action must be approve or reject' });
  }
  
  const db = getFirestore();
  const requestRef = db.collection('upgradeRequests').doc(id);
  const requestDoc = await requestRef.get();
  
  if (!requestDoc.exists) {
    return res.status(404).json({ error: 'Upgrade request not found' });
  }
  
  const requestData = requestDoc.data();
  if (requestData.status !== 'pending') {
    return res.status(400).json({ error: 'Request already processed' });
  }
  
  const updateData = {
    status: action === 'approve' ? 'approved' : 'rejected',
    reviewedAt: FieldValue.serverTimestamp(),
    reviewedBy: req.user.email,
    adminNote: adminNote || ''
  };
  
  if (action === 'approve') {
    const wsRef = db.collection('workspaces').doc(requestData.workspaceId);
    const wsDoc = await wsRef.get();
    if (!wsDoc.exists) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    
    await wsRef.update({
      plan: requestData.targetPlan,
      planUpdatedAt: FieldValue.serverTimestamp()
    });
    
    try {
      const ownerEmail = requestData.requestedByEmail;
      if (ownerEmail && resend) {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: [ownerEmail],
          subject: `[HR-Lite] Plan upgraded to ${requestData.targetPlanName}`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e2e8f0;border-radius:12px;">
            <h2 style="color:#2563eb;">Plan Upgrade Approved</h2>
            <p>Your workspace <strong>${requestData.workspaceName}</strong> has been upgraded to <strong>${requestData.targetPlanName}</strong>.</p>
          </div>`
        });
      }
    } catch (e) {
      console.warn('Failed to send upgrade approval email:', e);
    }
  }
  
  await requestRef.update(updateData);
  res.json({ success: true, id, action });
}

async function listAdminWorkspaces(req, res) {
  const db = getFirestore();
  const snap = await db.collection('workspaces').orderBy('name').limit(200).get();
  res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
}

async function setWorkspacePlan(req, res, resend) {
  const { workspaceId } = req.params;
  const { plan, note } = req.body;
  
  if (!['free', 'pro', 'team'].includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan' });
  }
  
  const db = getFirestore();
  const wsRef = db.collection('workspaces').doc(workspaceId);
  const wsDoc = await wsRef.get();
  
  if (!wsDoc.exists) {
    return res.status(404).json({ error: 'Workspace not found' });
  }
  
  await wsRef.update({
    plan,
    planUpdatedAt: FieldValue.serverTimestamp(),
    planNote: note || ''
  });
  
  res.json({ success: true, workspaceId, plan });
}

module.exports = {
  listUpgradeRequests,
  reviewUpgradeRequest,
  listAdminWorkspaces,
  setWorkspacePlan,
};