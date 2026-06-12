import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { API_BASE_URL, getAuthHeaders } from './apiClient';

/**
 * Log a workspace activity with enriched metadata
 * @param {string} workspaceId 
 * @param {Object} actor - { uid, email, displayName, photoURL }
 * @param {string} action - 'JOB_CREATED', 'STAGE_UPDATED', etc.
 * @param {Object} entity - { type, id, name }
 * @param {Object} details - extra context
 */
export const logActivity = async (workspaceId, actor, action, entity, details = {}) => {
  if (!workspaceId) return;
  
  try {
    await addDoc(collection(db, 'activities'), {
      workspaceId,
      actor: {
        uid: actor?.uid || actor?.id || 'system',
        email: actor?.email || 'system',
        name: actor?.displayName || actor?.name || actor?.email || 'Someone',
        photoURL: actor?.photoURL || null
      },
      action,
      entity: {
        type: entity?.type || 'system',
        id: entity?.id || null,
        name: entity?.name || 'Unknown'
      },
      details,
      timestamp: serverTimestamp(),
    });
  } catch (e) {
    console.error("Failed to log activity:", e);
  }
};

export const syncWorkspaceUsage = async (workspaceId) => {
  if (!workspaceId) return null;
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/sync-usage`, {
      method: 'POST',
      headers
    });
    if (!response.ok) {
      console.warn("Failed to sync workspace usage", response.statusText);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Error syncing workspace usage:", error);
    return null;
  }
};