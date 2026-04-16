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
  const { workspaces, activeWorkspace, switchWorkspace, createWorkspace, pendingInvites, acceptInvite, declineInvite, getPendingInvites } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingInvite, setIsProcessingInvite] = useState(false);
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
          {pendingInvites.length > 0 && (
            <span style={{ 
              backgroundColor: 'var(--color-danger)', 
              color: 'white', 
              fontSize: '0.75rem', 
              fontWeight: 'bold', 
              padding: '0.1rem 0.4rem', 
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {pendingInvites.length}
            </span>
          )}
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

          {pendingInvites.length > 0 && (
            <div className="dropdown-section invitations">
              <h4 className="section-title">Pending Invitations</h4>
              {pendingInvites.map((invite) => (
                <div key={invite.id} className="invitation-item">
                  <div className="invitation-info">
                    <span className="invitation-name">{invite.workspaceName}</span>
                    <span className="invitation-role">Role: {invite.role}</span>
                  </div>
                  <button 
                    className="accept-btn"
                    style={{ backgroundColor: 'var(--color-primary)', color: 'white', border: 'none' }}
                    onClick={() => {
                      setSelectedInvite(invite);
                      setIsOpen(false);
                    }}
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          )}

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
                  <textarea 
                    placeholder="Briefly describe the purpose of this workspace..."
                    value={formData.description}
                    style={{ minHeight: '80px', paddingTop: '0.75rem' }}
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
      {/* Invitation Review Modal */}
      {selectedInvite && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-body" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
              <div style={{ 
                backgroundColor: 'var(--color-primary-bg)', 
                borderRadius: '50%', 
                marginBottom: '1.25rem', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '64px', 
                height: '64px' 
              }}>
                <span className="material-symbols-outlined flex-shrink-0 !text-[32px] text-primary">mail</span>
              </div>
              
              <h3 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '0.75rem' }}>Workspace Invitation</h3>
              
              <p className="text-secondary" style={{ marginBottom: '2rem', lineHeight: 1.6, fontSize: '0.9375rem' }}>
                <strong>{selectedInvite.invitedByEmail || 'A colleague'}</strong> has invited you to join their workspace.
              </p>

              <div style={{ 
                backgroundColor: 'var(--color-surface-hover)', 
                borderRadius: 'var(--radius-md)', 
                padding: '1.5rem', 
                textAlign: 'left', 
                border: '1px solid var(--color-surface-border)', 
                marginBottom: '2rem' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <span className="material-symbols-outlined flex-shrink-0 !text-[20px] text-primary">domain</span>
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', fontWeight: 700 }}>Workspace</div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.9375rem', marginTop: '0.125rem' }}>{selectedInvite.workspaceName}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className="material-symbols-outlined flex-shrink-0 !text-[20px] text-success">check_circle</span>
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', fontWeight: 700 }}>Your Role</div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text)', textTransform: 'capitalize', fontSize: '0.9375rem', marginTop: '0.125rem' }}>{selectedInvite.role}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="button" 
                className="btn-secondary" 
                style={{ flex: 1, padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onClick={async () => {
                  setIsProcessingInvite(true);
                  try {
                    await declineInvite(selectedInvite);
                    toast({ type: 'success', message: 'Invitation declined' });
                    setSelectedInvite(null);
                  } catch (err) {
                    toast({ type: 'error', message: 'Failed to decline invite' });
                    setIsProcessingInvite(false);
                  }
                }} 
                disabled={isProcessingInvite}
              >
                <span className="material-symbols-outlined flex-shrink-0 !text-[18px]">cancel</span> Decline
              </button>
              
              <button 
                type="button" 
                className="btn-primary" 
                style={{ flex: 1, padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onClick={async () => {
                  setIsProcessingInvite(true);
                  try {
                    await acceptInvite(selectedInvite);
                    
                    if (typeof window.gtag === 'function') {
                      window.gtag('event', 'invite_accepted', { 'role': selectedInvite.role });
                    }

                    toast({ type: 'success', message: 'Welcome to the workspace!' });
                    setSelectedInvite(null);
                    window.location.reload(); 
                  } catch (err) {
                    toast({ type: 'error', message: 'Failed to accept invite' });
                    setIsProcessingInvite(false);
                  }
                }} 
                disabled={isProcessingInvite}
              >
                <span className="material-symbols-outlined flex-shrink-0 !text-[18px]">check_circle</span> Accept
              </button>
            </div>
            
            {isProcessingInvite && <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Processing...</div>}
            
               {!isProcessingInvite && (
                 <button 
                   onClick={() => setSelectedInvite(null)} 
                   style={{ 
                     background: 'none', 
                     border: 'none', 
                     width: '100%', 
                     padding: '0.5rem', 
                     marginTop: '1rem',
                     color: 'var(--color-text-muted)', 
                     fontSize: '0.8125rem', 
                     cursor: 'pointer',
                     fontWeight: 500
                   }}
                 >
                   Close & decide later
                 </button>
               )}
             </div>
           </div>
         </div>
       )}
    </div>
  );
}
