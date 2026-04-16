import { 
  collection, doc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  query, where, serverTimestamp, onSnapshot, orderBy, limit 
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * --- PERSISTENT NOTIFICATIONS ---
 * These are notifications that reside in a dedicated collection, 
 * independent of any single workspace access. This ensures that 
 * when a user is removed from a workspace, they still get notified when they next log in.
 */

export const createNotification = async (userId, data) => {
  const { title, message, type, workspaceId, workspaceName, metadata = {} } = data;
  
  if (!userId) {
    console.error("Cannot create notification: No userId provided.");
    return;
  }

  try {
    const notifRef = await addDoc(collection(db, 'userNotifications'), {
      userId,
      title,
      message,
      type: type || 'info', // 'info', 'warning', 'success', 'danger'
      workspaceId: workspaceId || null,
      workspaceName: workspaceName || null,
      metadata,
      status: 'unread',
      createdAt: serverTimestamp(),
    });
    return notifRef.id;
  } catch (err) {
    console.error("Error creating persistent notification:", err);
  }
};

export const subscribeToNotifications = (userId, onUpdate) => {
  if (!userId) return () => {};

  const q = query(
    collection(db, 'userNotifications'),
    where('userId', '==', userId),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const notifs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    onUpdate(notifs);
  }, (err) => {
    console.error("Notifications subscription error:", err);
  });
};

export const markAsRead = async (notifId) => {
  try {
    await updateDoc(doc(db, 'userNotifications', notifId), {
      status: 'read',
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    console.error("Error marking notification as read:", err);
  }
};

export const deleteNotification = async (notifId) => {
  try {
    await deleteDoc(doc(db, 'userNotifications', notifId));
  } catch (err) {
    console.error("Error deleting notification:", err);
  }
};

export const markAllAsRead = async (userId) => {
  try {
    const q = query(
      collection(db, 'userNotifications'),
      where('userId', '==', userId),
      where('status', '==', 'unread')
    );
    const snapshot = await getDocs(q);
    
    // Using a simple loop for now, batch if large volume
    const promises = snapshot.docs.map(d => markAsRead(d.id));
    await Promise.all(promises);
  } catch (err) {
    console.error("Error marking all as read:", err);
  }
};
// Find and mark specific invite-related notifications as read
export const markInviteNotificationAsRead = async (userId, workspaceId) => {
  if (!userId || !workspaceId) return;
  try {
    const q = query(
      collection(db, 'userNotifications'),
      where('userId', '==', userId),
      where('workspaceId', '==', workspaceId),
      where('status', '==', 'unread')
    );
    const snapshot = await getDocs(q);
    
    const promises = snapshot.docs.map(d => {
      const data = d.data();
      // Only mark as read if it's a notification about receiving an invite
      if (data.metadata?.action === 'INVITE_RECEIVED') {
        return markAsRead(d.id);
      }
      return null;
    }).filter(p => p !== null);
    
    await Promise.all(promises);
  } catch (err) {
    console.warn("Error auto-marking invite notification as read:", err);
  }
};
