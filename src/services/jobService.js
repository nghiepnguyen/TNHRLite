import { 
  collection, doc, getDocs, getDoc, deleteDoc,
  query, where 
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { notifyWorkspaceMembers } from './workspace.service';
import { API_BASE_URL, getAuthHeaders } from './apiClient';
import { newJobEmailTemplate } from './emailTemplates';

const formatDoc = (doc) => ({
  id: doc.id,
  ...doc.data(),
});

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
      try { errBody = await response.json(); } catch (_) { errBody = {}; }
      
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

    try {
      notifyWorkspaceMembers(workspaceId, {
        subject: `New Job Posted: ${jobData.title}`,
        html: newJobEmailTemplate({ workspaceId, jobId, jobData })
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
  const { updateDoc } = await import('firebase/firestore');
  await updateDoc(doc(db, 'jobs', id), data);
};

export const deleteJob = async (id, workspaceId) => {
  try {
    if (!auth.currentUser || !workspaceId) return;
    const q = query(
      collection(db, 'applications'), 
      where('jobId', '==', id),
      where('workspaceId', '==', workspaceId)
    );
    const snap = await getDocs(q);
    const deletePromises = snap.docs.map(d => deleteDoc(doc(db, 'applications', d.id)));
    await Promise.all(deletePromises);
    await deleteDoc(doc(db, 'jobs', id));
  } catch (error) {
    console.error("Failed to delete job and relations", error);
    throw error;
  }
};