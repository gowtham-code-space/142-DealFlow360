import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((options) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    const toast = typeof options === 'string'
      ? { id, type: 'info', message: options, duration: 4500 }
      : {
          id,
          type: options.type || 'info',
          title: options.title || '',
          message: options.message || '',
          duration: options.duration !== undefined ? options.duration : 4500
        };

    setToasts((prev) => [...prev, toast]);

    if (toast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration);
    }

    return id;
  }, [removeToast]);

  const toast = {
    success: (message, title = '') => showToast({ type: 'success', title, message }),
    error: (message, title = '') => showToast({ type: 'error', title, message }),
    warning: (message, title = '') => showToast({ type: 'warning', title, message, duration: 5500 }),
    info: (message, title = '') => showToast({ type: 'info', title, message })
  };

  return (
    <ToastContext.Provider value={{ showToast, toast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '420px',
          width: 'calc(100% - 48px)',
          pointerEvents: 'none'
        }}
      >
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          const isWarning = t.type === 'warning';
          const isInfo = t.type === 'info';

          const accentColor = isSuccess ? '#059669' : isError ? '#dc2626' : isWarning ? '#d97706' : '#57344f';
          const bgColor = isSuccess ? '#f0fdf4' : isError ? '#fef2f2' : isWarning ? '#fffbeb' : '#faf5f8';
          const borderColor = isSuccess ? '#86efac' : isError ? '#fca5a5' : isWarning ? '#fde68a' : '#e9d5ff';
          const icon = isSuccess ? 'check_circle' : isError ? 'error' : isWarning ? 'warning' : 'info';

          return (
            <div
              key={t.id}
              style={{
                pointerEvents: 'auto',
                background: bgColor,
                border: `1px solid ${borderColor}`,
                borderRadius: '10px',
                padding: '12px 16px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                animation: 'slideInToast 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                fontFamily: 'Inter, system-ui, sans-serif'
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: `${accentColor}18`,
                  color: accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '1px'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  {icon}
                </span>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {t.title && (
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginBottom: '2px' }}>
                    {t.title}
                  </div>
                )}
                <div style={{ fontSize: '0.8rem', color: '#374151', lineHeight: '1.4' }}>
                  {t.message}
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeToast(t.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '2px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#374151')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  close
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
