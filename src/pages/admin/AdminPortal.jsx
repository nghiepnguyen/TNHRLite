import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import AdminUpgradeRequests from './AdminUpgradeRequests';
import './AdminPortal.css';

export default function AdminPortal() {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState('billing');

  if (!isAdmin) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <span className="material-symbols-outlined flex-shrink-0 !text-[48px] text-danger" style={{ margin: '0 auto 1rem' }}>
          report
        </span>
        <h1>{t('adminPage.accessDenied')}</h1>
        <p>{t('adminPage.accessDeniedDesc')}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <span className="material-symbols-outlined flex-shrink-0 !text-[32px] text-primary">shield</span>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>{t('adminPage.portalTitle')}</h1>
      </div>

      <div className="admin-portal-tabs">
        <button
          type="button"
          className={`admin-portal-tab ${tab === 'billing' ? 'active' : ''}`}
          onClick={() => setTab('billing')}
        >
          <span className="material-symbols-outlined !text-[18px]">workspace_premium</span>
          {t('adminPage.tabs.billing')}
        </button>
        <button
          type="button"
          className={`admin-portal-tab ${tab === 'users' ? 'active' : ''}`}
          onClick={() => setTab('users')}
        >
          <span className="material-symbols-outlined !text-[18px]">group</span>
          {t('adminPage.tabs.users')}
        </button>
      </div>

      {tab === 'billing' ? <AdminUpgradeRequests /> : <AdminDashboard embedded />}
    </div>
  );
}
