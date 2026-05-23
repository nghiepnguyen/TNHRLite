const admin = require('firebase-admin');

/**
 * Checks if a workspace has exceeded its usage limit for a specific resource,
 * and increments the usage counter atomically in a transaction if allowed.
 * 
 * @param {admin.firestore.Firestore} db - Firestore Admin instance
 * @param {string} workspaceId - The workspace ID to verify
 * @param {'jobs' | 'candidates' | 'cvParsesThisMonth'} resource - The resource being added
 * @returns {Promise<{success: boolean, newUsage: number, limit: number}>}
 */
async function checkWorkspaceLimit(db, workspaceId, resource) {
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

module.exports = {
  checkWorkspaceLimit
};
