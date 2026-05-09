import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '../../services/workspace.service';
import { useToast } from '../../contexts/ToastContext';
import './UserSettings.css';

export default function UserSettings() {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      if (!currentUser) return;
      try {
        setLoading(true);
        const data = await getUserProfile(currentUser.uid);
        setProfile(data);
      } catch (err) {
        console.error("Failed to load profile", err);
        toast({ type: 'error', message: t('settings.user.fail') });
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [currentUser, toast, t]);

  const handleTogglePreference = (key) => {
    setProfile(prev => ({
      ...prev,
      emailPreferences: {
        ...prev.emailPreferences,
        [key]: !prev.emailPreferences?.[key]
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserProfile(currentUser.uid, {
        emailPreferences: profile.emailPreferences,
        displayName: profile.displayName
      });
      toast({ type: 'success', message: t('settings.user.success') });
    } catch (err) {
      console.error("Failed to save settings", err);
      toast({ type: 'error', message: t('settings.user.fail') });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="settings-loader-container">
      <div className="spinner"></div>
      <p>{t('settings.user.loading')}</p>
    </div>
  );

  return (
    <div className="user-settings-container">
      <div className="settings-header">
        <h1>{t('settings.user.title')}</h1>
        <p>{t('settings.user.subtitle')}</p>
      </div>

      <div className="settings-grid">
        {/* Profile Section */}
        <div className="settings-section card">
          <div className="section-header">
            <span className="material-symbols-outlined text-primary">person</span>
            <h3>{t('settings.user.profile.title')}</h3>
          </div>
          <div className="settings-content">
            <div className="form-group">
              <label>{t('settings.user.profile.nameLabel')}</label>
              <input 
                type="text" 
                value={profile?.displayName || ''} 
                onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                className="form-control"
                placeholder={t('settings.user.profile.namePlaceholder')}
              />
            </div>
            <div className="form-group">
              <label>{t('settings.user.profile.emailLabel')}</label>
              <input type="text" value={profile?.email || ''} readOnly className="form-control readonly" />
              <small className="form-hint">{t('settings.user.profile.emailHint')}</small>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="settings-section card">
          <div className="section-header">
            <span className="material-symbols-outlined text-primary">notifications</span>
            <h3>{t('settings.user.notifications.title')}</h3>
          </div>
          <div className="settings-content">
            <p className="section-desc">{t('settings.user.notifications.desc')}</p>
            
            <div className="preferences-list">
              <div className="preference-item">
                <div className="pref-info">
                  <strong>{t('settings.user.notifications.welcome.title')}</strong>
                  <p>{t('settings.user.notifications.welcome.desc')}</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={profile?.emailPreferences?.welcome !== false} 
                    onChange={() => handleTogglePreference('welcome')} 
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="preference-item">
                <div className="pref-info">
                  <strong>{t('settings.user.notifications.invite.title')}</strong>
                  <p>{t('settings.user.notifications.invite.desc')}</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={profile?.emailPreferences?.invite !== false} 
                    onChange={() => handleTogglePreference('invite')} 
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="preference-item">
                <div className="pref-info">
                  <strong>{t('settings.user.notifications.newJob.title')}</strong>
                  <p>{t('settings.user.notifications.newJob.desc')}</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={profile?.emailPreferences?.newJob !== false} 
                    onChange={() => handleTogglePreference('newJob')} 
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="preference-item">
                <div className="pref-info">
                  <strong>{t('settings.user.notifications.newCandidate.title')}</strong>
                  <p>{t('settings.user.notifications.newCandidate.desc')}</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={profile?.emailPreferences?.newCandidate !== false} 
                    onChange={() => handleTogglePreference('newCandidate')} 
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="preference-item">
                <div className="pref-info">
                  <strong>{t('settings.user.notifications.pipeline.title')}</strong>
                  <p>{t('settings.user.notifications.pipeline.desc')}</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={profile?.emailPreferences?.pipeline !== false} 
                    onChange={() => handleTogglePreference('pipeline')} 
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-footer">
        <button className="btn btn-primary btn-large" onClick={handleSave} disabled={saving}>
          {saving ? t('settings.user.saving') : t('settings.user.saveBtn')}
        </button>
      </div>
    </div>
  );
}
