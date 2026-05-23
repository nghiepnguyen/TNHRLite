import { 
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, serverTimestamp, where 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '../firebase';
import { notifyWorkspaceMembers } from './workspace.service';


const formatDoc = (doc) => ({
  id: doc.id,
  ...doc.data(),
});

const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? `http://${window.location.hostname}:3001/api`
  : '/api';

const getAuthHeaders = async () => {
  const token = await auth.currentUser?.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// --- JOBS ---
export const getJobs = async (workspaceId) => {
  try {
    if (!auth.currentUser || !workspaceId) return [];
    const q = query(
      collection(db, 'jobs'), 
      where('workspaceId', '==', workspaceId)
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(formatDoc);
    return docs.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
};

export const getJob = async (jobId, workspaceId) => {
  try {
    const docRef = doc(db, 'jobs', jobId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    
    const data = docSnap.data();
    // Security check: Ensure job belongs to requested workspace
    if (workspaceId && data.workspaceId !== workspaceId) {
      console.error("Access denied: Job does not belong to this workspace");
      return null;
    }
    return formatDoc(docSnap);
  } catch (error) {
    console.error("Error fetching job:", error);
    return null;
  }
};

export const createJob = async (workspaceId, jobData) => {
  if (!workspaceId) throw new Error("Workspace ID is required to create a job");

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ workspaceId, jobData }),
    });

    if (!response.ok) {
      let errBody = {};
      try {
        errBody = await response.json();
      } catch (_) {}
      
      const errMsg = errBody.error || response.statusText;
      const error = new Error(errMsg);
      if (errBody.code) {
        error.code = errBody.code;
        error.plan = errBody.plan;
        error.limit = errBody.limit;
      }
      throw error;
    }

    const createdJob = await response.json();
    const jobId = createdJob.id;

    // Trigger Email Notification to Workspace Members
    try {
      notifyWorkspaceMembers(workspaceId, {
        subject: `New Job Posted: ${jobData.title}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; background-color: #ffffff; color: #1a1a1a;">
            <h2 style="color: #2563eb; margin-top: 0;">New Job Opening</h2>
            <p>A new job has been posted in your workspace.</p>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 20px 0;">
              <strong style="font-size: 1.1em; display: block; margin-bottom: 4px; color: #1e293b;">${jobData.title}</strong>
              <p style="margin: 0; color: #64748b; font-size: 0.9em;">${jobData.department || 'General'} • ${jobData.location || 'Remote'}</p>
            </div>
            <div style="margin: 25px 0;">
              <a href="${window.location.origin}/dashboard/w/${workspaceId}/jobs/${jobId}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Job Details</a>
            </div>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            <p style="font-size: 0.75em; color: #94a3b8; text-align: center;">You received this because "New Job Openings" is enabled in your HR-Lite profile settings.</p>
          </div>
        `
      }, 'newJob', auth.currentUser?.uid);
    } catch (e) {
      console.warn("Job creation email notification skipped:", e);
    }

    return jobId;
  } catch (error) {
    console.error("Error in createJob API call:", error);
    throw error;
  }
};

export const updateJob = async (id, data) => {
  await updateDoc(doc(db, 'jobs', id), data);
};

export const deleteJob = async (id, workspaceId) => {
  try {
    if (!auth.currentUser || !workspaceId) return;
    // 1. Fetch related applications in this workspace
    const q = query(
      collection(db, 'applications'), 
      where('jobId', '==', id),
      where('workspaceId', '==', workspaceId)
    );
    const snap = await getDocs(q);
    const deletePromises = snap.docs.map(d => deleteDoc(doc(db, 'applications', d.id)));
      
    await Promise.all(deletePromises);
    
    // 2. Delete job record
    await deleteDoc(doc(db, 'jobs', id));
  } catch (error) {
    console.error("Failed to delete job and relations", error);
    throw error;
  }
};


