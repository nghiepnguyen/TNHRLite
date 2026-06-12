const admin = require('firebase-admin');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const PLAN_LABELS = {
  pro: 'Professional',
  team: 'Enterprise Team',
};

const PLAN_RANK = { free: 0, pro: 1, team: 2 };

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"');
}

async function collectAdminEmails(db, workspaceId) {
  const emails = new Set();
  const billingEmail = (
    process.env.BILLING_EMAIL ||
    process.env.ADMIN_EMAIL ||
    'thanhnghiep@gmail.com'
  ).toLowerCase();
  emails.add(billingEmail);

  const adminsSnap = await db
    .collection('workspaceMembers')
    .where('workspaceId', '==', workspaceId)
    .where('role', 'in', ['owner', 'admin'])
    .get();

  const profileFetches = adminsSnap.docs.map(async (memberDoc) => {
    const uid = memberDoc.data().userId;
    if (!uid) return;
    const userSnap = await db.collection('users').doc(uid).get();
    const email = userSnap.exists ? userSnap.data().email : null;
    if (email) emails.add(email.toLowerCase());
  });

  await Promise.all(profileFetches);
  return [...emails];
}

async function notifyAdmins(db, adminUids, payload) {
  const { workspaceId, workspaceName, title, message, metadata } = payload;
  await Promise.all(
    adminUids.map((userId) =>
      db.collection('userNotifications').add({
        userId,
        title,
        message,
        type: 'info',
        workspaceId,
        workspaceName,
        metadata,
        status: 'unread',
        createdAt: FieldValue.serverTimestamp(),
      })
    )
  );
}

