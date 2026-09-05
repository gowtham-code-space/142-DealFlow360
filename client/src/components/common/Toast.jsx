import React from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  return (
    <div
      style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 1100,
        backgroundColor: type === 'success' ? '#065f46' : type === 'error' ? '#991b1b' : 'var(--primary, #57344f)',
        color: '#ffffff', padding: '12px 18px', borderRadius: 'var(--radius-md, 8px)',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.15)',
        display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 500
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
        {type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}
      </span>
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: 8, padding: 0, display: 'flex' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
        </button>
      )}
    </div>
  );
}
