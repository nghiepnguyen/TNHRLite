import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

import { useWorkspace } from '../../contexts/WorkspaceContext';
import { 
  getWorkspaceMembers, 
  getWorkspaceInvites, 
  inviteMember, 
  updateInviteStatus, 
  removeWorkspaceMember 
} from '../../services/workspace.service';
import { useToast } from '../../contexts/ToastContext';
import { logActivity } from '../../services/db';

export default function Members() {
  const { workspaceId } = useParams();
  const { activeWorkspace, userProfile } = useWorkspace();
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
      toast({ type: 'error', message: 'Failed to load team data.' });
    } finally {
      setLoading(false);
    }
  }

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    setIsSubmitting(true);
    try {
      await inviteMember(
        workspaceId, 
        activeWorkspace?.name || 'Workspace', 
        inviteEmail, 
        inviteRole, 
        userProfile?.id
      );
      toast({ type: 'success', message: `Invitation sent to ${inviteEmail}` });
      setInviteEmail('');
      setShowInviteModal(false);
      loadData();
    } catch (err) {
      console.error("Error inviting member:", err);
      toast({ type: 'error', message: 'Failed to send invitation.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (inviteId) => {
    if (!window.confirm('Are you sure you want to revoke this invitation?')) return;
    try {
      await updateInviteStatus(inviteId, 'revoked');
      toast({ type: 'success', message: 'Invitation revoked.' });
      loadData();
    } catch (err) {
      toast({ type: 'error', message: 'Failed to revoke invitation.' });
    }
  };

  const handleRemoveMember = async (member) => {
    if (!member || !member.userId) {
      console.error("Invalid member object provided for removal", member);
      return;
    }
    
    if (member.role === 'owner') {
      toast({ type: 'error', message: 'The workspace owner cannot be removed.' });
      return;
    }

    const confirmMessage = `Are you sure you want to remove ${member.email || 'this user'} from the workspace? This will immediately revoke their access.`;
    
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

      toast({ type: 'success', message: 'Member removed successfully.' });
      await loadData();
    } catch (err) {
      console.error("Critical error removing member:", err);
      toast({ type: 'error', message: `Failed to remove member: ${err.message}` });
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'owner': return <span className="badge badge-warning" style={{ gap: '4px' }}><span className="material-symbols-outlined flex-shrink-0 !text-[12px]">stars</span> Owner</span>;
      case 'admin': return <span className="badge badge-primary" style={{ gap: '4px' }}><span className="material-symbols-outlined flex-shrink-0 !text-[12px]">local_police</span> Admin</span>;
      case 'editor': return <span className="badge badge-success" style={{ gap: '4px' }}><span className="material-symbols-outlined flex-shrink-0 !text-[12px]">how_to_reg</span> Editor</span>;
      case 'viewer': return <span className="badge badge-neutral" style={{ gap: '4px' }}><span className="material-symbols-outlined flex-shrink-0 !text-[12px]">visibility</span> Viewer</span>;
      default: return <span className="badge badge-neutral">{role}</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="badge badge-warning" style={{ gap: '4px' }}><span className="material-symbols-outlined flex-shrink-0 !text-[12px]">schedule</span> Pending</span>;
      case 'accepted': return <span className="badge badge-success" style={{ gap: '4px' }}><span className="material-symbols-outlined flex-shrink-0 !text-[12px]">check_circle</span> Accepted</span>;
      case 'revoked': return <span className="badge badge-neutral" style={{ gap: '4px' }}><span className="material-symbols-outlined flex-shrink-0 !text-[12px]">cancel</span> Revoked</span>;
      case 'expired': return <span className="badge badge-danger" style={{ gap: '4px' }}><span className="material-symbols-outlined flex-shrink-0 !text-[12px]">error</span> Expired</span>;
      default: return <span className="badge badge-neutral">{status}</span>;
    }
  };

  const canManage = activeWorkspace?.myRole === 'owner' || activeWorkspace?.myRole === 'admin';

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }} className="text-secondary">Loading team data...</div>;

  return (
    <div className="members-page-container">
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.025em' }}>Team Members</h1>
          <p className="text-secondary" style={{ marginTop: '0.25rem' }}>Manage who has access to this workspace and their permissions.</p>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={() => setShowInviteModal(true)}>
            <span className="material-symbols-outlined flex-shrink-0 !text-[18px]">person_add</span>
            <span>Invite Member</span>
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* Active Members Section */}
        <section>
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-surface-border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="material-symbols-outlined flex-shrink-0 !text-[20px] text-primary">group</span>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Workspace Members</h3>
              <span className="badge badge-neutral" style={{ marginLeft: 'auto' }}>{members.length} Total</span>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Role</th>
                    <th>Joined At</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
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
                            {member.userId === userProfile?.id && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>It's you</div>}
                          </div>
                        </div>
                      </td>
                      <td>{getRoleBadge(member.role)}</td>
                      <td className="text-secondary" style={{ fontSize: '0.875rem' }}>
                        {member.joinedAt?.toDate ? member.joinedAt.toDate().toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {canManage && member.role !== 'owner' && member.userId !== userProfile?.id && (
                          <button 
                            className="btn-icon text-danger" 
                            title="Remove Member"
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
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Sent Invitations</h3>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Sent At</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invites.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                        No pending invitations.
                      </td>
                    </tr>
                  ) : (
                    invites.map((invite) => (
                      <tr key={invite.id}>
                        <td style={{ fontWeight: 500 }}>{invite.email}</td>
                        <td>{getRoleBadge(invite.role)}</td>
                        <td>{getStatusBadge(invite.status)}</td>
                        <td className="text-secondary" style={{ fontSize: '0.875rem' }}>
                          {invite.createdAt?.toDate ? invite.createdAt.toDate().toLocaleDateString() : 'N/A'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {canManage && invite.status === 'pending' && (
                            <button 
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                              onClick={() => handleRevoke(invite.id)}
                            >
                              Revoke
                            </button>
                          )}
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
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Invite Team Member</h3>
              <p className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Invited users will see the invitation when they login.
              </p>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleInvite}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
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
                  <label className="form-label">Role</label>
                  <select 
                    className="form-control"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                  >
                    <option value="admin">Admin (Manage members & data)</option>
                    <option value="editor">Editor (Create & Edit data)</option>
                    <option value="viewer">Viewer (Read only)</option>
                  </select>
                  <ul style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.75rem', paddingLeft: '1.25rem' }}>
                    <li>Admins can invite and remove other members.</li>
                    <li>Editors can manage jobs and candidates.</li>
                    <li>Viewers can only see dashboard and reports.</li>
                  </ul>
                </div>

                <div className="modal-actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowInviteModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Send Invitation'}
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
