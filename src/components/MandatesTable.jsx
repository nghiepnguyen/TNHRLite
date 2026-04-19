import React from 'react';

import { useToast } from '../contexts/ToastContext';
import Skeleton from './Skeleton';

/**
 * MandatesTable Component - Phase 2 & 4 Improvement
 */
const MandatesTable = ({ mandates, onRowClick, onAction, loading }) => {
  const toast = useToast();
  
  const handleActionClick = (e, type, mandate) => {
    e.stopPropagation();
    
    // Provide immediate feedback via Toast
    if (type === 'duplicate') {
      toast({ type: 'success', message: `Duplicate created for "${mandate.title}"` });
    }
    if (type === 'extend') {
      toast({ type: 'info', message: `Extension requested for ${mandate.title}` });
    }
    if (type === 'close') {
      toast({ type: 'warning', message: `Closing mandate "${mandate.title}"...` });
    }
    
    onAction?.(type, mandate);
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return 'badge-neutral';
    const s = status.toLowerCase().replace(/[_\s]/g, '-');
    switch (s) {
      case 'active': return 'badge-active';
      case 'on-hold': return 'badge-on-hold';
      case 'closed': return 'badge-closed';
      case 'expired': return 'badge-expired';
      default: return 'badge-neutral';
    }
  };


  const getDeadlineInfo = (deadline) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      formatted: date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      isExpiringSoon: diffDays > 0 && diffDays < 14,
      isExpired: diffDays <= 0
    };
  };

  if (loading) {
    return (
      <div className="mandates-display-wrapper">
        <div className="table-responsive desktop-only">
          <table className="mandates-table-advanced">
            <thead>
              <tr>
                <th>Mandate & Client</th>
                <th>Status</th>
                <th>Open Roles</th>
                <th>Deadline</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map(i => (
                <tr key={i}>
                  <td>
                    <Skeleton variant="text" width="180px" />
                    <Skeleton variant="text" width="120px" style={{ marginTop: '0.375rem' }} />
                  </td>
                  <td><Skeleton variant="text" width="80px" height="24px" style={{ borderRadius: '99px' }} /></td>
                  <td>
                    <Skeleton variant="text" width="40px" />
                    <Skeleton variant="rect" width="100px" height="6px" style={{ marginTop: '0.375rem', borderRadius: '10px' }} />
                  </td>
                  <td><Skeleton variant="text" width="100px" /></td>
                  <td className="text-right"><Skeleton variant="rect" width="120px" height="34px" style={{ marginLeft: 'auto', borderRadius: '8px' }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mobile-only mobile-cards-list">
          {[1, 2, 3].map(i => (
            <div key={i} className="mandate-mobile-card">
              <div className="card-mobile-header">
                <Skeleton variant="text" width="60px" height="20px" style={{ borderRadius: '99px' }} />
                <Skeleton variant="text" width="80px" />
              </div>
              <Skeleton variant="title" width="70%" />
              <Skeleton variant="text" width="40%" style={{ marginBottom: '1.25rem' }} />
              <Skeleton variant="rect" height="6px" style={{ marginBottom: '1.5rem', borderRadius: '10px' }} />
              <div className="m-action-group">
                <Skeleton variant="rect" height="40px" style={{ borderRadius: '10px' }} />
                <Skeleton variant="rect" height="40px" style={{ borderRadius: '10px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mandates-display-wrapper">
      {/* Desktop Table View */}
      <div className="table-responsive desktop-only">
        <table className="mandates-table-advanced">
          <thead>
            <tr>
              <th>Mandate & Client</th>
              <th>Status</th>
              <th>Open Roles</th>
              <th>Deadline</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mandates.map((mandate) => {
              const deadlineInfo = getDeadlineInfo(mandate.deadline);
              return (
                <tr key={mandate.id} className="interactive-row" onClick={() => onRowClick?.(mandate)}>
                  <td>
                    <div className="mandate-info">
                      <span className="mandate-name">{mandate.title}</span>
                      <span className="mandate-meta">
                        <span className="material-symbols-outlined flex-shrink-0 !text-[12px]">business</span> {mandate.clientName || 'Internal'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(mandate.status)}`}>
                      {mandate.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="roles-progress-container">
                      <div className="roles-labels">
                        <span className="roles-current">{mandate.openRoles}</span>
                        <span className="roles-divider">/</span>
                        <span className="roles-total">{mandate.totalRoles}</span>
                      </div>
                      <div className="progress-track">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${(mandate.openRoles / mandate.totalRoles) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={`deadline-display ${deadlineInfo.isExpiringSoon ? 'expiring-soon' : ''} ${deadlineInfo.isExpired ? 'expired' : ''}`}>
                      {deadlineInfo.formatted}
                      {deadlineInfo.isExpiringSoon && <span className="urgent-dot"></span>}
                    </div>
                  </td>
                  <td className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="action-button-group">
                      <button className="action-btn" onClick={(e) => handleActionClick(e, 'edit', mandate)} data-tooltip="Chỉnh sửa mandate"><span className="material-symbols-outlined flex-shrink-0 !text-[18px]">edit</span></button>
                      <button className="action-btn" onClick={(e) => handleActionClick(e, 'extend', mandate)} data-tooltip="Gia hạn deadline"><span className="material-symbols-outlined flex-shrink-0 !text-[18px]">history</span></button>
                      <button className="action-btn" onClick={(e) => handleActionClick(e, 'duplicate', mandate)} data-tooltip="Nhân bản"><span className="material-symbols-outlined flex-shrink-0 !text-[18px]">content_copy</span></button>
                      <button className="action-btn btn-danger" onClick={(e) => handleActionClick(e, 'close', mandate)} data-tooltip="Đóng mandate"><span className="material-symbols-outlined flex-shrink-0 !text-[18px]">cancel</span></button>
                      <button className="action-btn btn-delete text-danger" onClick={(e) => handleActionClick(e, 'delete', mandate)} data-tooltip="Xóa vĩnh viễn"><span className="material-symbols-outlined flex-shrink-0 !text-[18px]">delete</span></button>
                      <button className="action-btn btn-info" onClick={(e) => handleActionClick(e, 'report', mandate)} data-tooltip="Xem chi tiết"><span className="material-symbols-outlined flex-shrink-0 !text-[18px]">visibility</span></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="mobile-only mobile-cards-list">
        {mandates.map((mandate) => {
          const deadlineInfo = getDeadlineInfo(mandate.deadline);
          return (
            <div key={mandate.id} className="mandate-mobile-card" onClick={() => onRowClick?.(mandate)}>
              <div className="card-mobile-header">
                <span className={`status-badge ${getStatusBadgeClass(mandate.status)}`}>
                  {mandate.status}
                </span>
                <span className={`mobile-deadline ${deadlineInfo.isExpiringSoon ? 'text-warning' : ''}`}>
                   {deadlineInfo.formatted}
                </span>
              </div>
              
              <div className="card-mobile-body">
                <h4 className="mobile-title">{mandate.title}</h4>
                <div className="mobile-client">
                  <span className="material-symbols-outlined flex-shrink-0 !text-[14px]">business</span> {mandate.clientName}
                </div>
                
                <div className="mobile-progress-section">
                  <div className="mobile-roles-info">
                    <span>Roles: <strong>{mandate.openRoles}/{mandate.totalRoles}</strong></span>
                  </div>
                  <div className="progress-track">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${(mandate.openRoles / mandate.totalRoles) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="m-card-footer" onClick={e => e.stopPropagation()}>
                <div className="m-action-group">
                  <button className="m-action-btn" onClick={(e) => handleActionClick(e, 'edit', mandate)}><span className="material-symbols-outlined flex-shrink-0 !text-[16px]">edit</span> Edit</button>
                  <button className="m-action-btn" onClick={(e) => handleActionClick(e, 'clone', mandate)}><span className="material-symbols-outlined flex-shrink-0 !text-[16px]">content_copy</span> Clone</button>
                  <button className="m-action-btn btn-danger" onClick={(e) => handleActionClick(e, 'close', mandate)}><span className="material-symbols-outlined flex-shrink-0 !text-[16px]">cancel</span> Close</button>
                  <button className="m-action-btn text-danger" onClick={(e) => handleActionClick(e, 'delete', mandate)}><span className="material-symbols-outlined flex-shrink-0 !text-[16px]">delete</span> Delete</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {mandates.length === 0 && (
        <div className="empty-table-state">
           <span className="material-symbols-outlined flex-shrink-0 !text-[32px]" opacity={0.5}>info</span>
           <p>Không tìm thấy mandate nào</p>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .mandates-display-wrapper { width: 100%; }

        .desktop-only { display: block !important; }
        .mobile-only { display: none !important; }

        .mandates-table-advanced {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }

        .mandates-table-advanced th {
          background: var(--color-surface-hover);
          padding: 1rem 1.5rem;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-secondary);
          border-bottom: 2px solid var(--color-surface-border);
        }

        .interactive-row {
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .interactive-row:hover {
          background-color: var(--color-surface-hover);
        }

        .interactive-row td {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--color-surface-border);
          vertical-align: middle;
        }

        /* Status Badges */
        .status-badge {
          display: inline-flex;
          padding: 0.25rem 0.75rem;
          border-radius: 99px;
          font-size: 0.6875rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .badge-active { background: var(--color-success-bg); color: var(--color-success); }
        .badge-on-hold { background: var(--color-warning-bg); color: var(--color-warning); }
        .badge-closed { background: var(--color-surface-hover); color: var(--color-text-secondary); }
        .badge-expired { background: var(--color-danger-bg); color: var(--color-danger); }

        /* Progress Components */
        .progress-track {
          height: 6px;
          background: var(--color-surface-hover);
          border-radius: 10px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--color-brand-primary-container);
          border-radius: 10px;
          transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Mobile Card Styling */
        .mobile-cards-list {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .mandate-mobile-card {
          background: white;
          border: 1px solid var(--color-surface-border);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          box-shadow: var(--shadow-sm);
          transition: var(--transition-smooth);
        }

        .mandate-mobile-card:active { transform: scale(0.98); }

        .card-mobile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .mobile-deadline {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--color-text-muted);
        }

        .mobile-title {
          font-size: 1.125rem;
          font-weight: 800;
          color: var(--color-text-primary);
          margin-bottom: 0.25rem;
          letter-spacing: -0.01em;
        }

        .mobile-client {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: var(--color-primary);
          font-weight: 600;
          margin-bottom: 1.25rem;
        }

        .mobile-progress-section {
          margin-bottom: 1.5rem;
        }

        .mobile-roles-info {
          font-size: 0.75rem;
          margin-bottom: 0.5rem;
          color: var(--color-text-secondary);
          font-weight: 600;
        }

        .m-action-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }

        .m-action-btn {
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: var(--color-surface-hover);
          color: var(--color-text-secondary);
          gap: 0.5rem;
          font-size: 0.8125rem;
          font-weight: 700;
          transition: var(--transition-smooth);
        }
        .m-action-btn:hover { background: var(--color-surface-border); color: var(--color-text-primary); }
        .m-action-btn.btn-danger { color: var(--color-danger); }

        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: flex !important; }
        }

        .mandate-info { display: flex; flex-direction: column; gap: 0.25rem; }
        .mandate-name { font-weight: 800; color: var(--color-text-primary); font-size: 1rem; letter-spacing: -0.01em; transition: color 0.2s; }
        .interactive-row:hover .mandate-name { color: var(--color-primary); }
        .mandate-meta { display: flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; color: var(--color-text-secondary); font-weight: 500; }
        .roles-progress-container { width: 140px; }
        .roles-labels { display: flex; align-items: baseline; gap: 2px; font-size: 1rem; font-weight: 900; margin-bottom: 0.375rem; color: var(--color-text-primary); }
        .roles-divider { color: var(--color-text-muted); font-weight: 400; }
        .roles-total { color: var(--color-text-secondary); font-weight: 600; }
        .deadline-display { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; font-weight: 600; color: var(--color-text-secondary); }
        .expiring-soon { color: var(--color-warning); font-weight: 700; }
        .expired { color: var(--color-danger); font-weight: 700; }
        .urgent-dot { width: 8px; height: 8px; background: var(--color-danger); border-radius: 50%; box-shadow: 0 0 0 2px var(--color-danger-bg); animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.4); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
        .action-button-group { display: flex; gap: 0.375rem; justify-content: flex-end; opacity: 0.4; transition: var(--transition-smooth); }
        .interactive-row:hover .action-button-group { opacity: 1; transform: translateX(-4px); }
        .action-btn { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; border-radius: 8px; color: var(--color-text-secondary); background: var(--color-surface-hover); transition: var(--transition-bounce); position: relative; border: 1px solid transparent; }
        .action-btn:hover { background: white; color: var(--color-primary) !important; border-color: var(--color-surface-border); box-shadow: var(--shadow-sm); z-index: 10; }
        .action-btn.btn-danger:hover { color: var(--color-danger) !important; }
        .action-btn.btn-info:hover { color: var(--color-brand-primary) !important; }
        
        [data-tooltip]::before { content: attr(data-tooltip); position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%) translateY(-8px); padding: 0.5rem 0.75rem; background: var(--color-brand-on-surface); color: white; font-size: 0.6875rem; font-weight: 700; border-radius: 6px; white-space: nowrap; pointer-events: none; opacity: 0; transition: var(--transition-smooth); z-index: 100; box-shadow: var(--shadow-md); }
        [data-tooltip]:hover::before { opacity: 1; transform: translateX(-50%) translateY(-12px); }
        .text-right { text-align: right; }
        .empty-table-state { 
          padding: 6rem 2rem; 
          text-align: center; 
          color: var(--color-text-muted); 
          font-weight: 600; 
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          background: var(--color-surface-hover);
          margin: 0.5rem;
          border-radius: var(--radius-md);
          border: 2px dashed var(--color-surface-border);
        }
      `}} />
    </div>
  );
};


export default MandatesTable;
