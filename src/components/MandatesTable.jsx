import React from 'react';
import { 
  Pencil, CalendarClock, Copy, XCircle, Eye, 
  Building2, ChevronRight, Info, Trash2
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

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
      <div className="table-loader">
        <div className="spinner"></div>
        <p>Loading mandates...</p>
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
                        <Building2 size={12} /> {mandate.clientName || 'Internal'}
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
                      <button className="action-btn" onClick={(e) => handleActionClick(e, 'edit', mandate)} data-tooltip="Chỉnh sửa mandate"><Pencil size={18} /></button>
                      <button className="action-btn" onClick={(e) => handleActionClick(e, 'extend', mandate)} data-tooltip="Gia hạn deadline"><CalendarClock size={18} /></button>
                      <button className="action-btn" onClick={(e) => handleActionClick(e, 'duplicate', mandate)} data-tooltip="Nhân bản"><Copy size={18} /></button>
                      <button className="action-btn btn-danger" onClick={(e) => handleActionClick(e, 'close', mandate)} data-tooltip="Đóng mandate"><XCircle size={18} /></button>
                      <button className="action-btn btn-delete text-danger" onClick={(e) => handleActionClick(e, 'delete', mandate)} data-tooltip="Xóa vĩnh viễn"><Trash2 size={18} /></button>
                      <button className="action-btn btn-info" onClick={(e) => handleActionClick(e, 'report', mandate)} data-tooltip="Xem chi tiết"><Eye size={18} /></button>
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
                  <Building2 size={14} /> {mandate.clientName}
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
                  <button className="m-action-btn" onClick={(e) => handleActionClick(e, 'edit', mandate)}><Pencil size={16} /> Edit</button>
                  <button className="m-action-btn" onClick={(e) => handleActionClick(e, 'clone', mandate)}><Copy size={16} /> Clone</button>
                  <button className="m-action-btn btn-danger" onClick={(e) => handleActionClick(e, 'close', mandate)}><XCircle size={16} /> Close</button>
                  <button className="m-action-btn text-danger" onClick={(e) => handleActionClick(e, 'delete', mandate)}><Trash2 size={16} /> Delete</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {mandates.length === 0 && (
        <div className="empty-table-state">
           <Info size={32} opacity={0.5} />
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
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-secondary);
          border-bottom: 2px solid var(--color-surface-border);
        }

        .interactive-row {
          cursor: pointer;
          transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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
          padding: 0.25rem 0.625rem;
          border-radius: 99px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .badge-active { background: #dcfce7; color: #15803d; }
        .badge-on-hold { background: #fef9c3; color: #a16207; }
        .badge-closed { background: #f1f5f9; color: #475569; }
        .badge-expired { background: #fee2e2; color: #b91c1c; }

        /* Progress Components */
        .progress-track {
          height: 6px;
          background: #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--color-primary), #60a5fa);
          border-radius: 10px;
          transition: width 0.6s ease;
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
        }

        .card-mobile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .mobile-deadline {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-text-muted);
        }

        .mobile-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: 0.25rem;
        }

        .mobile-client {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: var(--color-text-secondary);
          margin-bottom: 1.25rem;
        }

        .mobile-progress-section {
          margin-bottom: 1.5rem;
        }

        .mobile-roles-info {
          font-size: 0.75rem;
          margin-bottom: 0.5rem;
          color: var(--color-text-secondary);
        }

        .m-action-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }

        .m-action-btn {
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: var(--color-surface-hover);
          color: var(--color-text-secondary);
          gap: 0.5rem;
          font-size: 0.85rem;
        }
        .m-action-btn:hover { background: #f1f5f9; color: var(--color-primary); }
        .m-action-btn.btn-danger { color: var(--color-danger); }

        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: flex !important; }
        }

        /* ... remaining existing styles for desktop ... */
        .mandate-info { display: flex; flex-direction: column; gap: 0.25rem; }
        .mandate-name { font-weight: 600; color: var(--color-primary); font-size: 0.9375rem; }
        .mandate-meta { display: flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; color: var(--color-text-secondary); }
        .roles-progress-container { width: 140px; }
        .roles-labels { display: flex; align-items: baseline; gap: 2px; font-size: 0.875rem; font-weight: 700; margin-bottom: 0.375rem; }
        .roles-divider { color: var(--color-text-muted); font-weight: 400; }
        .roles-total { color: var(--color-text-secondary); font-weight: 500; }
        .deadline-display { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 500; color: var(--color-text-secondary); }
        .expiring-soon { color: #d97706; }
        .expired { color: #dc2626; }
        .urgent-dot { width: 8px; height: 8px; background: #ef4444; border-radius: 50%; box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2); animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.2); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
        .action-button-group { display: flex; gap: 0.5rem; justify-content: flex-end; opacity: 0.6; transition: all 0.3s ease; }
        .interactive-row:hover .action-button-group { opacity: 1; transform: scale(1.02); }
        .interactive-row:hover .action-btn { transform: scale(1.05); }
        .action-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 8px; color: var(--color-text-secondary); background: transparent; transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; }
        .action-btn:hover { background: var(--color-surface-card); color: var(--color-primary) !important; transform: scale(1.15) !important; box-shadow: var(--shadow-sm); z-index: 10; }
        .action-btn.btn-danger:hover { color: #dc2626; }
        .action-btn.btn-info:hover { color: #0284c7; }
        [data-tooltip]::before { content: attr(data-tooltip); position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%) translateY(-8px); padding: 0.4rem 0.6rem; background: #1e293b; color: white; font-size: 0.7rem; border-radius: 4px; white-space: nowrap; pointer-events: none; opacity: 0; transition: all 0.2s ease; z-index: 100; }
        [data-tooltip]:hover::before { opacity: 1; transform: translateX(-50%) translateY(-4px); }
        .text-right { text-align: right; }
        .empty-table-state { padding: 4rem; text-align: center; color: var(--color-text-muted); }
      `}} />
    </div>
  );
};


export default MandatesTable;
