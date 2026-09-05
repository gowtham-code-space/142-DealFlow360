import React, { useState } from 'react';
import Modal from '../../components/common/Modal';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

export default function UsersRolesRBAC() {
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '' });

  const handleBlockedAction = (actionTitle) => {
    setModalConfig({
      isOpen: true,
      title: `Backend API Not Connected — ${actionTitle}`,
      message: `User RBAC modification for "${actionTitle}" is operating in Read-Only Mode. User access control and canonical roles are maintained via frontend AuthContext.`
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16,
        padding: '18px 22px', borderRadius: 'var(--radius-xl)',
        background: 'linear-gradient(135deg, var(--surface-container-lowest) 0%, var(--surface-container-low) 100%)',
        border: '1px solid rgba(209,195,202,0.5)', boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}>
              <MS icon="admin_panel_settings" size={22} />
            </div>
            <div>
              <h1 className="headline-lg" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                Users & Roles RBAC Governance Matrix
              </h1>
              <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                Role-Based Access Control Matrix, System User Directory, & Scope Privilege Governance
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="badge" style={{ background: 'rgba(87,52,79,0.1)', color: 'var(--primary)', padding: '6px 12px', fontSize: 12 }}>
            <MS icon="shield" size={16} /> Read-Only RBAC Engine
          </span>
          <button onClick={() => handleBlockedAction('Provision System User')} className="btn btn-primary btn-sm">
            <MS icon="person_add" size={16} /> + Provision User
          </button>
        </div>
      </div>

      {/* Telemetry Ribbon */}
      <div className="grid-metrics">
        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>System Users</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>6 Accounts</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Active User Registry</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>System Roles</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>5 Roles</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Canonical Architecture</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Active Session</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>Victoria Stone</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>#USR-401 • System Admin</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Auth Engine</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-surface)' }}>LocalStorage JWT</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Developer Switcher Active</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Permission Engine</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>Strict Isolation</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>No Cross-Role Leaks</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Write Operations</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--error)' }}>Blocked</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Backend API Offline</span>
        </div>
      </div>

      {/* RBAC Capabilities Matrix Table */}
      <div className="card">
        <div className="card-header flex-between">
          <div>
            <h3 className="headline-sm" style={{ color: 'var(--primary)' }}>RBAC Capability & Permission Scope Matrix</h3>
            <p className="body-sm" style={{ color: 'var(--outline)' }}>Feature permissions across the 5 system roles</p>
          </div>
          <button onClick={() => handleBlockedAction('Modify RBAC Matrix')} className="btn btn-outline btn-sm">
            <MS icon="edit" size={16} /> Edit Role Matrix
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>System Role</th>
                <th>Create & Edit Quotes</th>
                <th>Approve Overrides</th>
                <th>Inspect Cost / Margin</th>
                <th>Stock Allocation</th>
                <th>System Governance</th>
                <th>Buyer Portal Access</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="badge badge-secondary" style={{ fontSize: 12 }}>Sales Representative</span></td>
                <td><span className="badge badge-success">&check; ALLOWED</span></td>
                <td><span className="badge badge-error">&cross; BLOCKED</span></td>
                <td><span className="badge badge-error">&cross; HIDDEN</span></td>
                <td><span className="badge badge-surface">READ-ONLY</span></td>
                <td><span className="badge badge-error">&cross; BLOCKED</span></td>
                <td><span className="badge badge-error">&cross; BLOCKED</span></td>
              </tr>
              <tr>
                <td><span className="badge badge-primary" style={{ fontSize: 12 }}>Sales Manager / Approver</span></td>
                <td><span className="badge badge-surface">READ-ONLY</span></td>
                <td><span className="badge badge-success">&check; ALLOWED</span></td>
                <td><span className="badge badge-success">&check; ALLOWED</span></td>
                <td><span className="badge badge-surface">READ-ONLY</span></td>
                <td><span className="badge badge-error">&cross; BLOCKED</span></td>
                <td><span className="badge badge-error">&cross; BLOCKED</span></td>
              </tr>
              <tr>
                <td><span className="badge badge-surface" style={{ fontSize: 12 }}>Finance / Operations</span></td>
                <td><span className="badge badge-surface">READ-ONLY</span></td>
                <td><span className="badge badge-error">&cross; BLOCKED</span></td>
                <td><span className="badge badge-success">&check; ALLOWED</span></td>
                <td><span className="badge badge-success">&check; ALLOWED</span></td>
                <td><span className="badge badge-error">&cross; BLOCKED</span></td>
                <td><span className="badge badge-error">&cross; BLOCKED</span></td>
              </tr>
              <tr>
                <td><span className="badge badge-error" style={{ fontSize: 12 }}>Administrator</span></td>
                <td><span className="badge badge-surface">READ-ONLY</span></td>
                <td><span className="badge badge-surface">INSPECT ONLY</span></td>
                <td><span className="badge badge-success">&check; ALLOWED</span></td>
                <td><span className="badge badge-surface">READ-ONLY</span></td>
                <td><span className="badge badge-success">&check; FULL GOVERNANCE</span></td>
                <td><span className="badge badge-error">&cross; BLOCKED</span></td>
              </tr>
              <tr>
                <td><span className="badge badge-amber" style={{ fontSize: 12 }}>Customer Portal User</span></td>
                <td><span className="badge badge-surface">COUNTER-OFFER ONLY</span></td>
                <td><span className="badge badge-error">&cross; BLOCKED</span></td>
                <td><span className="badge badge-error">&cross; HIDDEN</span></td>
                <td><span className="badge badge-surface">48H HOLD ONLY</span></td>
                <td><span className="badge badge-error">&cross; BLOCKED</span></td>
                <td><span className="badge badge-success">&check; ALLOWED</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* User Roster */}
      <div className="card">
        <div className="card-header flex-between">
          <div>
            <h3 className="headline-sm" style={{ color: 'var(--primary)' }}>Active User Directory</h3>
            <p className="body-sm" style={{ color: 'var(--outline)' }}>User profiles and assigned canonical role</p>
          </div>
          <button onClick={() => handleBlockedAction('Export User Registry')} className="btn btn-outline btn-sm">
            <MS icon="download" size={16} /> Export User Registry
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Assigned Role</th>
                <th>Status</th>
                <th>Ops</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono font-semibold">USR-401</td>
                <td><strong>Victoria Stone</strong></td>
                <td>victoria.stone@dealflow360.internal</td>
                <td><span className="badge badge-error">Administrator</span></td>
                <td><span className="badge badge-success">ACTIVE SESSION</span></td>
                <td><button onClick={() => handleBlockedAction('Edit USR-401')} className="btn btn-outline btn-sm">Edit</button></td>
              </tr>
              <tr>
                <td className="font-mono font-semibold">USR-101</td>
                <td>Sarah Jenkins</td>
                <td>sarah.jenkins@dealflow360.internal</td>
                <td><span className="badge badge-secondary">Sales Representative</span></td>
                <td><span className="badge badge-surface">OFFLINE</span></td>
                <td><button onClick={() => handleBlockedAction('Edit USR-101')} className="btn btn-outline btn-sm">Edit</button></td>
              </tr>
              <tr>
                <td className="font-mono font-semibold">USR-102</td>
                <td>Alex Rivera</td>
                <td>alex.rivera@dealflow360.internal</td>
                <td><span className="badge badge-secondary">Sales Representative</span></td>
                <td><span className="badge badge-surface">OFFLINE</span></td>
                <td><button onClick={() => handleBlockedAction('Edit USR-102')} className="btn btn-outline btn-sm">Edit</button></td>
              </tr>
              <tr>
                <td className="font-mono font-semibold">USR-201</td>
                <td>David Keller</td>
                <td>david.keller@dealflow360.internal</td>
                <td><span className="badge badge-primary">Sales Manager / Approver</span></td>
                <td><span className="badge badge-surface">OFFLINE</span></td>
                <td><button onClick={() => handleBlockedAction('Edit USR-201')} className="btn btn-outline btn-sm">Edit</button></td>
              </tr>
              <tr>
                <td className="font-mono font-semibold">USR-301</td>
                <td>Elena Rostova</td>
                <td>elena.rostova@dealflow360.internal</td>
                <td><span className="badge badge-surface">Finance / Operations</span></td>
                <td><span className="badge badge-surface">OFFLINE</span></td>
                <td><button onClick={() => handleBlockedAction('Edit USR-301')} className="btn btn-outline btn-sm">Edit</button></td>
              </tr>
              <tr>
                <td className="font-mono font-semibold">CUST-002-USR</td>
                <td>Marcus Vance</td>
                <td>procurement@nexushyperscale.com</td>
                <td><span className="badge badge-amber">Customer Portal User</span></td>
                <td><span className="badge badge-surface">OFFLINE</span></td>
                <td><button onClick={() => handleBlockedAction('Edit CUST-002-USR')} className="btn btn-outline btn-sm">Edit</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Read-Only Action Modal */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        title={modalConfig.title}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            padding: 12, borderRadius: 'var(--radius-md)',
            background: 'var(--error-container)', color: 'var(--on-error-container)',
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 12
          }}>
            <MS icon="lock" size={20} />
            <span><strong>Read-Only Governance Protection:</strong> User management is disabled in backend-disconnected state.</span>
          </div>
          <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>
            {modalConfig.message}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button onClick={() => setModalConfig({ ...modalConfig, isOpen: false })} className="btn btn-primary">
              Acknowledge & Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
