import { auth } from '../firebase';

const API_BASE_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? `http://${window.location.hostname}:3001/api`
    : '/api';

const getAuthHeaders = async () => {
  const token = await auth.currentUser?.getIdToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

async function adminFetch(path, options = {}) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/admin${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.details || response.statusText);
  }
  return data;
}

export const fetchAdminUsers = () => adminFetch('/users');

export const deleteAdminUser = (uid) =>
  adminFetch(`/users/${uid}`, { method: 'DELETE' });

export const fetchUpgradeRequests = (status = 'pending') =>
  adminFetch(`/upgrade-requests?status=${encodeURIComponent(status)}`);

export const reviewUpgradeRequest = (requestId, action, adminNote = '') =>
  adminFetch(`/upgrade-requests/${requestId}`, {
    method: 'PATCH',
    body: JSON.stringify({ action, adminNote }),
  });

export const fetchAdminWorkspaces = () => adminFetch('/workspaces');

export const setWorkspacePlan = (workspaceId, plan, note = '') =>
  adminFetch(`/workspaces/${workspaceId}/plan`, {
    method: 'PATCH',
    body: JSON.stringify({ plan, note }),
  });
