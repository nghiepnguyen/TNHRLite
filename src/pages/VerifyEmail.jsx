import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function VerifyEmail() {
  const { currentUser, sendVerification, reloadUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (currentUser.emailVerified) {
    return <Navigate to="/dashboard" />;
  }

  const handleResend = async () => {
    try {
      setLoading(true);
      setMessage('');
      setError('');
      await sendVerification();
      setMessage(t('verify.resendSuccess'));
    } catch (err) {
      setError(err.message || t('verify.errors.resendFail'));
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    try {
      setLoading(true);
      await reloadUser();
      // If reloadUser updates currentUser.emailVerified, the component will re-render and navigate
    } catch (err) {
      setError(err.message || t('verify.errors.checkFail'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--color-surface-base)', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', textAlign: 'center' }}>
        <div style={{ marginBottom: '2rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>
            mark_email_read
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '1rem' }}>
            {t('verify.title')}
          </h1>
          <p className="text-secondary" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
            {t('verify.subtitle', { email: currentUser.email })}
          </p>
        </div>

        {message && <div className="badge badge-success" style={{ display: 'block', padding: '0.75rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-md)' }}>{message}</div>}
        {error && <div className="badge badge-danger" style={{ display: 'block', padding: '0.75rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-md)' }}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            className="btn btn-primary" 
            onClick={handleCheckStatus} 
            disabled={loading}
            style={{ padding: '0.875rem', fontWeight: 600 }}
          >
            {loading ? t('common.loading') : t('verify.checkButton')}
          </button>
          
          <button 
            className="btn btn-secondary" 
            onClick={handleResend} 
            disabled={loading}
            style={{ padding: '0.875rem', fontWeight: 600 }}
          >
            {t('verify.resendButton')}
          </button>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button 
            onClick={handleLogout}
            className="text-secondary" 
            style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <span className="material-symbols-outlined !text-[18px]">logout</span>
            {t('nav.logout')}
          </button>
          
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
}
