import { 
  collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc,
  query, where, serverTimestamp, writeBatch, onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase';
import { createNotification } from './notification.service';
import { sendEmail } from './email.service';


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
      emailPreferences: {
        welcome: true,
        invite: true,
        newJob: true,
        newCandidate: true,
        pipeline: true
      },
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'users', user.uid), newProfile);

    // Send Welcome Email
    try {
      await sendEmail({
        to: user.email,
        subject: "Welcome to HR-Lite! 🚀",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; background-color: #ffffff; color: #1a1a1a;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #2563eb; margin-bottom: 8px;">Welcome to HR-Lite!</h1>
              <p style="color: #64748b; font-size: 1.2em;">We're excited to have you here.</p>
            </div>
            
            <p>Hi ${user.displayName || 'there'},</p>
            <p>Your account has been successfully created. HR-Lite is your all-in-one platform for modern recruitment management.</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0;">
              <h3 style="margin-top: 0; color: #334155;">Next Steps:</h3>
              <ul style="color: #475569; padding-left: 20px;">
                <li>Create or join a <strong>Workspace</strong></li>
                <li>Post your first <strong>Job Opening</strong></li>
                <li>Upload candidates and use <strong>AI Parsing</strong></li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${window.location.origin}/dashboard" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
                Get Started
              </a>
            </div>
            
            <p style="font-size: 0.9em; color: #64748b;">
              Need help? Just reply to this email or visit our <a href="${window.location.origin}/contact-support" style="color: #2563eb;">support center</a>.
            </p>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;">
            <p style="font-size: 0.8em; color: #94a3b8; text-align: center;">
              © ${new Date().getFullYear()} HR-Lite. All rights reserved.
            </p>
          </div>
        `
      });
    } catch (e) {
      console.warn("Welcome email skipped or failed:", e);
    }

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

/**
 * --- EMAIL NOTIFICATIONS HELPERS ---
 */

/**
 * Notify all members of a workspace about an event, respecting their email preferences.
 */
export const notifyWorkspaceMembers = async (workspaceId, emailData, preferenceKey, excludeUid = null) => {
  if (!workspaceId) return;
  
  try {
    const members = await getWorkspaceMembers(workspaceId);
    
    // Process in parallel with controlled concurrency or just map
    const notificationPromises = members.map(async (member) => {
      // Skip the person who performed the action
      if (excludeUid && member.userId === excludeUid) return;

      try {
        const profile = await getUserProfile(member.userId);
        // Default to true if preference is missing (backward compatibility)
        const isEnabled = profile?.emailPreferences?.[preferenceKey] !== false;
        
        if (isEnabled && profile?.email) {
          return sendEmail({
            to: profile.email,
            ...emailData
          });
        }
      } catch (profileErr) {
        console.error(`Failed to fetch profile or send email to ${member.userId}:`, profileErr);
      }
    });

    await Promise.all(notificationPromises);
  } catch (err) {
    console.error(`notifyWorkspaceMembers failed for ${preferenceKey}:`, err);
  }
};


export const removeWorkspaceMember = async (workspaceId, userId, performerId = null, isLeaving = false) => {
  const memberId = `${userId}_${workspaceId}`;
  const batch = writeBatch(db);
  
  // 1. Get info BEFORE deleting membership (while user still has access rules)
  let wsData = null;
  let wsName = 'a Workspace';
  let ownerId = null;
  let userEmail = 'a member';

  try {
    const [wsSnap, userSnap] = await Promise.all([
      getDoc(doc(db, 'workspaces', workspaceId)),
      getDoc(doc(db, 'users', userId))
    ]);

    if (wsSnap.exists()) {
      wsData = wsSnap.data();
      wsName = wsData.name;
      ownerId = wsData.ownerId;
    }
    
    if (userSnap.exists()) {
      userEmail = userSnap.data().email;
    }
  } catch (err) {
    console.warn("Failed to fetch info before removal:", err);
  }

  // 2. Delete member record
  batch.delete(doc(db, 'workspaceMembers', memberId));
  await batch.commit();

  // 3. Comprehensive Notifications
  try {
    if (isLeaving || performerId === userId) {
      // CASE: User left voluntarily
      // A. Notify the user who left (History)
      await createNotification(userId, {
        title: 'Workspace Left',
        message: `You have successfully left "${wsName}".`,
        type: 'info',
        workspaceId,
        workspaceName: wsName,
        metadata: { action: 'MEMBER_LEFT' }
      });

      // B. Notify the Workspace Owner
      if (ownerId && ownerId !== userId) {
        await createNotification(ownerId, {
          title: 'Member Departed',
          message: `${userEmail} has left your workspace "${wsName}".`,
          type: 'warning',
          workspaceId,
          workspaceName: wsName,
          metadata: { action: 'MEMBER_LEFT_OWNER_NOTIFY', userEmail }
        });
      }
    } else {
      // CASE: User was removed by an administrator
      // A. Notify the removed user
      await createNotification(userId, {
        title: 'Membership Revoked',
        message: `Your access to "${wsName}" has been removed by an administrator.`,
        type: 'warning',
        workspaceId,
        workspaceName: wsName,
        metadata: { action: 'MEMBER_REMOVED' }
      });

      // B. Notify the Performer (Administrator)
      if (performerId) {
        await createNotification(performerId, {
          title: 'Member Removed',
          message: `You have successfully removed ${userEmail} from "${wsName}".`,
          type: 'success',
          workspaceId,
          workspaceName: wsName,
          metadata: { action: 'MEMBER_REMOVED_PERFORMER_NOTIFY', userEmail }
        });
      }
    }
  } catch (err) {
    console.warn("Failed to create removal/leave notifications:", err);
  }
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
    email: email.trim().toLowerCase(),
    role,

    invitedBy: invitedByUid,
    invitedByEmail: invitedByEmail || 'Unknown',
    status: 'pending',
    createdAt: serverTimestamp(),
    expiresAt: expiresAt,
  });

  // Create persistent notification for the invited user
  // We search for the user by email first (if they already have an account)
  try {
    const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase()));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const targetUserId = snapshot.docs[0].id;
      await createNotification(targetUserId, {
        title: 'New Workspace Invitation',
        message: `You have been invited to join "${workspaceName}" as a ${role}.`,
        type: 'info',
        workspaceId,
        workspaceName,
        metadata: { action: 'INVITE_RECEIVED', invitedBy: invitedByEmail }
      });
    }
  } catch (err) {
    console.warn("Failed to create invite notification:", err);
  }

  // Send Actual Email via Resend
  try {
    // Check preference if user exists in the system
    const userQuery = query(collection(db, 'users'), where('email', '==', email.toLowerCase()));
    const userSnap = await getDocs(userQuery);
    if (!userSnap.empty) {
      const existingUser = userSnap.docs[0].data();
      if (existingUser.emailPreferences?.invite === false) {
        console.log(`Skipping invite email for ${email} due to user preference.`);
        return;
      }
    }

    const inviteLink = `${window.location.origin}/login`;
    await sendEmail({

      to: email,
      subject: `Invitation to join ${workspaceName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; background-color: #ffffff; color: #1a1a1a;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2563eb; margin-bottom: 8px;">HR-Lite</h1>
            <p style="color: #64748b; font-size: 1.1em;">Workspace Invitation</p>
          </div>
          
          <p>Hi there,</p>
          <p><strong>${invitedByEmail}</strong> has invited you to join the workspace <strong>"${workspaceName}"</strong> as a <strong>${role}</strong>.</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${inviteLink}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          
          <p style="font-size: 0.9em; color: #64748b;">
            If you already have an account, log in with <strong>${email}</strong> to see your invitation. 
            If not, please sign up using the same email address.
          </p>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;">
          <p style="font-size: 0.8em; color: #94a3b8; text-align: center;">
            This invitation was sent by HR-Lite on behalf of ${invitedByEmail}.
          </p>
        </div>
      `
    });
  } catch (err) {
    console.error("Failed to send invitation email:", err);
  }
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

export const deleteInvite = async (inviteId) => {
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
