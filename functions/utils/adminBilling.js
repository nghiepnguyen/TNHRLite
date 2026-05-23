const admin = require('firebase-admin');

const VALID_PLANS = ['free', 'pro', 'team'];

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function notifyUser(db, userId, payload) {
  if (!userId) return;
  await db.collection('userNotifications').add({
    userId,
    title: payload.title,
    message: payload.message,
    type: payload.type || 'info',
    workspaceId: payload.workspaceId || null,
    workspaceName: payload.workspaceName || null,
    metadata: payload.metadata || {},
    status: 'unread',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function sendPlanChangeEmail(resend, { to, subject, html }) {
  if (!resend || !to) return;
  const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  const { error } = await resend.emails.send({ from, to: [to], subject, html });
  if (error) console.error('Plan change email error:', error);
}

/**
 * GET /admin/upgrade-requests?status=pending|approved|rejected|all
 */
async function listUpgradeRequests(req, res) {
  const db = admin.firestore();
  const statusFilter = req.query.status || 'pending';

  let snap;
  if (statusFilter === 'all') {
    snap = await db.collection('upgradeRequests').orderBy('createdAt', 'desc').limit(100).get();
  } else {
    snap = await db.collection('upgradeRequests').where('status', '==', statusFilter).limit(100).get();
  }

  const sortedDocs = [...snap.docs].sort((a, b) => {
    const ta = a.data().createdAt?.toMillis?.() || 0;
    const tb = b.data().createdAt?.toMillis?.() || 0;
    return tb - ta;
  });

  const requests = sortedDocs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString?.() || null,
      reviewedAt: data.reviewedAt?.toDate?.()?.toISOString?.() || null,
    };
  });

  res.json({ requests });
}

/**
 * PATCH /admin/upgrade-requests/:id
 * body: { action: 'approve'|'reject', adminNote?: string }
 */
