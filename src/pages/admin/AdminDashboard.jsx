import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { fetchAdminUsers, deleteAdminUser } from '../../services/admin.service';
import { formatDate } from '../../utils/dateUtils';

export default function AdminDashboard({ embedded = false }) {
  const { t } = useTranslation();
  const { currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [currentUser, isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAdminUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (uid, email) => {
    if (
      !window.confirm(
        t('adminPage.users.deleteConfirm', { email })
      )
    ) {
      return;
    }

    try {
      setError(null);
      await deleteAdminUser(uid);
      setUsers(users.filter((u) => u.uid !== uid));
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  if (!isAdmin) {
    return (
      <div style={{ padding: embedded ? 0 : '2rem', textAlign: 'center' }}>
        <span className="material-symbols-outlined flex-shrink-0 !text-[48px] text-danger" style={{ margin: '0 auto 1rem' }}>
          report
        </span>
        <h1>{t('adminPage.accessDenied')}</h1>
        <p>{t('adminPage.accessDeniedDesc')}</p>
      </div>
    );
  }

  const totalJobs = Array.isArray(users) ? users.reduce((acc, u) => acc + (u.jobsCount || 0), 0) : 0;
  const totalCandidates = Array.isArray(users)
    ? users.reduce((acc, u) => acc + (u.candidatesCount || 0), 0)
    : 0;

  return (
    <div style={{ padding: embedded ? 0 : '2rem' }}>
      {!embedded && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <span className="material-symbols-outlined flex-shrink-0 !text-[32px] text-primary">shield</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>{t('adminPage.portalTitle')}</h1>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <span className="material-symbols-outlined flex-shrink-0 !text-[24px] text-primary" style={{ margin: '0 auto 0.5rem' }}>
            group
          </span>
          <h3 style={{ fontSize: '2rem', fontWeight: 700 }}>{users.length}</h3>
          <p className="text-secondary">{t('adminPage.users.totalUsers')}</p>
        </div>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <span className="material-symbols-outlined flex-shrink-0 !text-[24px] text-info" style={{ margin: '0 auto 0.5rem' }}>
            work
          </span>
          <h3 style={{ fontSize: '2rem', fontWeight: 700 }}>{totalJobs}</h3>
          <p className="text-secondary">{t('adminPage.users.totalJobs')}</p>
        </div>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <span className="material-symbols-outlined flex-shrink-0 !text-[24px] text-success" style={{ margin: '0 auto 0.5rem' }}>
            group
          </span>
          <h3 style={{ fontSize: '2rem', fontWeight: 700 }}>{totalCandidates}</h3>
          <p className="text-secondary">{t('adminPage.users.totalCandidates')}</p>
        </div>
      </div>

      {error && (
        <div
          className="badge badge-danger"
          style={{ display: 'block', padding: '1rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-md)' }}
        >
          {error}
        </div>
      )}

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-surface-border)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{t('adminPage.users.registeredUsers')}</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: 'var(--color-surface-hover)',
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.875rem',
                }}
              >
                <th style={{ padding: '1rem' }}>{t('adminPage.users.columns.email')}</th>
                <th style={{ padding: '1rem' }}>{t('adminPage.users.columns.joined')}</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>{t('adminPage.users.columns.jobs')}</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>{t('adminPage.users.columns.candidates')}</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>{t('adminPage.users.columns.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {!Array.isArray(users) || users.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>
                    {loading ? t('adminPage.users.loading') : t('adminPage.users.empty')}
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.uid} style={{ borderBottom: '1px solid var(--color-surface-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>
                      {u.email}
                      {u.uid === currentUser?.uid && (
                        <span className="badge badge-primary" style={{ marginLeft: '0.5rem' }}>
                          {t('adminPage.users.you')}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>{formatDate(u.creationTime)}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>{u.jobsCount}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>{u.candidatesCount}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u.uid, u.email)}
                        className="btn btn-secondary text-danger"
                        title="Delete User"
                        style={{ padding: '0.5rem', border: 'none', backgroundColor: 'transparent' }}
                      >
                        <span className="material-symbols-outlined flex-shrink-0 !text-[18px]">delete</span>
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
