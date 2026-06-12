import { 
  collection, doc, getDocs, getDoc, addDoc, updateDoc,
  query, serverTimestamp, where 
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { notifyWorkspaceMembers } from './workspace.service';
import { pipelineUpdateEmailTemplate } from './emailTemplates';

const formatDoc = (doc) => ({
  id: doc.id,
  ...doc.data(),
});

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
    const appSnap = await getDoc(doc(db, 'applications', id));
    const appData = appSnap.exists() ? appSnap.data() : null;

    await updateDoc(doc(db, 'applications', id), { 
      stage,
      lastStageChangedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    if (appData) {
      notifyWorkspaceMembers(appData.workspaceId, {
        subject: `Pipeline Update: ${appData.candidateName || 'Candidate'} moved to ${stage}`,
        html: pipelineUpdateEmailTemplate({ stage, appData })
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