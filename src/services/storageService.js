import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export const uploadCV = async (file, userId, workspaceId) => {
  if (!file) throw new Error("No file provided");
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const wsPrefix = workspaceId ? `ws_${workspaceId}/` : '';
  const path = `cvs/${wsPrefix}${userId || 'anonymous'}/${timestamp}_${safeName}`;
  const storageRef = ref(storage, path);
  
  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);
  return { path, downloadUrl };
};