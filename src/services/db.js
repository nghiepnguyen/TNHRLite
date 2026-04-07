import { 
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp, where 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../firebase';

const formatDoc = (doc) => ({
  id: doc.id,
  ...doc.data(),
});

// --- JOBS ---
export const getJobs = async () => {
  try {
    if (!auth.currentUser) return [];
    const q = query(
      collection(db, 'jobs'), 
      where('createdBy', '==', auth.currentUser.uid)
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(formatDoc);
    return docs.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
};

export const getJob = async (jobId) => {
  try {
    const docSnap = await getDoc(doc(db, 'jobs', jobId));
    if (docSnap.exists()) return formatDoc(docSnap);
    return null;
  } catch (error) {
    console.error("Error fetching job:", error);
    return null;
  }
};

export const createJob = async (jobData) => {
  const docRef = await addDoc(collection(db, 'jobs'), {
    ...jobData,
    createdBy: auth.currentUser?.uid || jobData.createdBy,
    status: jobData.status || 'Active',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateJob = async (id, data) => {
  await updateDoc(doc(db, 'jobs', id), data);
};

export const deleteJob = async (id) => {
  try {
    // 1. Delete associated applications
    const q = query(collection(db, 'applications'), where('jobId', '==', id));
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
export const getCandidates = async () => {
  try {
    if (!auth.currentUser) return [];
    const q = query(
      collection(db, 'candidates'), 
      where('createdBy', '==', auth.currentUser.uid)
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(formatDoc);
    return docs.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return [];
  }
};

export const getCandidate = async (candidateId) => {
  try {
    const docSnap = await getDoc(doc(db, 'candidates', candidateId));
    if (docSnap.exists()) return formatDoc(docSnap);
    return null;
  } catch (error) {
    console.error("Error fetching candidate:", error);
    return null;
  }
};

export const createCandidate = async (candidateData) => {
  const docRef = await addDoc(collection(db, 'candidates'), {
    ...candidateData,
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
    // 1. Delete associated applications
    const q = query(collection(db, 'applications'), where('candidateId', '==', id));
    const snap = await getDocs(q);
    const deletePromises = snap.docs.map(d => deleteDoc(doc(db, 'applications', d.id)));
    await Promise.all(deletePromises);
    
    // 2. Delete candidate record
    await deleteDoc(doc(db, 'candidates', id));
  } catch (error) {
    console.error("Failed to delete candidate and relations", error);
    throw error;
  }
};


// --- APPLICATIONS (Linking Pipeline) ---
export const getApplicationsByJob = async (jobId) => {
  try {
    const q = query(collection(db, 'applications'), where('jobId', '==', jobId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(formatDoc);
  } catch (error) {
    console.error("Error fetching applications:", error);
    return [];
  }
};

export const getAllApplications = async () => {
  try {
    if (!auth.currentUser) return [];
    // Application might not have createdBy but jobId/candidateId do. 
    // Wait, earlier we were saving createdBy on applications. If not, this query might fail.
    // It's safer to query applications by mapping candidate/job if createdBy is missing, but assuming createdBy is present on all entities:
    const q = query(
      collection(db, 'applications'), 
      where('createdBy', '==', auth.currentUser.uid)
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(formatDoc);
    return docs.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
  } catch (error) {
    // If no composite index for orderBy createdAt yet, fallback safely
    try {
      const snapshot = await getDocs(collection(db, 'applications'));
      return snapshot.docs.map(formatDoc);
    } catch(e) {
      console.error(e);
      return [];
    }
  }
};

export const createApplication = async (data) => {
  const docRef = await addDoc(collection(db, 'applications'), {
    ...data,
    createdBy: auth.currentUser?.uid || data.createdBy,
    stage: 'New', 
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateApplicationStage = async (id, stage) => {
  await updateDoc(doc(db, 'applications', id), { stage });
};


// --- STORAGE UTILS ---
export const uploadCV = async (file, userId) => {
  if (!file) throw new Error("No file provided");
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const path = `cvs/${userId || 'anonymous'}/${timestamp}_${safeName}`;
  const storageRef = ref(storage, path);
  
  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);
  return { path, downloadUrl };
};
