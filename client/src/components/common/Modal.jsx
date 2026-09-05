import React from 'react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = '600px' }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(2px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 16
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth, backgroundColor: 'var(--surface-container-lowest, #ffffff)',
          borderRadius: 'var(--radius-xl, 12px)', border: '1px solid rgba(209,195,202,0.5)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', borderBottom: '1px solid rgba(209,195,202,0.3)',
          background: 'var(--surface-container-low, #fcf8f9)'
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary, #57344f)', margin: 0 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--outline, #80747a)', display: 'flex', alignItems: 'center',
              padding: 4, borderRadius: 4
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>
        <div style={{ padding: 20, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