async function handleUpgradeRequest(req, res, resend) {
  const { workspaceId, targetPlan, planName, message } = req.body || {};
  const userId = req.user.uid;
  const userEmail = (req.user.email || '').toLowerCase();
  const userName = req.user.name || req.user.email || 'A workspace member';

  if (!workspaceId || !targetPlan) {
    return res.status(400).json({ error: 'workspaceId and targetPlan are required' });
  }

  if (!['pro', 'team'].includes(targetPlan)) {
    return res.status(400).json({ error: 'Invalid target plan' });
  }

  const db = getFirestore();
  const memberId = `${userId}_${workspaceId}`;
  const memberSnap = await db.collection('workspaceMembers').doc(memberId).get();

  if (!memberSnap.exists) {
    return res.status(403).json({ error: 'Forbidden: You are not a member of this workspace' });
  }

  const wsSnap = await db.collection('workspaces').doc(workspaceId).get();
  if (!wsSnap.exists) {
    return res.status(404).json({ error: 'Workspace not found' });
  }

  const wsData = wsSnap.data();
  const currentPlan = wsData.plan || 'free';
  const workspaceName = wsData.name || 'Workspace';
  const displayPlanName = planName || PLAN_LABELS[targetPlan] || targetPlan;

  if (targetPlan === currentPlan) {
    return res.status(400).json({ error: 'Workspace is already on this plan' });
  }

  const currentRank = PLAN_RANK[currentPlan] ?? 0;
  const targetRank = PLAN_RANK[targetPlan] ?? 0;
  if (targetRank <= currentRank) {
    return res.status(400).json({ error: 'Only upgrades to a higher plan are supported' });
  }

  const trimmedMessage = String(message || '').trim().slice(0, 2000);
  const recipientEmails = await collectAdminEmails(db, workspaceId);

  const requestRef = await db.collection('upgradeRequests').add({
    workspaceId,
    workspaceName,
    requestedBy: userId,
    requestedByEmail: userEmail,
    requestedByName: userName,
    currentPlan,
    targetPlan,
    targetPlanName: displayPlanName,
    message: trimmedMessage,
    status: 'pending',
    createdAt: FieldValue.serverTimestamp(),
  });

  const adminsSnap = await db
    .collection('workspaceMembers')
    .where('workspaceId', '==', workspaceId)
    .where('role', 'in', ['owner', 'admin'])
    .get();
  const adminUids = adminsSnap.docs
    .map((d) => d.data().userId)
    .filter((uid) => uid && uid !== userId);

  await notifyAdmins(db, adminUids, {
    workspaceId,
    workspaceName,
    title: 'Plan upgrade requested',
    message: `${userName} requested an upgrade to ${displayPlanName} for "${workspaceName}".`,
    metadata: {
      action: 'UPGRADE_REQUESTED',
      requestId: requestRef.id,
      targetPlan,
      requestedByEmail: userEmail,
    },
  });

  const noteBlock = trimmedMessage
    ? `<p><strong>Message:</strong></p><div style="background:#f8fafc;padding:12px;border-radius:8px;white-space:pre-wrap;">${escapeHtml(trimmedMessage)}</div>`
    : '<p><em>No additional message provided.</em></p>';

  const adminSubject = `[HR-Lite] Upgrade request: ${workspaceName} → ${displayPlanName}`;
  const adminHtml = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e2e8f0;border-radius:12px;">
      <h2 style="color:#2563eb;margin-top:0;">New workspace upgrade request</h2>
      <p><strong>Workspace:</strong> ${escapeHtml(workspaceName)}</p>
      <p><strong>Current plan:</strong> ${escapeHtml(currentPlan)}</p>
      <p><strong>Requested plan:</strong> ${escapeHtml(displayPlanName)} (${escapeHtml(targetPlan)})</p>
      <p><strong>Requested by:</strong> ${escapeHtml(userName)} <${escapeHtml(userEmail)}></p>
      <p><strong>Request ID:</strong> ${escapeHtml(requestRef.id)}</p>
      ${noteBlock}
      <hr style="border:0;border-top:1px solid #e2e8f0;margin:24px 0;" />
      <p style="font-size:0.85em;color:#64748b;">Review this request in Firestore collection <code>upgradeRequests</code> or your admin workflow.</p>
    </div>
  `;

  const confirmSubject = `[HR-Lite] We received your upgrade request — ${displayPlanName}`;
  const confirmHtml = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e2e8f0;border-radius:12px;">
      <h2 style="color:#2563eb;margin-top:0;">Upgrade request received</h2>
      <p>Hi ${escapeHtml(userName)},</p>
      <p>Your request to upgrade <strong>${escapeHtml(workspaceName)}</strong> to <strong>${escapeHtml(displayPlanName)}</strong> has been sent to workspace administrators and our billing team.</p>
      <p>We will review it shortly and notify you by email once the plan is activated.</p>
      ${trimmedMessage ? `<p><strong>Your note:</strong> ${escapeHtml(trimmedMessage)}</p>` : ''}
      <p style="font-size:0.85em;color:#64748b;">Request ID: ${escapeHtml(requestRef.id)}</p>
    </div>
  `;

  let mock = false;

  if (!resend) {
    mock = true;
    console.log('[Upgrade Request] Mock mode — emails not sent', {
      recipients: recipientEmails,
      adminSubject,
      requester: userEmail,
    });
  } else {
    const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    const { error: adminError } = await resend.emails.send({
      from,
      to: recipientEmails,
      replyTo: userEmail || undefined,
      subject: adminSubject,
      html: adminHtml,
    });

    if (adminError) {
      console.error('Resend error (upgrade admin):', adminError);
      return res.status(400).json({
        error: 'Failed to send upgrade notification email',
        details: adminError,
      });
    }

    if (userEmail) {
      const { error: confirmError } = await resend.emails.send({
        from,
        to: [userEmail],
        subject: confirmSubject,
        html: confirmHtml,
      });

      if (confirmError) {
        console.error('Resend error (upgrade confirmation):', confirmError);
      }
    }
  }

  return res.json({
    success: true,
    requestId: requestRef.id,
    mock,
  });
}

module.exports = {
  handleUpgradeRequest,
};