async function reviewUpgradeRequest(req, res, resend) {
  const { id } = req.params;
  const { action, adminNote } = req.body || {};
  const reviewerEmail = req.user.email || 'admin';

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'action must be approve or reject' });
  }

  const db = admin.firestore();
  const requestRef = db.collection('upgradeRequests').doc(id);
  const requestSnap = await requestRef.get();

  if (!requestSnap.exists) {
    return res.status(404).json({ error: 'Upgrade request not found' });
  }

  const request = requestSnap.data();

  if (request.status !== 'pending') {
    return res.status(400).json({ error: `Request already ${request.status}` });
  }

  const now = admin.firestore.FieldValue.serverTimestamp();
  const updatePayload = {
    status: action === 'approve' ? 'approved' : 'rejected',
    reviewedBy: req.user.uid,
    reviewedByEmail: reviewerEmail,
    reviewedAt: now,
    adminNote: String(adminNote || '').trim().slice(0, 1000),
  };

  if (action === 'approve') {
    const wsRef = db.collection('workspaces').doc(request.workspaceId);
    const wsSnap = await wsRef.get();
    if (!wsSnap.exists) {
      return res.status(404).json({ error: 'Workspace no longer exists' });
    }

    await db.runTransaction(async (tx) => {
      tx.update(requestRef, updatePayload);
      tx.set(
        wsRef,
        { plan: request.targetPlan },
        { merge: true }
      );
    });
  } else {
    await requestRef.update(updatePayload);
  }

  const statusLabel = action === 'approve' ? 'approved' : 'rejected';
  const title =
    action === 'approve'
      ? 'Upgrade request approved'
      : 'Upgrade request declined';
  const message =
    action === 'approve'
      ? `Your workspace "${request.workspaceName}" is now on the ${request.targetPlanName || request.targetPlan} plan.`
      : `Your upgrade request for "${request.workspaceName}" was declined.${adminNote ? ` Note: ${adminNote}` : ''}`;

  await notifyUser(db, request.requestedBy, {
    title,
    message,
    type: action === 'approve' ? 'success' : 'warning',
    workspaceId: request.workspaceId,
    workspaceName: request.workspaceName,
    metadata: {
      action: action === 'approve' ? 'UPGRADE_APPROVED' : 'UPGRADE_REJECTED',
      requestId: id,
      targetPlan: request.targetPlan,
    },
  });

  if (request.requestedByEmail) {
    const emailHtml = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e2e8f0;border-radius:12px;">
        <h2 style="color:#2563eb;">${escapeHtml(title)}</h2>
        <p>${escapeHtml(message)}</p>
        <p><strong>Workspace:</strong> ${escapeHtml(request.workspaceName)}</p>
        <p><strong>Plan:</strong> ${escapeHtml(request.targetPlanName || request.targetPlan)}</p>
        ${adminNote ? `<p><strong>Admin note:</strong> ${escapeHtml(adminNote)}</p>` : ''}
      </div>
    `;
    await sendPlanChangeEmail(resend, {
      to: request.requestedByEmail,
      subject: `[HR-Lite] ${title}`,
      html: emailHtml,
    });
  }

  res.json({ success: true, status: statusLabel });
}

/**
 * GET /admin/workspaces — list workspaces with plan + usage for billing admin
 */
async function listAdminWorkspaces(req, res) {
  const db = admin.firestore();
  const snap = await db.collection('workspaces').orderBy('name').limit(200).get();

  const workspaces = await Promise.all(
    snap.docs.map(async (doc) => {
      const data = doc.data();
      let ownerEmail = null;
      if (data.ownerId) {
        const ownerSnap = await db.collection('users').doc(data.ownerId).get();
        if (ownerSnap.exists) ownerEmail = ownerSnap.data().email;
      }
      return {
        id: doc.id,
        name: data.name || 'Unnamed',
        plan: data.plan || 'free',
        usage: data.usage || { jobs: 0, candidates: 0, cvParsesThisMonth: 0 },
        ownerId: data.ownerId,
        ownerEmail,
      };
    })
  );

  res.json({ workspaces });
}

/**
 * PATCH /admin/workspaces/:workspaceId/plan
 * body: { plan: 'free'|'pro'|'team', note?: string }
 */
async function setWorkspacePlan(req, res, resend) {
  const { workspaceId } = req.params;
  const { plan, note } = req.body || {};
  const reviewerEmail = req.user.email || 'admin';

  if (!VALID_PLANS.includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan' });
  }

  const db = admin.firestore();
  const wsRef = db.collection('workspaces').doc(workspaceId);
  const wsSnap = await wsRef.get();

  if (!wsSnap.exists) {
    return res.status(404).json({ error: 'Workspace not found' });
  }

  const wsData = wsSnap.data();
  const previousPlan = wsData.plan || 'free';

  if (previousPlan === plan) {
    return res.json({ success: true, plan, unchanged: true });
  }

  await wsRef.set({ plan }, { merge: true });

  if (wsData.ownerId) {
    await notifyUser(db, wsData.ownerId, {
      title: 'Workspace plan updated',
      message: `An administrator changed "${wsData.name}" from ${previousPlan} to ${plan}.${note ? ` ${note}` : ''}`,
      type: 'info',
      workspaceId,
      workspaceName: wsData.name,
      metadata: {
        action: 'PLAN_CHANGED_BY_ADMIN',
        previousPlan,
        newPlan: plan,
      },
    });

    const ownerSnap = await db.collection('users').doc(wsData.ownerId).get();
    const ownerEmail = ownerSnap.exists ? ownerSnap.data().email : null;
    if (ownerEmail) {
      await sendPlanChangeEmail(resend, {
        to: ownerEmail,
        subject: `[HR-Lite] Workspace plan updated — ${wsData.name}`,
        html: `
          <div style="font-family:sans-serif;padding:20px;">
            <p>Your workspace <strong>${escapeHtml(wsData.name)}</strong> plan was updated by an administrator.</p>
            <p><strong>${escapeHtml(previousPlan)}</strong> → <strong>${escapeHtml(plan)}</strong></p>
            ${note ? `<p>${escapeHtml(note)}</p>` : ''}
            <p style="color:#64748b;font-size:0.85em;">Changed by ${escapeHtml(reviewerEmail)}</p>
          </div>
        `,
      });
    }
  }

  res.json({ success: true, plan, previousPlan });
}

module.exports = {
  listUpgradeRequests,
  reviewUpgradeRequest,
  listAdminWorkspaces,
  setWorkspacePlan,
};
