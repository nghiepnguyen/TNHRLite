import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';

import { useWorkspace } from '../../contexts/WorkspaceContext';
import { 
  getWorkspaceMembers, 
  getWorkspaceInvites, 
  inviteMember, 
  updateInviteStatus, 
  deleteInvite,
  removeWorkspaceMember 
} from '../../services/workspace.service';
import { useToast } from '../../contexts/ToastContext';
import { logActivity } from '../../services/db';
import { formatDate } from '../../utils/dateUtils';

export default function Members() {
  const { workspaceId } = useParams();
  const { activeWorkspace, userProfile } = useWorkspace();
  const { t } = useTranslation();
  const toast = useToast();
  
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // Form State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [workspaceId]);

  async function loadData() {
    if (!workspaceId) return;
    try {
      setLoading(true);
      const [membersData, invitesData] = await Promise.all([
        getWorkspaceMembers(workspaceId),
        getWorkspaceInvites(workspaceId)
      ]);
      setMembers(membersData);
      setInvites(invitesData);
    } catch (err) {
      console.error("Error loading membership data:", err);
      toast({ type: 'error', message: t('membersPage.messages.loadError') });
    } finally {
      setLoading(false);
    }
  }

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    const normalizedEmail = inviteEmail.trim().toLowerCase();
    
    // 1. Check if already a member
    const isMember = members.some(m => m.email?.toLowerCase() === normalizedEmail);
    if (isMember) {
      toast({ type: 'error', message: t('membersPage.messages.alreadyMember', { email: inviteEmail }) });
      setIsSubmitting(false);
      return;
    }

    // 2. Check if already has a pending invite
    const isAlreadyInvited = invites.some(i => i.email?.toLowerCase() === normalizedEmail && i.status === 'pending');
    if (isAlreadyInvited) {
      toast({ type: 'error', message: t('membersPage.messages.alreadyInvited', { email: inviteEmail }) });
      setIsSubmitting(false);
      return;
    }

    try {
      await inviteMember(
        workspaceId, 
        activeWorkspace?.name || 'Workspace', 
        inviteEmail, 
        inviteRole, 
        userProfile?.id,
        userProfile?.email
      );
      toast({ type: 'success', message: t('membersPage.messages.inviteSent', { email: inviteEmail }) });
      setInviteEmail('');
      setShowInviteModal(false);
      loadData();
    } catch (err) {
      console.error("Error inviting member:", err);
      toast({ type: 'error', message: t('membersPage.messages.inviteError') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (inviteId) => {
    if (!window.confirm(t('membersPage.messages.revokeConfirm'))) return;
    try {
      await updateInviteStatus(inviteId, 'revoked');
      toast({ type: 'success', message: t('membersPage.messages.revokeSuccess') });
      loadData();
    } catch (err) {
      toast({ type: 'error', message: t('membersPage.messages.revokeError') });
    }
  };

  const handleDeleteInvite = async (inviteId) => {
    if (!window.confirm(t('membersPage.messages.deleteConfirm'))) return;
    try {
      await deleteInvite(inviteId);
      toast({ type: 'success', message: t('membersPage.messages.deleteSuccess') });
      loadData();
    } catch (err) {
      toast({ type: 'error', message: t('membersPage.messages.deleteError') });
    }
  };

  const handleRemoveMember = async (member) => {
    if (!member || !member.userId) {
      console.error("Invalid member object provided for removal", member);
      return;
    }
    
    if (member.role === 'owner') {
      toast({ type: 'error', message: t('membersPage.messages.ownerCannotRemove') });
      return;
    }

    const confirmMessage = t('membersPage.messages.removeConfirm', { name: member.email || 'this user' });
    
    if (!window.confirm(confirmMessage)) return;
    
    try {
      console.log(`Starting removal for user: ${member.userId} in workspace: ${workspaceId}`);
      await removeWorkspaceMember(workspaceId, member.userId, userProfile?.id);
      
      // Log removal activity
      await logActivity(
        workspaceId, 
        userProfile, 
        'MEMBER_REMOVED', 
        { name: member.email, id: member.userId, type: 'member' },
        { email: member.email, role: member.role }
      );

      toast({ type: 'success', message: t('membersPage.messages.removeSuccess') });
      await loadData();
    } catch (err) {
      console.error("Critical error removing member:", err);
      toast({ type: 'error', message: t('membersPage.messages.removeError', { error: err.message }) });
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'owner': return <span className="badge badge-warning" style={{ gap: '4px' }}><span className="material-symbols-outlined flex-shrink-0 !text-[12px]">stars</span> {t('membersPage.roles.owner')}</span>;
      case 'admin': return <span className="badge badge-primary" style={{ gap: '4px' }}><span className="material-symbols-outlined flex-shrink-0 !text-[12px]">local_police</span> {t('membersPage.roles.admin')}</span>;
      case 'editor': return <span className="badge badge-success" style={{ gap: '4px' }}><span className="material-symbols-outlined flex-shrink-0 !text-[12px]">how_to_reg</span> {t('membersPage.roles.editor')}</span>;
      case 'viewer': return <span className="badge badge-neutral" style={{ gap: '4px' }}><span className="material-symbols-outlined flex-shrink-0 !text-[12px]">visibility</span> {t('membersPage.roles.viewer')}</span>;
      default: return <span className="badge badge-neutral">{role}</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="badge badge-warning" style={{ gap: '4px' }}><span className="material-symbols-outlined flex-shrink-0 !text-[12px]">schedule</span> {t('membersPage.statuses.pending')}</span>;
      case 'accepted': return <span className="badge badge-success" style={{ gap: '4px' }}><span className="material-symbols-outlined flex-shrink-0 !text-[12px]">check_circle</span> {t('membersPage.statuses.accepted')}</span>;
      case 'revoked': return <span className="badge badge-neutral" style={{ gap: '4px' }}><span className="material-symbols-outlined flex-shrink-0 !text-[12px]">cancel</span> {t('membersPage.statuses.revoked')}</span>;
      case 'expired': return <span className="badge badge-danger" style={{ gap: '4px' }}><span className="material-symbols-outlined flex-shrink-0 !text-[12px]">error</span> {t('membersPage.statuses.expired')}</span>;
      default: return <span className="badge badge-neutral">{status}</span>;
    }
  };

  const canManage = activeWorkspace?.myRole === 'owner' || activeWorkspace?.myRole === 'admin';

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }} className="text-secondary">{t('common.processing')}</div>;

  return (
    <div className="members-page-container">
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.025em' }}>{t('membersPage.title')}</h1>
          <p className="text-secondary" style={{ marginTop: '0.25rem' }}>{t('membersPage.subtitle')}</p>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={() => setShowInviteModal(true)}>
            <span className="material-symbols-outlined flex-shrink-0 !text-[18px]">person_add</span>
            <span>{t('membersPage.inviteBtn')}</span>
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* Active Members Section */}
        <section>
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-surface-border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="material-symbols-outlined flex-shrink-0 !text-[20px] text-primary">group</span>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{t('membersPage.activeMembers')}</h3>
              <span className="badge badge-neutral" style={{ marginLeft: 'auto' }}>{t('membersPage.totalCount', { count: members.length })}</span>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>{t('membersPage.table.member')}</th>
                    <th>{t('membersPage.table.role')}</th>
                    <th>{t('membersPage.table.joinedAt')}</th>
                    <th style={{ textAlign: 'right' }}>{t('membersPage.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.875rem' }}>
                            {member.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{member.email}</div>
                            {member.userId === userProfile?.id && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{t('membersPage.itsYou')}</div>}
                          </div>
                        </div>
                      </td>
                      <td>{getRoleBadge(member.role)}</td>
                      <td className="text-secondary" style={{ fontSize: '0.875rem' }}>
                        {member.joinedAt ? formatDate(member.joinedAt) : 'N/A'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {canManage && member.role !== 'owner' && member.userId !== userProfile?.id && (
                          <button 
                            className="btn-icon text-danger" 
                            title={t('membersPage.actions.removeMember')}
                            onClick={() => handleRemoveMember(member)}
                          >
                            <span className="material-symbols-outlined flex-shrink-0 !text-[18px]">delete</span>
                          </button>
                        )}
                        {member.role === 'owner' && <span className="material-symbols-outlined flex-shrink-0 !text-[18px] text-muted">more_horiz</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Sent Invitations Section */}
        <section>
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-surface-border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="material-symbols-outlined flex-shrink-0 !text-[20px] text-primary">mail</span>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{t('membersPage.sentInvites')}</h3>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>{t('membersPage.modal.email')}</th>
                    <th>{t('membersPage.table.role')}</th>
                    <th>{t('membersPage.table.status')}</th>
                    <th>{t('membersPage.table.sentAt')}</th>
                    <th style={{ textAlign: 'right' }}>{t('membersPage.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {invites.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                        {t('membersPage.noInvites')}
                      </td>
                    </tr>
                  ) : (
                    invites.map((invite) => (
                      <tr key={invite.id}>
                        <td style={{ fontWeight: 500 }}>{invite.email}</td>
                        <td>{getRoleBadge(invite.role)}</td>
                        <td>{getStatusBadge(invite.status)}</td>
                        <td className="text-secondary" style={{ fontSize: '0.875rem' }}>
                          {invite.createdAt ? formatDate(invite.createdAt) : 'N/A'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            {canManage && invite.status === 'pending' && (
                              <button 
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                                onClick={() => handleRevoke(invite.id)}
                              >
                                {t('membersPage.actions.revoke')}
                              </button>
                            )}
                            {canManage && (
                              <button 
                                className="btn-icon text-danger" 
                                title={t('membersPage.actions.deleteLog')}
                                onClick={() => handleDeleteInvite(invite.id)}
                              >
                                <span className="material-symbols-outlined flex-shrink-0 !text-[18px]">delete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: '450px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{t('membersPage.modal.title')}</h3>
              <p className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {t('membersPage.modal.desc')}
              </p>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleInvite}>
                <div className="form-group">
                  <label className="form-label">{t('membersPage.modal.email')}</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    autoFocus
                    required
                    placeholder="name@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('membersPage.modal.role')}</label>
                  <select 
                    className="form-control"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                  >
                    <option value="admin">{t('membersPage.modal.roleNotes.admin')}</option>
                    <option value="editor">{t('membersPage.modal.roleNotes.editor')}</option>
                    <option value="viewer">{t('membersPage.modal.roleNotes.viewer')}</option>
                  </select>
                  <ul style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.75rem', paddingLeft: '1.25rem' }}>
                    <li>{t('membersPage.modal.roleNotes.adminNote')}</li>
                    <li>{t('membersPage.modal.roleNotes.editorNote')}</li>
                    <li>{t('membersPage.modal.roleNotes.viewerNote')}</li>
                  </ul>
                </div>

                <div className="modal-actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowInviteModal(false)}>{t('membersPage.actions.cancel')}</button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? t('membersPage.actions.sending') : t('membersPage.actions.send')}
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
