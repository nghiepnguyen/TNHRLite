import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldAlert, Trash2, Shield, Users, Briefcase } from 'lucide-react';
import { auth } from '../../firebase';

const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : '/api';

export default function AdminDashboard() {
  const { currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await auth.currentUser.getIdToken();
      
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError('Could not load users. Make sure you have admin rights and the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (uid, email) => {
    if (!window.confirm(`DANGER: Are you sure you want to permanently delete user ${email} and ALL of their jobs, candidates, and applications? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setError(null);
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${API_BASE_URL}/admin/users/${uid}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error('Failed to delete user');
      
      setUsers(users.filter(u => u.uid !== uid));
    } catch (err) {
      console.error(err);
      setError('Error deleting user. ' + err.message);
    }
  };

  if (!isAdmin) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <ShieldAlert size={48} className="text-danger" style={{ margin: '0 auto 1rem' }} />
        <h1>Access Denied</h1>
        <p>You do not have administrative privileges.</p>
      </div>
    );
  }

  const totalJobs = users.reduce((acc, u) => acc + (u.jobsCount || 0), 0);
  const totalCandidates = users.reduce((acc, u) => acc + (u.candidatesCount || 0), 0);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <Shield size={32} className="text-primary" />
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Admin Portal</h1>
      </div>

      {/* Aggregate Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <Users size={24} className="text-primary" style={{ margin: '0 auto 0.5rem' }} />
          <h3 style={{ fontSize: '2rem', fontWeight: 700 }}>{users.length}</h3>
          <p className="text-secondary">Total Users</p>
        </div>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <Briefcase size={24} className="text-info" style={{ margin: '0 auto 0.5rem' }} />
          <h3 style={{ fontSize: '2rem', fontWeight: 700 }}>{totalJobs}</h3>
          <p className="text-secondary">Total Jobs Posted</p>
        </div>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <Users size={24} className="text-success" style={{ margin: '0 auto 0.5rem' }} />
          <h3 style={{ fontSize: '2rem', fontWeight: 700 }}>{totalCandidates}</h3>
          <p className="text-secondary">Total Candidates Uploaded</p>
        </div>
      </div>

      {error && <div className="badge badge-danger" style={{ display: 'block', padding: '1rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-md)' }}>{error}</div>}

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-surface-border)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Registered Users</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                <th style={{ padding: '1rem' }}>Email</th>
                <th style={{ padding: '1rem' }}>Joined</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Jobs</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Candidates</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>No users found (or fetch failed).</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.uid} style={{ borderBottom: '1px solid var(--color-surface-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>
                      {u.email}
                      {u.email === 'thanhnghiep@gmail.com' && <span className="badge badge-primary" style={{ marginLeft: '0.5rem' }}>Admin</span>}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>{new Date(u.creationTime).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>{u.jobsCount}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>{u.candidatesCount}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button 
                        onClick={() => handleDeleteUser(u.uid, u.email)}
                        className="btn btn-secondary text-danger" 
                        title="Delete User"
                        style={{ padding: '0.5rem', border: 'none', backgroundColor: 'transparent' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
