import React, { createContext, useContext, useState, useCallback } from 'react';


const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ type = 'info', message, duration = 5000 }) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <Toast key={t.id} {...t} onRemove={() => onRemove(t.id)} />
      ))}
      <style dangerouslySetInnerHTML={{ __html: `
        .toast-container {
          position: fixed;
          top: 1.5rem;
          right: 1.5rem;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          pointer-events: none;
        }

        .toast-item {
          pointer-events: auto;
          min-width: 300px;
          max-width: 450px;
          padding: 1rem;
          background: var(--color-surface-card);
          border-left: 4px solid var(--color-primary);
          border-radius: var(--radius-md);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          animation: slideInRight 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transition: all 0.3s;
        }

        .toast-item.success { border-left-color: var(--color-success); }
        .toast-item.error { border-left-color: var(--color-danger); }
        .toast-item.warning { border-left-color: var(--color-warning); }
        .toast-item.info { border-left-color: var(--color-primary); }

        .toast-icon {
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .success .toast-icon { color: var(--color-success); }
        .error .toast-icon { color: var(--color-danger); }
        .warning .toast-icon { color: var(--color-warning); }
        .info .toast-icon { color: var(--color-primary); }

        .toast-message {
          flex-grow: 1;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text-primary);
          line-height: 1.4;
        }

        .toast-close {
          flex-shrink: 0;
          color: var(--color-text-muted);
          transition: color 0.2s;
          padding: 0.125rem;
          border-radius: 4px;
        }

        .toast-close:hover {
          color: var(--color-text-primary);
          background: var(--color-surface-hover);
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; transform: scale(0.95); }
        }
      `}} />
    </div>
  );
};

const Toast = ({ type, message, onRemove }) => {
  const icons = {
    success: <span className="material-symbols-outlined flex-shrink-0 !text-[18px] toast-icon">check_circle</span>,
    error: <span className="material-symbols-outlined flex-shrink-0 !text-[18px] toast-icon">error</span>,
    warning: <span className="material-symbols-outlined flex-shrink-0 !text-[18px] toast-icon">warning</span>,
    info: <span className="material-symbols-outlined flex-shrink-0 !text-[18px] toast-icon">info</span>
  };

  return (
    <div className={`toast-item ${type}`}>
      {icons[type]}
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onRemove}>
        <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">close</span>
      </button>
    </div>
  );
};
