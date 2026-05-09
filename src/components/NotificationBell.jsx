import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { 
  subscribeToNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification,
  createNotification 
} from '../services/notification.service';
import './NotificationBell.css';

export default function NotificationBell() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { pendingInvites, acceptInvite, declineInvite } = useWorkspace() || { pendingInvites: [] };
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeInvite, setActiveInvite] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;
    
    const unsubscribe = subscribeToNotifications(currentUser.uid, (notifs) => {
      // Sort client-side since we removed server-side orderBy
      const sorted = [...notifs].sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      
      setNotifications(sorted);
    });
    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadNotifs = notifications.filter(n => n.status === 'unread');
  const unreadCount = unreadNotifs.length + pendingInvites.length;

  const handleToggle = () => setIsOpen(!isOpen);

  const handleMarkAsRead = async (e, notif) => {
    e.stopPropagation();
    await markAsRead(notif.id);
  };

  const handleDelete = async (e, notifId) => {
    e.stopPropagation();
    await deleteNotification(notifId);
  };

  const handleNotificationClick = async (notif) => {
    if (notif.itemType === 'invite') {
      setActiveInvite(notif.originalInvite);
      setShowReviewModal(true);
      setIsOpen(false);
      return; 
    }
    
    if (notif.status === 'unread') {
      await markAsRead(notif.id);
    }
    setIsOpen(false);
  };

  const handleAcceptInvite = async (invite) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await acceptInvite(invite);
      setShowReviewModal(false);
      setActiveInvite(null);
    } catch (err) {
      alert("Failed to accept invite: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclineInvite = async (invite) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await declineInvite(invite);
      setShowReviewModal(false);
      setActiveInvite(null);
    } catch (err) {
      alert("Failed to decline invite: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };


  const combinedItems = [
    ...notifications.map(n => ({ ...n, itemType: 'notification' })),
    ...pendingInvites.map(i => ({
      id: i.id,
      title: t('notifications.invitation.title'),
      message: t('notifications.invitation.message', { workspaceName: i.workspaceName, role: i.role }),
      type: 'success',
      status: 'unread',
      createdAt: i.createdAt,
      itemType: 'invite',
      originalInvite: i
    }))
  ].sort((a, b) => {
    const timeA = a.createdAt?.seconds || 0;
    const timeB = b.createdAt?.seconds || 0;
    return timeB - timeA;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'warning': return 'warning';
      case 'danger': return 'error';
      case 'success': return 'check_circle';
      default: return 'notifications';
    }
  };

  return (
    <div className="notif-bell-container" ref={dropdownRef}>
      <button className={`notif-bell-btn ${isOpen ? 'active' : ''}`} onClick={handleToggle}>
        <span className="material-symbols-outlined !text-[24px]">notifications</span>
        {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notif-dropdown" style={{ display: 'block', visibility: 'visible', opacity: 1 }}>
          <div className="notif-header">
            <h3>{t('notifications.title')} ({combinedItems.length})</h3>
            {unreadNotifs.length > 0 && (
              <button className="text-btn" onClick={() => markAllAsRead(currentUser.uid)}>
                {t('notifications.markAllRead')}
              </button>
            )}
          </div>

          <div className="notif-list custom-scrollbar">
            {combinedItems.length === 0 ? (
              <div className="notif-empty">
                <span className="material-symbols-outlined !text-[48px] text-muted">notifications_off</span>
                <p>{t('notifications.noNotifications')}</p>
              </div>
            ) : (
              combinedItems.map((item) => (
                <div 
                  key={item.id} 
                  className={`notif-item ${item.status === 'unread' ? 'unread' : ''} ${item.itemType}`}
                  onClick={() => handleNotificationClick(item)}
                >
                  <div className={`notif-icon-circle ${item.type || 'info'}`}>
                    <span className="material-symbols-outlined !text-[18px]">{item.itemType === 'invite' ? 'mail' : getIcon(item.type)}</span>
                  </div>
                  <div className="notif-content">
                    <div className="notif-title-row">
                      <span className="notif-title">{item.title}</span>
                      <span className="notif-time">
                        {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Just now'}
                      </span>
                    </div>
                    <p className="notif-message">{item.message}</p>
                    
                    {item.itemType === 'invite' ? (
                      <div className="invite-hint">
                        <span>{t('notifications.invitation.clickToReview')}</span>
                        <span className="material-symbols-outlined !text-[14px]">arrow_forward</span>
                      </div>
                    ) : (
                      <div className="notif-actions">
                         {item.status === 'unread' && (
                           <button className="action-btn" title={t('notifications.tooltips.markRead')} onClick={(e) => handleMarkAsRead(e, item)}>
                             <span className="material-symbols-outlined !text-[14px]">done</span>
                           </button>
                         )}
                         <button className="action-btn text-danger" title={t('notifications.tooltips.delete')} onClick={(e) => handleDelete(e, item.id)}>
                           <span className="material-symbols-outlined !text-[14px]">delete</span>
                         </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Invite Review Modal */}
      {showReviewModal && activeInvite && (
        <div className="invite-modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="invite-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="invite-modal-header">
              <div className="invite-icon-large">
                <span className="material-symbols-outlined !text-[48px] text-primary">mail</span>
              </div>
              <h2>{t('notifications.invitation.title')}</h2>
              <p className="text-secondary">{t('notifications.invitation.reviewSubtitle')}</p>
            </div>
            
            <div className="invite-details-box">
              <div className="invite-detail-row">
                <span className="label">{t('notifications.invitation.invitedBy')}</span>
                <span className="value">{activeInvite.invitedByEmail}</span>
              </div>
              <div className="invite-detail-row">
                <span className="label">{t('notifications.invitation.workspace')}</span>
                <span className="value highlighted">{activeInvite.workspaceName}</span>
              </div>
              <div className="invite-detail-row">
                <span className="label">{t('notifications.invitation.requestedRole')}</span>
                <span className="value capitalize">{activeInvite.role}</span>
              </div>
            </div>

            <p className="invite-description">
              {t('notifications.invitation.terms')}
            </p>

            <div className="invite-modal-actions">
              <button 
                className="btn-decline" 
                onClick={() => handleDeclineInvite(activeInvite)}
                disabled={isProcessing}
              >
                {isProcessing ? t('notifications.invitation.processing') : t('notifications.invitation.decline')}
              </button>
              <button 
                className="btn-accept" 
                onClick={() => handleAcceptInvite(activeInvite)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  t('notifications.invitation.accepting')
                ) : (
                  <>
                    <span className="material-symbols-outlined !text-[18px]">check</span>
                    {t('notifications.invitation.accept')}
                  </>
                )}
              </button>
            </div>

            
            <button className="modal-close-btn" onClick={() => setShowReviewModal(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
