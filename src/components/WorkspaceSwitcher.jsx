import React, { useState, useRef, useEffect } from 'react';

import { useWorkspace } from '../contexts/WorkspaceContext';
import { useTranslation } from 'react-i18next';
import { useToast } from '../contexts/ToastContext';
import './WorkspaceSwitcher.css';

const WORKSPACE_COLORS = [
  '#4F46E5', // Indigo
  '#7C3AED', // Violet
  '#EC4899', // Pink
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#F97316', // Orange
];

const getWorkspaceColor = (id) => {
  if (!id) return WORKSPACE_COLORS[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % WORKSPACE_COLORS.length;
  return WORKSPACE_COLORS[index];
};

export default function WorkspaceSwitcher({ variant = 'default', isCollapsed = false }) {
  const { 
    workspaces, 
    activeWorkspace, 
    switchWorkspace, 
    createWorkspace, 
    currentUser, 
    setIsUpgradeModalOpen 
  } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();
  const toast = useToast();
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    avatarUrl: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    language: 'en'
  });

  const slugPreview = formData.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreateClick = () => {
    const ownedFreeCount = workspaces.filter(
      ws => ws.ownerId === currentUser?.uid && (ws.plan === 'free' || !ws.plan)
    ).length;

    if (ownedFreeCount >= 2) {
      setIsOpen(false);
      setIsUpgradeModalOpen(true);
      toast({
        type: 'warning',
        message: t('workspace.limitExceededToast', 'Bạn đã đạt giới hạn tối đa 2 Workspace ở gói miễn phí. Vui lòng nâng cấp!')
      });
    } else {
      setShowCreateModal(true);
      setIsOpen(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    setIsSubmitting(true);
    try {
      await createWorkspace(formData);
      
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'create_workspace');
      }

      setFormData({
        name: '',
        description: '',
        avatarUrl: '',
        timezone: 'UTC',
        language: 'en'
      });
      setShowCreateModal(false);
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      if (error.code === 'WORKSPACE_LIMIT_EXCEEDED') {
        setShowCreateModal(false);
        setIsUpgradeModalOpen(true);
        toast({
          type: 'warning',
          message: error.message || t('workspace.limitExceededToast', 'Bạn đã đạt giới hạn tối đa 2 Workspace ở gói miễn phí. Vui lòng nâng cấp!')
        });
      } else {
        toast({
          type: 'error',
          message: t('workspace.createFailedToast', 'Failed to create workspace. Please try again.')
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeColor = getWorkspaceColor(activeWorkspace?.id);

  return (
    <div className={`workspace-switcher-container ${variant === 'header' ? 'variant-header' : ''} ${isCollapsed ? 'collapsed' : ''}`} ref={dropdownRef}>
      <button 
        className={`workspace-trigger ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        title={isCollapsed ? activeWorkspace?.name : undefined}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="workspace-avatar" style={{ backgroundColor: activeColor }}>
          {activeWorkspace?.name?.charAt(0).toUpperCase() || 'W'}
        </div>
        {!isCollapsed && (
          <>
            <div className="workspace-info">
              <span className="workspace-name">{activeWorkspace?.name || t('workspace.loading')}</span>
              <span className="workspace-role">{activeWorkspace?.myRole || t('workspace.member')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={`material-symbols-outlined flex-shrink-0 !text-[16px] ${ `chevron ${isOpen ? 'rotated' : '' }`} `}>expand_more</span>
            </div>
          </>
        )}
      </button>

      {isOpen && (
        <div className="workspace-dropdown">
          <div className="dropdown-section">
            <h4 className="section-title">{t('workspace.yourWorkspaces')}</h4>
            {workspaces.map((ws) => (
              <button 
                key={ws.id} 
                className={`workspace-item ${activeWorkspace?.id === ws.id ? 'current' : ''}`}
                onClick={() => {
                  switchWorkspace(ws.id);
                  setIsOpen(false);
                }}
              >
                <div className="item-avatar" style={{ backgroundColor: getWorkspaceColor(ws.id), color: 'white' }}>
                  {ws.name.charAt(0).toUpperCase()}
                </div>
                <span className="item-name">{ws.name}</span>
                {activeWorkspace?.id === ws.id && <span className="material-symbols-outlined flex-shrink-0 !text-[16px] text-primary">check</span>}
              </button>
            ))}
          </div>

          <div className="dropdown-divider"></div>
          
          <button className="dropdown-item-action" onClick={handleCreateClick}>
            <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">add</span>
            <span>{t('workspace.createNew')}</span>
          </button>
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('workspace.createNew')}</h3>
              <p className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{t('workspace.createSubtitle')}</p>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleCreate}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>{t('workspace.nameLabel')}</label>
                  <input 
                    type="text" 
                    autoFocus 
                    required
                    placeholder={t('workspace.namePlaceholder')}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                  {formData.name && (
                    <div className="slug-preview">
                      {t('workspace.urlIdentifier')}: <span className="text-primary">hrlite.app/w/{slugPreview}</span>
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>{t('workspace.descriptionLabel')}</label>
                  <input 
                    type="text"
                    placeholder={t('workspace.descriptionPlaceholder')}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>{t('workspace.languageLabel')}</label>
                  <select 
                    value={formData.language}
                    onChange={(e) => setFormData({...formData, language: e.target.value})}
                  >
                    <option value="en">English (Global)</option>
                    <option value="vi">Vietnamese (Tiếng Việt)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t('workspace.timezoneLabel')}</label>
                  <select 
                    value={formData.timezone}
                    onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                  >
                    <option value="UTC">UTC (Universal)</option>
                    <option value="Asia/Ho_Chi_Minh">Asia/Ho Chi Minh (GMT+7)</option>
                    <option value="America/New_York">US Eastern Time (GMT-5)</option>
                    <option value="Europe/London">London (GMT+0)</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>{t('workspace.avatarLabel')}</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input 
                      type="url" 
                      placeholder="https://example.com/logo.png"
                      value={formData.avatarUrl}
                      onChange={(e) => setFormData({...formData, avatarUrl: e.target.value})}
                      style={{ flex: 1 }}
                    />
                    {formData.avatarUrl && (
                      <div className="avatar-preview-small">
                        <img src={formData.avatarUrl} alt="Preview" onError={(e) => e.target.style.display='none'} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

                <div className="flex flex-col sm:flex-row justify-end gap-4 mt-10">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)} disabled={isSubmitting}>
                    {t('common.cancel')}
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? t('workspace.creating') : t('workspace.createNew')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
