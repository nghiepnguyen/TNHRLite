import { auth } from '../firebase';

export const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? `http://${window.location.hostname}:3001/api`
  : '/api';

export const getAuthHeaders = async () => {
  const token = await auth.currentUser?.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};