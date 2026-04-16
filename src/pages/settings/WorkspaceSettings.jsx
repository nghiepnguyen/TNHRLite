import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';

import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { getWorkspaceMembers, inviteMember, updateWorkspace, deleteWorkspace, getWorkspaceInvites, revokeInvite } from '../../services/workspace.service';
import { useToast } from '../../contexts/ToastContext';

export default function WorkspaceSettings() {
  const { workspaceId } = useParams();
  const { activeWorkspace, userProfile, workspaces } = useWorkspace();
  const isOnlyWorkspace = workspaces?.length === 1;
  const toast = useToast();
  
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [inviting, setInviting] = useState(false);
  
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
        toast({ type: 'error', message: 'Failed to load workspace data.' });
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
    if (!timestamp || typeof timestamp.toDate !== 'function') return 'Just now';
    const date = timestamp.toDate();
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const getActivityMessage = (act) => {
    const name = <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{act.entity?.name}</span>;
    switch (act.action) {
      case 'JOB_CREATED': return <>posted a new job: {name}</>;
      case 'CANDIDATE_CREATED': return <>added candidate: {name}</>;
      case 'CV_UPLOADED': return <>uploaded CV for: {name}</>;
      case 'STAGE_CHANGED': return <>moved {name} to <span className="badge badge-neutral" style={{ fontSize: '10px' }}>{act.details?.newStage}</span></>;
      case 'APPLICATION_CREATED': return <>linked {name} to a job pipeline</>;
      case 'NOTE_ADDED': return <>updated notes for: {name}</>;
      case 'INVITATION_ACCEPTED': return <>accepted the workspace invitation to join as <span className="badge badge-neutral" style={{ fontSize: '10px' }}>{act.details?.role}</span></>;
      case 'INVITATION_DECLINED': return <><span style={{ color: 'var(--color-danger)' }}>declined</span> the workspace invitation</>;
      case 'MEMBER_REMOVED': return <>removed <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{act.entity?.name}</span> from the workspace</>;
      case 'MEMBER_LEFT': return <><span style={{ color: 'var(--color-danger)' }}>left</span> the workspace</>;
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

      toast({ type: 'success', message: `Invitation sent to ${inviteEmail}` });
      setInviteEmail('');
      // Reload lists
      const invitesData = await getWorkspaceInvites(workspaceId);
      setInvites(invitesData.filter(inv => inv.status === 'pending'));
    } catch (err) {
      console.error("Error inviting member:", err);
      toast({ type: 'error', message: 'Failed to send invitation.' });
    } finally {
      setInviting(false);
    }
  };

  const handleRevokeInvite = async (inviteId) => {
    if (!window.confirm('Are you sure you want to revoke this invitation? The user will no longer be able to join using this link.')) return;
    try {
      await revokeInvite(inviteId);

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'revoke_invite');
      }

      toast({ type: 'success', message: 'Invitation revoked.' });
      setInvites(invites.filter(inv => inv.id !== inviteId));
    } catch (err) {
      console.error("Error revoking invite:", err);
      toast({ type: 'error', message: 'Failed to revoke invitation.' });
    }
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!workspaceName.trim() || workspaceName === activeWorkspace?.name) return;
    
    setUpdatingName(true);
    try {
      await updateWorkspace(workspaceId, { name: workspaceName });
      toast({ type: 'success', message: 'Workspace name updated' });
      // Reload page to reflect name changes in context
      window.location.reload(); 
    } catch (err) {
      console.error("Error updating workspace name:", err);
      toast({ type: 'error', message: 'Failed to update workspace name' });
    } finally {
      setUpdatingName(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (deleteConfirmName !== activeWorkspace?.name) {
      toast({ type: 'error', message: 'Workspace name does not match!' });
      return;
    }
    
    let confirmMessage = 'Are you absolutely sure? All jobs and candidates tied to this workspace will become orphaned or deleted!';
    if (isOnlyWorkspace) {
      confirmMessage = '⚠️ DANGER: This is your ONLY workspace! Deleting it will wipe all your visible data. A fresh, empty "My Workspace" will be created for you upon reload. Are you absolutely sure?';
    }

    if (!window.confirm(confirmMessage)) return;

    setIsDeleting(true);
    try {
      await deleteWorkspace(workspaceId);

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'delete_workspace');
      }

      toast({ type: 'success', message: 'Workspace deleted successfully.' });
      // Redirect to dashboard root, WorkspaceProvider will pick the next available workspace
      navigate('/dashboard', { replace: true });
      window.location.reload();
    } catch (err) {
      console.error("Error deleting workspace:", err);
      toast({ type: 'error', message: 'Failed to delete workspace' });
      setIsDeleting(false);
    }
  };

  const handleLeaveWorkspace = async () => {
    if (activeWorkspace?.myRole === 'owner') {
      toast({ type: 'error', message: 'The owner cannot leave the workspace. You must delete the workspace or transfer ownership first.' });
      return;
    }

    const confirmMessage = "Are you sure you want to leave this workspace? You will lose access immediately, and you will need to be re-invited to join again.";
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

      toast({ type: 'success', message: 'You have left the workspace successfully.' });
      // Redirect to dashboard root, WorkspaceProvider will pick the next available workspace or default
      navigate('/dashboard', { replace: true });
      window.location.reload();
    } catch (err) {
      console.error("Error leaving workspace:", err);
      toast({ type: 'error', message: 'Failed to leave the workspace.' });
      setIsLeaving(false);
    }
  };

  const handleRemoveMember = async (member) => {
    if (!member || !member.userId) return;
    if (member.role === 'owner') {
      toast({ type: 'error', message: 'The workspace owner cannot be removed.' });
      return;
    }

    if (!window.confirm(`Are you sure you want to remove ${member.email} from the workspace?`)) return;

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

      toast({ type: 'success', message: 'Member removed successfully.' });
      // Update local state instead of full reload
      setMembers(members.filter(m => m.userId !== member.userId));
    } catch (err) {
      console.error("Error removing member in settings:", err);
      toast({ type: 'error', message: 'Failed to remove member.' });
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

  if (loading) return <div style={{ padding: '2rem' }}>Loading workspace settings...</div>;

  return (
    <div className="settings-container">
      <div style={{ marginBottom: '2.5rem' }}>
        <Link to={`/dashboard/w/${workspaceId}`} className="text-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
          <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">arrow_back</span> Back to Dashboard
        </Link>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.025em' }}>Workspace Settings</h1>
        <p className="text-secondary" style={{ marginTop: '0.5rem' }}>Manage your team and workspace permissions.</p>
      </div>

      {/* TABS NAVIGATION */}
      <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--color-surface-border)', marginBottom: '2rem' }}>
        <button 
          onClick={() => setTab('general')}
          style={{ 
            padding: '1rem 0', 
            fontSize: '0.9375rem', 
            fontWeight: 700, 
            color: activeTab === 'general' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            borderBottom: activeTab === 'general' ? '2px solid var(--color-primary)' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span className="material-symbols-outlined flex-shrink-0 !text-[18px]">settings</span> General & Members
        </button>
        <button 
          onClick={() => setTab('activity')}
          style={{ 
            padding: '1rem 0', 
            fontSize: '0.9375rem', 
            fontWeight: 700, 
            color: activeTab === 'activity' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            borderBottom: activeTab === 'activity' ? '2px solid var(--color-primary)' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span className="material-symbols-outlined flex-shrink-0 !text-[18px]">history</span> Activity History
        </button>
      </div>

      {activeTab === 'general' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        
        {/* Left Column: Settings & Members */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* General Settings */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="material-symbols-outlined flex-shrink-0 !text-[20px] text-primary">settings</span> General Basics
            </h3>
            <form onSubmit={handleUpdateName}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Workspace Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g. Acme Corp Recruiting"
                  required
                />
              </div>
              {activeWorkspace?.myRole === 'owner' || activeWorkspace?.myRole === 'admin' ? (
                <button type="submit" className="btn btn-primary" disabled={updatingName || workspaceName === activeWorkspace?.name}>
                  {updatingName ? 'Saving...' : 'Save Changes'}
                </button>
              ) : (
                <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Only admins can change the workspace name.</p>
              )}
            </form>
          </div>



          {/* Members List */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="material-symbols-outlined flex-shrink-0 !text-[20px] text-primary">group</span> Workspace Members
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {members.map((member) => (
                <div key={member.id} className="interactive-row-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--color-surface-border)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
                      {member.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{member.email}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-text-secondary)', fontSize: '0.75rem', textTransform: 'capitalize', marginTop: '0.125rem' }}>
                        {getRoleIcon(member.role)} {member.role}
                      </div>
                    </div>
                  </div>
                  
                  {member.role !== 'owner' && (activeWorkspace?.myRole === 'owner' || activeWorkspace?.myRole === 'admin') && (
                    <button 
                      className="btn btn-icon text-danger" 
                      title="Remove member"
                      onClick={() => handleRemoveMember(member)}
                    >
                      <span className="material-symbols-outlined flex-shrink-0 !text-[18px]">delete</span>
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
                <span className="material-symbols-outlined flex-shrink-0 !text-[20px] text-primary">schedule</span> Sent Invitations (Outgoing)
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
                          {getRoleIcon(invite.role)} {invite.role} (Pending)
                        </div>
                      </div>
                    </div>
                    
                    {(activeWorkspace?.myRole === 'owner' || activeWorkspace?.myRole === 'admin') && (
                      <button 
                        className="btn btn-sm btn-outline text-danger" 
                        onClick={() => handleRevokeInvite(invite.id)}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        Revoke
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
                <span className="material-symbols-outlined flex-shrink-0 !text-[20px] text-primary">person_add</span> Invite Team Member
              </h3>
              
              <form onSubmit={handleInvite}>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined flex-shrink-0 !text-[18px]" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>mail</span>
                    <input 
                      type="email" 
                      className="form-control" 
                      style={{ paddingLeft: '40px' }} 
                      placeholder="colleague@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Role</label>
                  <select 
                    className="form-control"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                  >
                    <option value="admin">Admin (Full Control)</option>
                    <option value="editor">Editor (Read/Write)</option>
                    <option value="viewer">Viewer (Read Only)</option>
                  </select>
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                  disabled={inviting}
                >
                  {inviting ? 'Sending...' : 'Send Invitation'}
                </button>
              </form>
            </div>
          ) : (
            <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface-hover)', borderStyle: 'dashed' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span className="material-symbols-outlined flex-shrink-0 !text-[20px] text-secondary">shield</span>
                <div>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.5rem' }}>Role Restricted</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    Only Workspace Owners and Admins can invite new members. Your current role is <strong>{activeWorkspace?.myRole}</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="card" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>Permission Guide</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <span className="material-symbols-outlined flex-shrink-0 !text-[16px] text-warning"  style={{ flexShrink: 0, marginTop: '2px' }}>stars</span>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Owner</div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Full access, payment control, and workspace deletion.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <span className="material-symbols-outlined flex-shrink-0 !text-[16px] text-primary"  style={{ flexShrink: 0, marginTop: '2px' }}>local_police</span>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Admin</div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Can manage members, jobs, and all data.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <span className="material-symbols-outlined flex-shrink-0 !text-[16px] text-success"  style={{ flexShrink: 0, marginTop: '2px' }}>how_to_reg</span>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Editor</div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Can create/edit jobs and candidates. Cannot manage members.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone: Delete Workspace */}
          {activeWorkspace?.myRole === 'owner' && (
            <div className="card border-danger" style={{ padding: '2rem', border: '1px solid var(--color-danger)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-danger)' }}>
                <span className="material-symbols-outlined flex-shrink-0 !text-[20px]">error</span> Danger Zone
              </h3>
              <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Deleting this workspace will remove all members from it. This action cannot be undone.
                {isOnlyWorkspace && (
                  <span style={{ display: 'block', marginTop: '0.5rem', color: 'var(--color-danger)', fontWeight: 600 }}>
                    Note: Since this is your last workspace, deleting it will reset your account and create a fresh, empty workspace.
                  </span>
                )}
              </p>
              
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Type <strong style={{ color: 'var(--color-text)' }}>{activeWorkspace?.name}</strong> to confirm
                </label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  placeholder="Type workspace name here"
                />
              </div>
              <button 
                className="btn btn-danger" 
                onClick={handleDeleteWorkspace}
                disabled={isDeleting || deleteConfirmName !== activeWorkspace?.name}
              >
                <span className="material-symbols-outlined flex-shrink-0 !text-[18px]">delete</span>
                <span>{isDeleting ? 'Deleting...' : 'Delete Workspace'}</span>
              </button>
            </div>
          )}

          {/* Danger Zone: Leave Workspace (For Non-owners) */}
          {activeWorkspace?.myRole !== 'owner' && (
            <div className="card border-warning" style={{ padding: '2rem', border: '1px solid var(--color-warning)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-warning)' }}>
                <span className="material-symbols-outlined flex-shrink-0 !text-[20px]">error</span> Danger Zone
              </h3>
              <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Leaving this workspace will immediately revoke your access to its data and candidates. To return, you will need to request a new invitation from an administrator.
              </p>
              <button 
                className="btn btn-outline" 
                style={{ borderColor: 'var(--color-warning)', color: 'var(--color-warning)' }}
                onClick={handleLeaveWorkspace}
                disabled={isLeaving}
              >
                <span className="material-symbols-outlined flex-shrink-0 !text-[18px]">delete</span>
                <span>{isLeaving ? 'Leaving...' : 'Leave Workspace'}</span>
              </button>
            </div>
          )}

        </div>

      </div>
      ) : (
        /* FULL ACTIVITY HISTORY TAB */
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>Extended Activity Logs</h3>
            <p className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>A complete audit trail of recent changes in your workspace.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {activities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1.5rem', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-surface-border)' }}>
                <span className="material-symbols-outlined flex-shrink-0 !text-[48px]" style={{ opacity: 0.2, marginBottom: '1.5rem' }}>history</span>
                <p style={{ margin: 0, fontWeight: 500, color: 'var(--color-text-secondary)', fontSize: '1rem' }}>No activity logs found for this workspace.</p>
                <p style={{ fontSize: '0.8125rem', marginTop: '0.5rem', opacity: 0.7 }}>As you add jobs, candidates, or team members, logs will appear here.</p>
              </div>
            ) : (
              activities.map((act, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  gap: '1.5rem', 
                  padding: '1.5rem 0',
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
                      <span>Action ID: {act.id.substring(0, 8)}...</span>
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
