import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { 
  ensureUserProfile, 
  getUserWorkspaces, 
  getPendingInvites, 
  createWorkspace, 
  migrateLegacyData,
  updateUserProfile,
  acceptInvite,
  declineInvite,
  subscribeToUserWorkspaces
} from '../services/workspace.service';
import { createNotification, markInviteNotificationAsRead } from '../services/notification.service';
import { logActivity } from '../services/db';
import { useToast } from './ToastContext';

const WorkspaceContext = createContext();

export function useWorkspace() {
  return useContext(WorkspaceContext);
}

export function WorkspaceProvider({ children }) {
  const { currentUser } = useAuth();
  const { workspaceId: idFromParams } = useParams();
  const location = useLocation();
  const workspaceId = idFromParams || location.pathname.split('/w/')[1]?.split('/')[0];
  const navigate = useNavigate();

  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const isCreatingRef = useRef(false);
  const hasInitialLoadRef = useRef(false);
  const prevWorkspaceIdsRef = useRef(new Set());
  const toast = useToast();

  const refreshData = useCallback(async () => {
    if (!currentUser) {
      setWorkspaces([]);
      setActiveWorkspace(null);
      setPendingInvites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // 1. Ensure profile exists
      const profile = await ensureUserProfile(currentUser);
      setUserProfile(profile);

      // 2. Fetch workspaces
      const wsList = await getUserWorkspaces(currentUser.uid);
      setWorkspaces(wsList);
      prevWorkspaceIdsRef.current = new Set(wsList.map(w => w.id));

      // 3. Handle Migration & Default Workspace for new/legacy users
      if (wsList.length === 0) {
        // Check if there are pending invites before creating a personal workspace
        const invites = await getPendingInvites(currentUser.email);
        if (invites.length > 0) {
          setPendingInvites(invites);
        } else if (!isCreatingRef.current) {
          isCreatingRef.current = true;
          // Create a default workspace for the new user
          const newWsId = await createWorkspace(currentUser.uid, currentUser.email, {
            name: 'My Workspace',
            description: 'Personal recruitment workspace',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
            language: 'en'
          });
          
          await updateUserProfile(currentUser.uid, { defaultWorkspaceId: newWsId, onboarded: true });
          
          // Re-fetch
          const updatedWsList = await getUserWorkspaces(currentUser.uid);
          setWorkspaces(updatedWsList);
          
          // If we are on dashboard and no ID in URL, redirect to this new one
          if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
            navigate(`/dashboard/w/${newWsId}`, { replace: true });
          }
        }
      } else {
        // We have workspaces. Check if we should redirect to a default one if none in URL
        if ((location.pathname === '/dashboard' || location.pathname === '/dashboard/') && !workspaceId) {
          const defaultId = profile.defaultWorkspaceId || wsList[0].id;
          navigate(`/dashboard/w/${defaultId}`, { replace: true });
        }
      }

      // 4. Set Active Workspace based on URL
      if (workspaceId) {
        const found = wsList.find(w => w.id === workspaceId);
        if (found) {
          setActiveWorkspace(found);
        } else {
          // User might be trying to access a workspace they aren't in
          console.error("Unauthorized workspace access or invalid ID");
          // Optionally redirect to a safe place
        }
      }

      // 5. Fetch invites anyway for the switcher
      const currentInvites = await getPendingInvites(currentUser.email);
      setPendingInvites(currentInvites);

    } catch (error) {
      console.error("Error in WorkspaceProvider:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, workspaceId, navigate, location.pathname]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Handle Real-time Workspace Subscription
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToUserWorkspaces(currentUser.uid, (wsList) => {
      const newIds = new Set(wsList.map(w => w.id));
      
      // Detection: If we are currently in a workspace that was just removed from our list
      if (workspaceId && hasInitialLoadRef.current) {
        const hadAccess = prevWorkspaceIdsRef.current.has(workspaceId);
        const hasAccessNow = newIds.has(workspaceId);
        
        if (hadAccess && !hasAccessNow) {
          console.log("Access revoked for current workspace:", workspaceId);
          toast({ 
            type: 'warning', 
            message: 'Your access to this workspace has been revoked.' 
          });
          navigate('/dashboard', { replace: true });
        }
      }

      setWorkspaces(wsList);
      prevWorkspaceIdsRef.current = newIds;

      // Update active workspace metadata if it still exists
      if (workspaceId) {
        const found = wsList.find(w => w.id === workspaceId);
        if (found) {
          setActiveWorkspace(found);
        } else if (hasInitialLoadRef.current) {
          // If we lost access, clear active workspace to prevent stale data briefly
          setActiveWorkspace(null);
        }
      }

      hasInitialLoadRef.current = true;
    });

    return () => unsubscribe();
  }, [currentUser, workspaceId, navigate, toast]);

  const switchWorkspace = (id) => {
    navigate(`/dashboard/w/${id}`);
  };

  const handleCreateWorkspace = async (workspaceData) => {
    const newId = await createWorkspace(currentUser.uid, currentUser.email, workspaceData);
    await refreshData();
    navigate(`/dashboard/w/${newId}`);
    return newId;
  };

  const handleAcceptInvite = async (invite) => {
    await acceptInvite(invite, currentUser.uid);
    try {
      const actor = userProfile || { 
        uid: currentUser.uid, 
        email: currentUser.email, 
        displayName: currentUser.displayName, 
        photoURL: currentUser.photoURL 
      };
      await logActivity(invite.workspaceId, actor, 'INVITATION_ACCEPTED', { name: currentUser.email }, { role: invite.role });
    } catch (e) {
      console.warn("Could not log accept activity", e);
    }
    await refreshData();
    
    // Auto-mark the "New Invite" notification as read
    await markInviteNotificationAsRead(currentUser.uid, invite.workspaceId);

    // Create history notification for the current user (invitee)
    await createNotification(currentUser.uid, {
      title: 'Invitation Accepted',
      message: `You have joined "${invite.workspaceName || 'a new workspace'}".`,
      type: 'success',
      workspaceId: invite.workspaceId,
      workspaceName: invite.workspaceName,
      metadata: { action: 'INVITE_ACCEPTED' }
    });

    // Notify the Inviter
    if (invite.invitedBy) {
      await createNotification(invite.invitedBy, {
        title: 'Invitation Accepted',
        message: `${currentUser.email} has accepted your invitation to join "${invite.workspaceName}".`,
        type: 'success',
        workspaceId: invite.workspaceId,
        workspaceName: invite.workspaceName,
        metadata: { action: 'INVITE_ACCEPTED_BY_USER', userEmail: currentUser.email }
      });
    }

    navigate(`/dashboard/w/${invite.workspaceId}`);
  };

  const handleDeclineInvite = async (invite) => {
    await declineInvite(invite.id);
    try {
      const actor = userProfile || { 
        uid: currentUser.uid, 
        email: currentUser.email, 
        displayName: currentUser.displayName, 
        photoURL: currentUser.photoURL 
      };
      await logActivity(invite.workspaceId, actor, 'INVITATION_DECLINED', { name: currentUser.email }, { role: invite.role });
    } catch (e) {
      console.warn("Could not log decline activity", e);
    }
    await refreshData();

    // Auto-mark the "New Invite" notification as read
    await markInviteNotificationAsRead(currentUser.uid, invite.workspaceId);

    // Create history notification for current user
    await createNotification(currentUser.uid, {
      title: 'Invitation Declined',
      message: `You declined the invitation to join "${invite.workspaceName || 'the workspace'}".`,
      type: 'info',
      workspaceId: invite.workspaceId,
      workspaceName: invite.workspaceName,
      metadata: { action: 'INVITE_DECLINED' }
    });

    // Notify the Inviter
    if (invite.invitedBy) {
      await createNotification(invite.invitedBy, {
        title: 'Invitation Declined',
        message: `${currentUser.email} has declined your invitation to join "${invite.workspaceName}".`,
        type: 'warning',
        workspaceId: invite.workspaceId,
        workspaceName: invite.workspaceName,
        metadata: { action: 'INVITE_DECLINED_BY_USER', userEmail: currentUser.email }
      });
    }
  };

  const value = {
    workspaces,
    activeWorkspace,
    pendingInvites,
    loading,
    userProfile,
    switchWorkspace,
    createWorkspace: handleCreateWorkspace,
    acceptInvite: handleAcceptInvite,
    declineInvite: handleDeclineInvite,
    refreshWorkspaces: refreshData
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}
