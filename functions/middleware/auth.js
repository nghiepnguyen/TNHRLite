const admin = require('firebase-admin');

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

module.exports = {
  authenticate,
  verifyAdmin,
  validateWorkspace
};
