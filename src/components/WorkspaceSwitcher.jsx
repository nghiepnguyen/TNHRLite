import React, { useState, useRef, useEffect } from 'react';

import { useWorkspace } from '../contexts/WorkspaceContext';
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

export default function WorkspaceSwitcher({ variant = 'default' }) {
  const { workspaces, activeWorkspace, switchWorkspace, createWorkspace } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      alert('Failed to create workspace. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeColor = getWorkspaceColor(activeWorkspace?.id);

  return (
    <div className={`workspace-switcher-container ${variant === 'header' ? 'variant-header' : ''}`} ref={dropdownRef}>
      <button 
        className={`workspace-trigger ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="workspace-avatar" style={{ backgroundColor: activeColor }}>
          {activeWorkspace?.name?.charAt(0).toUpperCase() || 'W'}
        </div>
        <div className="workspace-info">
          <span className="workspace-name">{activeWorkspace?.name || 'Loading...'}</span>
          <span className="workspace-role">{activeWorkspace?.myRole || 'Member'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className={`material-symbols-outlined flex-shrink-0 !text-[16px] ${ `chevron ${isOpen ? 'rotated' : '' }`} `}>expand_more</span>
        </div>
      </button>

      {isOpen && (
        <div className="workspace-dropdown">
          <div className="dropdown-section">
            <h4 className="section-title">Your Workspaces</h4>
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
          
          <button className="dropdown-item-action" onClick={() => setShowCreateModal(true)}>
            <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">add</span>
            <span>Create New Workspace</span>
          </button>
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Workspace</h3>
              <p className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Set up your team's recruitment environment.</p>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleCreate}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Workspace Name*</label>
                  <input 
                    type="text" 
                    autoFocus 
                    required
                    placeholder="e.g. Acme Recruitment Team"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                  {formData.name && (
                    <div className="slug-preview">
                      URL identifier: <span className="text-primary">hrlite.app/w/{slugPreview}</span>
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Description</label>
                  <input 
                    type="text"
                    placeholder="Briefly describe the purpose of this workspace..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Language</label>
                  <select 
                    value={formData.language}
                    onChange={(e) => setFormData({...formData, language: e.target.value})}
                  >
                    <option value="en">English (Global)</option>
                    <option value="vi">Vietnamese (Tiếng Việt)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Timezone</label>
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
                  <label>Logo / Avatar URL</label>
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

                <div className="modal-actions" style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)} disabled={isSubmitting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Workspace'}
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
