import { 
  collection, doc, getDocs, getDoc, deleteDoc,
  query, where 
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '../firebase';
import { notifyWorkspaceMembers } from './workspace.service';
import { API_BASE_URL, getAuthHeaders } from './apiClient';
import { newCandidateEmailTemplate } from './emailTemplates';

const formatDoc = (doc) => ({
  id: doc.id,
  ...doc.data(),
});

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

    const createdCandidate = await response.json();
    const candidateId = createdCandidate.id;

    try {
      notifyWorkspaceMembers(workspaceId, {
        subject: `New Candidate: ${candidateData.fullName}`,
        html: newCandidateEmailTemplate({ workspaceId, candidateId, candidateData })
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
  const { updateDoc } = await import('firebase/firestore');
  await updateDoc(doc(db, 'candidates', candidateId), data);
};

export const deleteCandidate = async (id) => {
  try {
    const candDoc = await getDoc(doc(db, 'candidates', id));
    const candData = candDoc.exists() ? candDoc.data() : null;

    const q = query(
      collection(db, 'applications'), 
      where('candidateId', '==', id),
      where('workspaceId', '==', candData?.workspaceId || '')
    );
    const snap = await getDocs(q);
    const deletePromises = snap.docs.map(d => deleteDoc(doc(db, 'applications', d.id)));
    await Promise.all(deletePromises);
    
    if (candData && candData.cvStoragePath) {
      try {
        const fileRef = ref(storage, candData.cvStoragePath);
        await deleteObject(fileRef);
      } catch (storageErr) {
        console.error("Warning: Could not delete CV file from storage:", storageErr);
      }
    }

    await deleteDoc(doc(db, 'candidates', id));
  } catch (error) {
    console.error("Failed to delete candidate and relations", error);
    throw error;
  }
};