import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';

import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { getWorkspaceMembers, inviteMember, updateWorkspace, deleteWorkspace, getWorkspaceInvites, deleteInvite } from '../../services/workspace.service';
import { useToast } from '../../contexts/ToastContext';

export default function WorkspaceSettings() {
  const { workspaceId } = useParams();
  const { activeWorkspace, userProfile, workspaces } = useWorkspace();
  const { t, i18n } = useTranslation();
  const isOnlyWorkspace = workspaces?.length === 1;
  const toast = useToast();
  
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [inviting, setInviting] = useState(false);
  const [revokingId, setRevokingId] = useState(null);
  const [removingMemberId, setRemovingMemberId] = useState(null);
  
  const [workspaceName, setWorkspaceName] = useState(activeWorkspace?.name || '');
  const [updatingName, setUpdatingName] = useState(false);
  
  // Deletion state
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [isLeaving, setIsLeaving] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'general';
  
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (activeWorkspace) {
      setWorkspaceName(activeWorkspace.name);
    }
  }, [activeWorkspace]);

  useEffect(() => {
    async function loadMembers() {
      if (!workspaceId) return;
      try {
        setLoading(true);
        const [membersData, invitesData] = await Promise.all([
          getWorkspaceMembers(workspaceId),
          getWorkspaceInvites(workspaceId)
        ]);
        setMembers(membersData);
        setInvites(invitesData.filter(inv => inv.status === 'pending'));
      } catch (err) {
        console.error("Error loading members/invites:", err);
        toast({ type: 'error', message: t('jobsPage.messages.loadError') });
      } finally {
        setLoading(false);
      }
    }
    loadMembers();
  }, [workspaceId, toast]);

  // Real-time activity listener for Activity Tab
  useEffect(() => {
    if (workspaceId && activeTab === 'activity') {
      const q = query(
        collection(db, 'activities'),
        where('workspaceId', '==', workspaceId)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const sortedActivities = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0))
          .slice(0, 50); // Show more in full activity tab
        setActivities(sortedActivities);
      });
      return () => unsubscribe();
    }
  }, [workspaceId, activeTab]);

  const setTab = (tab) => {
    setSearchParams({ tab });
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp || typeof timestamp.toDate !== 'function') return t('settings.activity.justNow');
    const date = timestamp.toDate();
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return t('settings.activity.justNow');
    if (diffInSeconds < 3600) return t('settings.activity.ago', { count: Math.floor(diffInSeconds / 60), unit: 'm' });
    if (diffInSeconds < 86400) return t('settings.activity.ago', { count: Math.floor(diffInSeconds / 3600), unit: 'h' });
    return date.toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-GB');
  };

  const getActivityMessage = (act) => {
    const name = <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{act.entity?.name}</span>;
    switch (act.action) {
      case 'JOB_CREATED': return t('settings.activity.messages.JOB_CREATED', { name: act.entity?.name });
      case 'CANDIDATE_CREATED': return t('settings.activity.messages.CANDIDATE_CREATED', { name: act.entity?.name });
      case 'CV_UPLOADED': return t('settings.activity.messages.CV_UPLOADED', { name: act.entity?.name });
      case 'STAGE_CHANGED': return t('settings.activity.messages.STAGE_CHANGED', { name: act.entity?.name, stage: act.details?.newStage });
      case 'APPLICATION_CREATED': return t('settings.activity.messages.APPLICATION_CREATED', { name: act.entity?.name });
      case 'NOTE_ADDED': return t('settings.activity.messages.NOTE_ADDED', { name: act.entity?.name });
      case 'INVITATION_ACCEPTED': return t('settings.activity.messages.INVITATION_ACCEPTED', { role: act.details?.role });
      case 'INVITATION_DECLINED': return t('settings.activity.messages.INVITATION_DECLINED');
      case 'MEMBER_REMOVED': return t('settings.activity.messages.MEMBER_REMOVED', { name: act.entity?.name });
      case 'MEMBER_LEFT': return t('settings.activity.messages.MEMBER_LEFT');
      default: return <>action: {act.action}</>;
    }
  };

  const SafeImage = ({ src, name, size = '32px' }) => {
    const [error, setError] = useState(false);
    if (src && !error) {
      return (
        <img 
          src={src} 
          alt="" 
          style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} 
          onError={() => setError(true)}
        />
      );
    }
    const initials = (name || '?').charAt(0).toUpperCase();
    return (
      <div style={{ 
        width: size, 
        height: size, 
        borderRadius: '50%', 
        backgroundColor: 'var(--color-primary-bg)', 
        color: 'var(--color-primary)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontSize: `calc(${size} / 2.5)`, 
        fontWeight: 700 
      }}>
        {initials}
      </div>
    );
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    setInviting(true);
    try {
      await inviteMember(
        workspaceId, 
        activeWorkspace?.name || 'New Workspace', 
        inviteEmail, 
        inviteRole, 
        userProfile?.id,
        userProfile?.email
      );
      
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'send_invite', { 'role': inviteRole });
      }

      toast({ type: 'success', message: t('settings.invite.success', { email: inviteEmail }) });
      setInviteEmail('');
      // Reload lists
      const invitesData = await getWorkspaceInvites(workspaceId);
      setInvites(invitesData.filter(inv => inv.status === 'pending'));
    } catch (err) {
      console.error("Error inviting member:", err);
      toast({ type: 'error', message: t('settings.invite.fail') });
    } finally {
      setInviting(false);
    }
  };

  const handleRevokeInvite = async (inviteId) => {
    if (!window.confirm(t('settings.members.revokeConfirm'))) return;
    setRevokingId(inviteId);
    try {
      await deleteInvite(inviteId);

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'revoke_invite');
      }

      toast({ type: 'success', message: t('common.success') });
      setInvites(invites.filter(inv => inv.id !== inviteId));
    } catch (err) {
      console.error("Error revoking invite:", err);
      toast({ type: 'error', message: t('settings.members.revokeFail') || t('common.error') });
    } finally {
      setRevokingId(null);
    }
  };


  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!workspaceName.trim() || workspaceName === activeWorkspace?.name) return;
    
    setUpdatingName(true);
    try {
      await updateWorkspace(workspaceId, { name: workspaceName });
      toast({ type: 'success', message: t('common.success') });
      // Reload page to reflect name changes in context
      window.location.reload(); 
    } catch (err) {
      console.error("Error updating workspace name:", err);
      toast({ type: 'error', message: t('common.error') });
    } finally {
      setUpdatingName(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (deleteConfirmName !== activeWorkspace?.name) {
      toast({ type: 'error', message: t('settings.danger.nameMismatch') });
      return;
    }
    
    let confirmMessage = t('settings.danger.deleteConfirm');
    if (isOnlyWorkspace) {
      confirmMessage = t('settings.danger.deleteConfirmOnly');
    }

    if (!window.confirm(confirmMessage)) return;

    setIsDeleting(true);
    try {
      await deleteWorkspace(workspaceId);

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'delete_workspace');
      }

      toast({ type: 'success', message: t('common.success') });
      // Redirect to dashboard root, WorkspaceProvider will pick the next available workspace
      navigate('/dashboard', { replace: true });
      window.location.reload();
    } catch (err) {
      console.error("Error deleting workspace:", err);
      toast({ type: 'error', message: t('common.error') });
      setIsDeleting(false);
    }
  };

  const handleLeaveWorkspace = async () => {
    if (activeWorkspace?.myRole === 'owner') {
      toast({ type: 'error', message: t('settings.danger.ownerLeaveError') });
      return;
    }

    const confirmMessage = t('settings.danger.leaveConfirm');
    if (!window.confirm(confirmMessage)) return;

    setIsLeaving(true);
    try {
      const { removeWorkspaceMember } = await import('../../services/workspace.service');
      const { logActivity } = await import('../../services/db');
      
      await removeWorkspaceMember(workspaceId, userProfile.id, userProfile.id, true);
      
      // Log leave activity for the owner/admins to see
      await logActivity(
        workspaceId, 
        userProfile, 
        'MEMBER_LEFT', 
        { name: userProfile.email, id: userProfile.id, type: 'member' },
        { email: userProfile.email, role: activeWorkspace?.myRole }
      );

      toast({ type: 'success', message: t('common.success') });
      // Redirect to dashboard root, WorkspaceProvider will pick the next available workspace or default
      navigate('/dashboard', { replace: true });
      window.location.reload();
    } catch (err) {
      console.error("Error leaving workspace:", err);
      toast({ type: 'error', message: t('common.error') });
      setIsLeaving(false);
    }
  };

  const handleRemoveMember = async (member) => {
    if (!member || !member.userId) return;
    if (member.role === 'owner') {
      toast({ type: 'error', message: 'The workspace owner cannot be removed.' });
      return;
    }

    if (!window.confirm(t('settings.members.removeConfirm', { email: member.email }))) return;

    setRemovingMemberId(member.userId);
    try {
      const { removeWorkspaceMember } = await import('../../services/workspace.service');
      const { logActivity } = await import('../../services/db');
      
      await removeWorkspaceMember(workspaceId, member.userId, userProfile.id);
      
      // Log activity
      await logActivity(
        workspaceId, 
        userProfile, 
        'MEMBER_REMOVED', 
        { name: member.email, id: member.userId, type: 'member' },
        { email: member.email, role: member.role }
      );

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'remove_member', { 'role': member.role });
      }

      toast({ type: 'success', message: t('common.success') });
      // Update local state instead of full reload
      setMembers(members.filter(m => m.userId !== member.userId));
    } catch (err) {
      console.error("Error removing member in settings:", err);
      toast({ type: 'error', message: t('common.error') });
    } finally {
      setRemovingMemberId(null);
    }
  };


  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner': return <span className="material-symbols-outlined flex-shrink-0 !text-[16px] text-warning">stars</span>;
      case 'admin': return <span className="material-symbols-outlined flex-shrink-0 !text-[16px] text-primary">local_police</span>;
      case 'editor': return <span className="material-symbols-outlined flex-shrink-0 !text-[16px] text-success">how_to_reg</span>;
      case 'viewer': return <span className="material-symbols-outlined flex-shrink-0 !text-[16px] text-secondary">visibility</span>;
      default: return <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">group</span>;
    }
  };

  const canInvite = activeWorkspace?.myRole === 'owner' || activeWorkspace?.myRole === 'admin';

  if (loading) return <div style={{ padding: '2rem' }}>{t('workspace.loading')}</div>;

  return (
    <div className="settings-container">
      <div style={{ marginBottom: '2.5rem' }}>
        <Link to={`/dashboard/w/${workspaceId}`} className="text-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
          <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">arrow_back</span> {t('settings.back')}
        </Link>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.025em' }}>{t('settings.title')}</h1>
        <p className="text-secondary" style={{ marginTop: '0.5rem' }}>{t('settings.subtitle')}</p>
      </div>

      {/* TABS NAVIGATION */}
      <div className="ws-tabs-nav">
        <button 
          onClick={() => setTab('general')}
          className={`ws-tab-btn ${activeTab === 'general' ? 'ws-tab-active' : ''}`}
        >
          <span className="material-symbols-outlined flex-shrink-0 !text-[18px]">settings</span>
          <span>{t('settings.tabs.general')}</span>
        </button>
        <button 
          onClick={() => setTab('activity')}
          className={`ws-tab-btn ${activeTab === 'activity' ? 'ws-tab-active' : ''}`}
        >
          <span className="material-symbols-outlined flex-shrink-0 !text-[18px]">history</span>
          <span>{t('settings.tabs.activity')}</span>
        </button>
      </div>

      {activeTab === 'general' ? (
        <div className="ws-general-grid">
        
        {/* Left Column: Settings & Members */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* General Settings */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="material-symbols-outlined flex-shrink-0 !text-[20px] text-primary">settings</span> {t('settings.general.title')}
            </h3>
            <form onSubmit={handleUpdateName}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">{t('settings.general.nameLabel')}</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder={t('settings.general.namePlaceholder')}
                  required
                />
              </div>
              {activeWorkspace?.myRole === 'owner' || activeWorkspace?.myRole === 'admin' ? (
                <button type="submit" className="btn btn-primary" disabled={updatingName || workspaceName === activeWorkspace?.name}>
                  {updatingName ? t('settings.general.saving') : t('settings.general.saveBtn')}
                </button>
              ) : (
                <p className="text-secondary" style={{ fontSize: '0.875rem' }}>{t('settings.general.adminOnly')}</p>
              )}
            </form>
          </div>



          {/* Members List */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="material-symbols-outlined flex-shrink-0 !text-[20px] text-primary">group</span> {t('settings.members.title')}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {members.map((member) => (
                <div key={member.id} className="ws-member-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', minWidth: 0 }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', fontWeight: 700, flexShrink: 0 }}>
                      {member.email.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.email}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-text-secondary)', fontSize: '0.75rem', textTransform: 'capitalize', marginTop: '0.125rem' }}>
                        {getRoleIcon(member.role)} {t(`settings.roles.${member.role}.title`)}
                      </div>
                    </div>
                  </div>
                  
                  {member.role !== 'owner' && (activeWorkspace?.myRole === 'owner' || activeWorkspace?.myRole === 'admin') && (
                    <button 
                      className="btn btn-icon text-danger" 
                      title={t('settings.members.removeTooltip')}
                      onClick={() => handleRemoveMember(member)}
                      disabled={removingMemberId === member.userId}
                    >
                      <span className="material-symbols-outlined flex-shrink-0 !text-[18px]">
                        {removingMemberId === member.userId ? 'sync' : 'delete'}
                      </span>
                    </button>
                  )}

                </div>
              ))}
            </div>
          </div>

          {/* Sent Invites List */}
          {invites.length > 0 && (
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="material-symbols-outlined flex-shrink-0 !text-[20px] text-primary">schedule</span> {t('settings.members.invitesTitle')}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {invites.map((invite) => (
                  <div key={invite.id} className="interactive-row-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--color-surface-border)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.7 }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', fontWeight: 700, border: '1px dashed var(--color-border)' }}>
                        {invite.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{invite.email}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-text-secondary)', fontSize: '0.75rem', textTransform: 'capitalize', marginTop: '0.125rem' }}>
                          {getRoleIcon(invite.role)} {t(`settings.roles.${invite.role}.title`)} ({t('settings.members.pending')})
                        </div>
                      </div>
                    </div>
                    
                    {(activeWorkspace?.myRole === 'owner' || activeWorkspace?.myRole === 'admin') && (
                      <button 
                        className="btn btn-sm btn-outline text-danger" 
                        onClick={() => handleRevokeInvite(invite.id)}
                        disabled={revokingId === invite.id}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        {revokingId === invite.id ? t('settings.members.revoking') : t('settings.members.revokeBtn')}
                      </button>
                    )}

                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Invites & Guide */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {canInvite ? (
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="material-symbols-outlined flex-shrink-0 !text-[20px] text-primary">person_add</span> {t('settings.invite.title')}
              </h3>
              
              <form onSubmit={handleInvite}>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">{t('settings.invite.emailLabel')}</label>
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined flex-shrink-0 !text-[18px]" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>mail</span>
                    <input 
                      type="email" 
                      className="form-control" 
                      style={{ paddingLeft: '40px' }} 
                      placeholder={t('settings.invite.emailPlaceholder')}
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">{t('settings.invite.roleLabel')}</label>
                  <select 
                    className="form-control"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                  >
                    <option value="admin">{t('settings.roles.admin.option')}</option>
                    <option value="editor">{t('settings.roles.editor.option')}</option>
                    <option value="viewer">{t('settings.roles.viewer.option')}</option>
                  </select>
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                  disabled={inviting}
                >
                  {inviting ? t('settings.invite.sending') : t('settings.invite.sendBtn')}
                </button>
              </form>
            </div>
          ) : (
            <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface-hover)', borderStyle: 'dashed' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span className="material-symbols-outlined flex-shrink-0 !text-[20px] text-secondary">shield</span>
                <div>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.5rem' }}>{t('settings.invite.restrictedTitle')}</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    {t('settings.invite.restrictedDesc', { role: t(`settings.roles.${activeWorkspace?.myRole}.title`) })}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="card" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>{t('settings.roles.guide')}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <span className="material-symbols-outlined flex-shrink-0 !text-[16px] text-warning"  style={{ flexShrink: 0, marginTop: '2px' }}>stars</span>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{t('settings.roles.owner.title')}</div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{t('settings.roles.owner.desc')}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <span className="material-symbols-outlined flex-shrink-0 !text-[16px] text-primary"  style={{ flexShrink: 0, marginTop: '2px' }}>local_police</span>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{t('settings.roles.admin.title')}</div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{t('settings.roles.admin.desc')}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <span className="material-symbols-outlined flex-shrink-0 !text-[16px] text-success"  style={{ flexShrink: 0, marginTop: '2px' }}>how_to_reg</span>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{t('settings.roles.editor.title')}</div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{t('settings.roles.editor.desc')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone: Delete Workspace */}
          {activeWorkspace?.myRole === 'owner' && (
            <div className="card border-danger" style={{ padding: '2rem', border: '1px solid var(--color-danger)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-danger)' }}>
                <span className="material-symbols-outlined flex-shrink-0 !text-[20px]">error</span> {t('settings.danger.title')}
              </h3>
              <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                {t('settings.danger.deleteDesc')}
                {isOnlyWorkspace && (
                  <span style={{ display: 'block', marginTop: '0.5rem', color: 'var(--color-danger)', fontWeight: 600 }}>
                    {t('settings.danger.lastWorkspaceNote')}
                  </span>
                )}
              </p>
              
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>
                  {t('settings.danger.typeToConfirm', { name: activeWorkspace?.name })}
                </label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  placeholder={t('settings.danger.typePlaceholder')}
                />
              </div>
              <button 
                className="btn btn-danger" 
                onClick={handleDeleteWorkspace}
                disabled={isDeleting || deleteConfirmName !== activeWorkspace?.name}
              >
                <span className="material-symbols-outlined flex-shrink-0 !text-[18px]">delete</span>
                <span>{isDeleting ? t('settings.danger.deleting') : t('settings.danger.deleteBtn')}</span>
              </button>
            </div>
          )}

          {/* Danger Zone: Leave Workspace (For Non-owners) */}
          {activeWorkspace?.myRole !== 'owner' && (
            <div className="card border-warning" style={{ padding: '2rem', border: '1px solid var(--color-warning)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-warning)' }}>
                <span className="material-symbols-outlined flex-shrink-0 !text-[20px]">error</span> {t('settings.danger.title')}
              </h3>
              <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                {t('settings.danger.leaveDesc')}
              </p>
              <button 
                className="btn btn-outline" 
                style={{ borderColor: 'var(--color-warning)', color: 'var(--color-warning)' }}
                onClick={handleLeaveWorkspace}
                disabled={isLeaving}
              >
                <span className="material-symbols-outlined flex-shrink-0 !text-[18px]">delete</span>
                <span>{isLeaving ? t('settings.danger.leaving') : t('settings.danger.leaveBtn')}</span>
              </button>
            </div>
          )}

        </div>

      </div>
      ) : (
        /* FULL ACTIVITY HISTORY TAB */
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{t('settings.activity.title')}</h3>
            <p className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{t('settings.activity.subtitle')}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {activities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1.5rem', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-surface-border)' }}>
                <span className="material-symbols-outlined flex-shrink-0 !text-[48px]" style={{ opacity: 0.2, marginBottom: '1.5rem' }}>history</span>
                <p style={{ margin: 0, fontWeight: 500, color: 'var(--color-text-secondary)', fontSize: '1rem' }}>{t('settings.activity.empty')}</p>
                <p style={{ fontSize: '0.8125rem', marginTop: '0.5rem', opacity: 0.7 }}>{t('settings.activity.emptyHint')}</p>
              </div>
            ) : (
              activities.map((act, idx) => (
                <div key={idx} className="ws-activity-row" style={{ 
                  borderBottom: idx < activities.length - 1 ? '1px solid var(--color-surface-border)' : 'none' 
                }}>
                  <div style={{ flexShrink: 0 }}>
                    <SafeImage src={act.actor?.photoURL} name={act.actor?.name} size="40px" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                      <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{act.actor?.name || 'Someone'}</span> {getActivityMessage(act)}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <span className="material-symbols-outlined flex-shrink-0 !text-[14px]">schedule</span> {formatRelativeTime(act.timestamp)} 
                      <span style={{ opacity: 0.5 }}>•</span>
                      <span>{t('settings.activity.actionId')}: {act.id.substring(0, 8)}...</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