// --- CANDIDATES ---
export const getCandidates = async (workspaceId) => {
  try {
    if (!auth.currentUser || !workspaceId) return [];
    const q = query(
      collection(db, 'candidates'), 
      where('workspaceId', '==', workspaceId)
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(formatDoc);
    return docs.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return [];
  }
};

export const getCandidate = async (candidateId, workspaceId) => {
  try {
    const docRef = doc(db, 'candidates', candidateId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    if (workspaceId && data.workspaceId !== workspaceId) {
      console.error("Access denied: Candidate does not belong to this workspace");
      return null;
    }
    return formatDoc(docSnap);
  } catch (error) {
    console.error("Error fetching candidate:", error);
    return null;
  }
};

export const createCandidate = async (workspaceId, candidateData) => {
  if (!workspaceId) throw new Error("Workspace ID is required to create a candidate");

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/candidates`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ workspaceId, candidateData }),
    });

    if (!response.ok) {
      let errBody = {};
      try {
        errBody = await response.json();
      } catch (_) {}
      
      const errMsg = errBody.error || response.statusText;
      const error = new Error(errMsg);
      if (errBody.code) {
        error.code = errBody.code;
        error.plan = errBody.plan;
        error.limit = errBody.limit;
      }
      throw error;
    }

    const createdCandidate = await response.json();
    const candidateId = createdCandidate.id;

    // Trigger Email Notification to Workspace Members
    try {
      notifyWorkspaceMembers(workspaceId, {
        subject: `New Candidate: ${candidateData.fullName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; background-color: #ffffff; color: #1a1a1a;">
            <h2 style="color: #10b981; margin-top: 0;">New Candidate Added</h2>
            <p>A new candidate has been added to your workspace.</p>
            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
              <strong style="font-size: 1.1em; display: block; margin-bottom: 4px; color: #1e293b;">${candidateData.fullName}</strong>
              <p style="margin: 0; color: #64748b; font-size: 0.9em;">${candidateData.currentTitle || 'Candidate'} • ${candidateData.location || 'Unknown'}</p>
            </div>
            <div style="margin: 25px 0;">
              <a href="${window.location.origin}/dashboard/w/${workspaceId}/candidates/${candidateId}" style="background-color: #10b981; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Candidate Profile</a>
            </div>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            <p style="font-size: 0.75em; color: #94a3b8; text-align: center;">You received this because "New Candidates" is enabled in your HR-Lite profile settings.</p>
          </div>
        `
      }, 'newCandidate', auth.currentUser?.uid);
    } catch (e) {
      console.warn("Candidate creation email notification skipped:", e);
    }

    return candidateId;
  } catch (error) {
    console.error("Error in createCandidate API call:", error);
    throw error;
  }
};

export const updateCandidate = async (candidateId, data) => {
  await updateDoc(doc(db, 'candidates', candidateId), data);
};

export const deleteCandidate = async (id) => {
  try {
    // 1. Fetch candidate to get storage path before deleting doc
    const candDoc = await getDoc(doc(db, 'candidates', id));
    const candData = candDoc.exists() ? candDoc.data() : null;

    // 2. Delete associated Applications in this workspace
    const q = query(
      collection(db, 'applications'), 
      where('candidateId', '==', id),
      where('workspaceId', '==', candData?.workspaceId || '')
    );
    const snap = await getDocs(q);
    const deletePromises = snap.docs.map(d => deleteDoc(doc(db, 'applications', d.id)));
      
    await Promise.all(deletePromises);
    
    // 3. Delete CV file from Storage if path exists
    if (candData && candData.cvStoragePath) {
      try {
        const fileRef = ref(storage, candData.cvStoragePath);
        await deleteObject(fileRef);
        console.log("Successfully deleted CV file from Storage:", candData.cvStoragePath);
      } catch (storageErr) {
        console.error("Warning: Could not delete CV file from storage (it might have been deleted already or is missing):", storageErr);
      }
    }

    // 4. Delete candidate record
    await deleteDoc(doc(db, 'candidates', id));
  } catch (error) {
    console.error("Failed to delete candidate and relations", error);
    throw error;
  }
};


// --- APPLICATIONS (Linking Pipeline) ---
export const getApplicationsByJob = async (workspaceId, jobId) => {
  try {
    if (!auth.currentUser || !workspaceId) return [];
    const q = query(
      collection(db, 'applications'), 
      where('workspaceId', '==', workspaceId),
      where('jobId', '==', jobId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(formatDoc);
  } catch (error) {
    console.error("Error fetching applications:", error);
    return [];
  }
};

export const getApplicationsByCandidate = async (workspaceId, candidateId) => {
  try {
    if (!auth.currentUser || !workspaceId) return [];
    const q = query(
      collection(db, 'applications'), 
      where('workspaceId', '==', workspaceId),
      where('candidateId', '==', candidateId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(formatDoc);
  } catch (error) {
    console.error("Error fetching applications for candidate:", error);
    return [];
  }
};

export const getAllApplications = async (workspaceId) => {
  try {
    if (!auth.currentUser || !workspaceId) return [];
    const q = query(
      collection(db, 'applications'), 
      where('workspaceId', '==', workspaceId)
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(formatDoc);
    return docs.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
  } catch (error) {
    console.error("Error fetching all applications:", error);
    return [];
  }
};

export const createApplication = async (workspaceId, data) => {
  if (!workspaceId) throw new Error("Workspace ID is required to create an application");
  const docRef = await addDoc(collection(db, 'applications'), {
    ...data,
    workspaceId,
    createdBy: auth.currentUser?.uid || data.createdBy,
    stage: 'New', 
    createdAt: serverTimestamp(),
    lastStageChangedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateApplicationStage = async (id, stage) => {
  try {
    // 1. Fetch current application for context
    const appSnap = await getDoc(doc(db, 'applications', id));
    const appData = appSnap.exists() ? appSnap.data() : null;

    // 2. Update stage
    await updateDoc(doc(db, 'applications', id), { 
      stage,
      lastStageChangedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // 3. Trigger Email Notification
    if (appData) {
      notifyWorkspaceMembers(appData.workspaceId, {
        subject: `Pipeline Update: ${appData.candidateName || 'Candidate'} moved to ${stage}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; background-color: #ffffff; color: #1a1a1a;">
            <h2 style="color: #2563eb; margin-top: 0;">Pipeline Stage Update</h2>
            <p>A candidate has been moved to a new stage in your hiring pipeline.</p>
            
            <div style="margin: 20px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
              <div style="padding: 12px 15px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; font-weight: 600;">
                ${appData.candidateName || 'Candidate'}
              </div>
              <div style="padding: 15px; display: flex; align-items: center; gap: 10px;">
                <span style="color: #64748b; font-size: 0.9em;">New Stage:</span>
                <span style="background-color: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 0.85em;">${stage}</span>
              </div>
            </div>

            <div style="margin: 25px 0;">
              <a href="${window.location.origin}/dashboard/w/${appData.workspaceId}/pipeline?job=${appData.jobId}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Pipeline</a>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            <p style="font-size: 0.75em; color: #94a3b8; text-align: center;">You received this because "Pipeline Changes" is enabled in your HR-Lite profile settings.</p>
          </div>
        `
      }, 'pipeline', auth.currentUser?.uid);
    }
  } catch (error) {
    console.error("Error in updateApplicationStage or notification:", error);
  }
};


export const updateApplication = async (id, data) => {
  try {
    const updateData = { ...data, updatedAt: serverTimestamp() };
    if (data.stage) {
      updateData.lastStageChangedAt = serverTimestamp();
    }
    await updateDoc(doc(db, 'applications', id), updateData);
  } catch (error) {
    console.error("Error updating application:", error);
    throw error;
  }
};


// --- STORAGE UTILS ---
export const uploadCV = async (file, userId, workspaceId) => {
  if (!file) throw new Error("No file provided");
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  // Scoped path: cvs/ws_<workspaceId>/<userId>/<filename>
  const wsPrefix = workspaceId ? `ws_${workspaceId}/` : '';
  const path = `cvs/${wsPrefix}${userId || 'anonymous'}/${timestamp}_${safeName}`;
  const storageRef = ref(storage, path);
  
  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);
  return { path, downloadUrl };
};

// --- ACTIVITIES ---
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
