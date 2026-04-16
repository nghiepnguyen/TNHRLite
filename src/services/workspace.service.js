import { 
  collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc,
  query, where, serverTimestamp, writeBatch, onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * --- USER PROFILE ---
 */
export const getUserProfile = async (uid) => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
};

export const ensureUserProfile = async (user) => {
  if (!user) return null;
  const profile = await getUserProfile(user.uid);
  if (!profile) {
    const newProfile = {
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      defaultWorkspaceId: null,
      onboarded: false,
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'users', user.uid), newProfile);
    return { id: user.uid, ...newProfile };
  }
  return profile;
};

export const updateUserProfile = async (uid, data) => {
  await updateDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

/**
 * --- WORKSPACES ---
 */

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

export const checkSlugUnique = async (slug) => {
  const q = query(collection(db, 'workspaces'), where('slug', '==', slug));
  const snapshot = await getDocs(q);
  return snapshot.empty;
};

export const createWorkspace = async (ownerUid, email, workspaceData) => {
  const { name, description, avatarUrl, timezone, language } = workspaceData;
  
  // 1. Generate Unique Slug (just append a random ID for safety, no DB check)
  let baseSlug = slugify(name);
  if (!baseSlug) baseSlug = 'workspace';
  
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const finalSlug = `${baseSlug}-${randomSuffix}`;

  // 2. Create workspace
  const workspaceRef = await addDoc(collection(db, 'workspaces'), {
    name,
    slug: finalSlug,
    description: description || '',
    avatarUrl: avatarUrl || '',
    timezone: timezone || 'UTC',
    language: language || 'en',
    ownerId: ownerUid,
    createdAt: serverTimestamp(),
  });

  // 2. Add owner as member in top-level collection
  const memberId = `${ownerUid}_${workspaceRef.id}`;
  await setDoc(doc(db, 'workspaceMembers', memberId), {
    workspaceId: workspaceRef.id,
    userId: ownerUid,
    role: 'owner',
    email: email,
    joinedAt: serverTimestamp(),
  });

  return workspaceRef.id;
};

export const updateWorkspace = async (workspaceId, data) => {
  if (!workspaceId) throw new Error("Workspace ID required");
  const wsRef = doc(db, 'workspaces', workspaceId);
  await updateDoc(wsRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const deleteWorkspace = async (workspaceId) => {
  if (!workspaceId) throw new Error("Workspace ID required");
  
  // 1. Delete Workspace Members
  const membersQuery = query(collection(db, 'workspaceMembers'), where('workspaceId', '==', workspaceId));
  const memberDocs = await getDocs(membersQuery);
  const deletePromises = memberDocs.docs.map(d => deleteDoc(doc(db, 'workspaceMembers', d.id)));
  await Promise.all(deletePromises);
  
  // 2. Delete the workspace itself
  await deleteDoc(doc(db, 'workspaces', workspaceId));
  
  // Note: For a production app, we would also clear out jobs/candidates/applications 
  // tied to this workspace, or use a Cloud Function for cascading deletes. 
  // Here, we'll assume soft cleanup or rely on future batch jobs.
};

export const getUserWorkspaces = async (uid) => {
  // We need to find all workspaces where the user is a member.
  // Since members are in a subcollection, we might need a collection group query 
  // or a more efficient way. For now, let's use a collection group query if possible,
  // or just search the 'workspaces' collection if we stored memberIds in an array.
  // BUT the requirements mentioned role-based, so subcollection is better for rules.
  
  // Alternative: Keep a top-level `workspaceMembers` collection for easier querying.
  // Let's use `workspaceMembers` top-level collection for easier "Get my workspaces" query.
  
  try {
    const q = query(collection(db, 'workspaceMembers'), where('userId', '==', uid));
    const snapshot = await getDocs(q);
    
    const workspaces = [];
    for (const memberDoc of snapshot.docs) {
      const data = memberDoc.data();
      try {
        const wsDoc = await getDoc(doc(db, 'workspaces', data.workspaceId));
        if (wsDoc.exists()) {
          workspaces.push({
            id: wsDoc.id,
            ...wsDoc.data(),
            myRole: data.role
          });
        }
      } catch (e) {
        console.error("Failed to get workspace doc:", data.workspaceId, e);
      }
    }
    return workspaces;
  } catch (error) {
    console.error("Failed in getUserWorkspaces:", error);
    throw error;
  }
};

/**
 * Real-time subscription to user's workspaces
 */
export const subscribeToUserWorkspaces = (uid, onUpdate) => {
  if (!uid) return () => {};
  
  const q = query(collection(db, 'workspaceMembers'), where('userId', '==', uid));
  
  return onSnapshot(q, async (snapshot) => {
    const workspaces = [];
    
    // Process each membership record
    for (const memberDoc of snapshot.docs) {
      const memberData = memberDoc.data();
      try {
        const wsSnap = await getDoc(doc(db, 'workspaces', memberData.workspaceId));
        if (wsSnap.exists()) {
          workspaces.push({
            id: wsSnap.id,
            ...wsSnap.data(),
            myRole: memberData.role,
            joinedAt: memberData.joinedAt
          });
        }
      } catch (e) {
        console.error("Error fetching workspace details in sub:", memberData.workspaceId, e);
      }
    }
    
    onUpdate(workspaces.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)));
  }, (error) => {
    console.error("Workspace subscription error:", error);
  });
};

export const getWorkspaceMembers = async (workspaceId) => {
  const q = query(collection(db, 'workspaceMembers'), where('workspaceId', '==', workspaceId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const removeWorkspaceMember = async (workspaceId, userId) => {
  const memberId = `${userId}_${workspaceId}`;
  const batch = writeBatch(db);
  
  // 1. Delete member record
  batch.delete(doc(db, 'workspaceMembers', memberId));
  
  // 2. Clear user's default workspace if it matches (optional but recommended)
  // We can't easily update another user's profile from the client due to rules, 
  // but the next time they login, WorkspaceContext will handle the lack of membership.
  
  await batch.commit();
};

/**
 * --- INVITATIONS ---
 */
export const inviteMember = async (workspaceId, workspaceName, email, role, invitedByUid, invitedByEmail) => {
  const createdAt = new Date();
  const expiresAt = new Date();
  expiresAt.setDate(createdAt.getDate() + 7); // Default 7 days expiration

  await addDoc(collection(db, 'invites'), {
    workspaceId,
    workspaceName,
    email: email.toLowerCase(),
    role,
    invitedBy: invitedByUid,
    invitedByEmail: invitedByEmail || 'Unknown',
    status: 'pending',
    createdAt: serverTimestamp(),
    expiresAt: expiresAt,
  });
};

export const getPendingInvites = async (email) => {
  if (!email) return [];
  try {
    const q = query(
      collection(db, 'invites'), 
      where('email', '==', email.toLowerCase()),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("Failed in getPendingInvites:", error);
    throw error;
  }
};

export const getWorkspaceInvites = async (workspaceId) => {
  const q = query(
    collection(db, 'invites'), 
    where('workspaceId', '==', workspaceId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateInviteStatus = async (inviteId, status) => {
  await updateDoc(doc(db, 'invites', inviteId), {
    status,
    updatedAt: serverTimestamp(),
  });
};

export const revokeInvite = async (inviteId) => {
  await deleteDoc(doc(db, 'invites', inviteId));
};

export const declineInvite = async (inviteId) => {
  await deleteDoc(doc(db, 'invites', inviteId));
};

export const acceptInvite = async (invite, uid) => {
  // Check expiration
  if (invite.expiresAt) {
    const now = new Date();
    const expiry = invite.expiresAt.toDate ? invite.expiresAt.toDate() : new Date(invite.expiresAt);
    if (now > expiry) {
      throw new Error('This invitation has expired.');
    }
  }

  const batch = writeBatch(db);

  // 1. Add to workspaceMembers with custom ID (userId_workspaceId)
  const memberId = `${uid}_${invite.workspaceId}`;
  const memberRef = doc(db, 'workspaceMembers', memberId);
  batch.set(memberRef, {
    workspaceId: invite.workspaceId,
    userId: uid,
    email: invite.email,
    role: invite.role,
    joinedAt: serverTimestamp(),
  });

  // 2. Update invite status
  batch.update(doc(db, 'invites', invite.id), {
    status: 'accepted',
    acceptedAt: serverTimestamp(),
  });

  await batch.commit();
};

/**
 * --- MIGRATION ---
 */
export const migrateLegacyData = async (uid, workspaceId) => {
  const collectionsToMigrate = ['jobs', 'candidates', 'applications'];
  let totalMigrated = 0;

  for (const collName of collectionsToMigrate) {
    const q = query(
      collection(db, collName), 
      where('createdBy', '==', uid)
    );
    const snapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    let count = 0;
    
    snapshot.docs.forEach(d => {
      const data = d.data();
      if (!data.workspaceId) {
        batch.update(d.ref, { workspaceId: workspaceId });
        count++;
      }
    });

    if (count > 0) {
      await batch.commit();
      totalMigrated += count;
    }
  }
  
  return totalMigrated;
};
