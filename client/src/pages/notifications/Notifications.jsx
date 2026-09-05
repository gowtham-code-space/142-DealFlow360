import React from 'react';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size }}>{icon}</span>
);

export default function Notifications() {
  return (
    <div className="flex-col gap-4">
      {/* Header Bar */}
      <div className="flex-between">
        <div>
          <h1 className="headline-lg" style={{ margin: 0 }}>Notifications Inbox</h1>
          <p className="body-md text-secondary" style={{ margin: 0 }}>System alerts, approval updates, and negotiation statuses</p>
        </div>
      </div>

      <div className="card" style={{ minHeight: '400px' }}>
        <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <span style={{ opacity: 0.5, marginBottom: 16, display: 'inline-block' }}>
            <MS icon="notifications_off" size={64} />
          </span>
          <h3 className="headline-md text-primary">Notifications Not Connected</h3>
          <p className="body-md">The backend notification event stream is currently offline or under construction.</p>
          <div style={{
            background: 'var(--surface-container-low)', padding: '16px 24px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)', marginTop: 24, display: 'inline-block', textAlign: 'left'
          }}>
            <h4 className="headline-sm" style={{ marginBottom: 12 }}>Expected Notification Categories (Coming Soon)</h4>
            <div className="flex-col gap-2">
              <div className="flex-gap-2 text-secondary"><MS icon="policy" size={16} /> <span>Manager Approval Verdicts</span></div>
              <div className="flex-gap-2 text-secondary"><MS icon="forum" size={16} /> <span>Customer Counter Offers</span></div>
              <div className="flex-gap-2 text-secondary"><MS icon="check_circle" size={16} /> <span>Final Contract Signatures</span></div>
              <div className="flex-gap-2 text-secondary"><MS icon="campaign" size={16} /> <span>System & Marketing Announcements</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
