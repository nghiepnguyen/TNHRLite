import { 
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp, where 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '../firebase';

const formatDoc = (doc) => ({
  id: doc.id,
  ...doc.data(),
});

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
  const docRef = await addDoc(collection(db, 'jobs'), {
    ...jobData,
    workspaceId,
    createdBy: auth.currentUser?.uid || jobData.createdBy,
    status: jobData.status || 'Active',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
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
  const docRef = await addDoc(collection(db, 'candidates'), {
    ...candidateData,
    workspaceId,
    createdBy: auth.currentUser?.uid || candidateData.createdBy,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
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
  await updateDoc(doc(db, 'applications', id), { 
    stage,
    lastStageChangedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
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
