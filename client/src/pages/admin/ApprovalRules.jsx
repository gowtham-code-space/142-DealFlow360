import React, { useState } from 'react';
import Modal from '../../components/common/Modal';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

export default function ApprovalRules() {
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '' });
  const [filterTier, setFilterTier] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const handleBlockedAction = (actionTitle) => {
    setModalConfig({
      isOpen: true,
      title: `Backend API Not Connected — ${actionTitle}`,
      message: `The Approval Rule Builder is running in Read-Only Governance Mode. Write actions for "${actionTitle}" are blocked until backend endpoint is active.`
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
              <MS icon="rule" size={22} />
            </div>
            <div>
              <h1 className="headline-lg" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                Approval Rule Builder & Multi-Sig Escalation
              </h1>
              <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                Multi-Tier Approval Gates, Discount Threshold Routing, & Executive Multi-Sig Governance
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="badge" style={{ background: 'rgba(87,52,79,0.1)', color: 'var(--primary)', padding: '6px 12px', fontSize: 12 }}>
            <MS icon="shield" size={16} /> Read-Only Rule Engine
          </span>
          <button onClick={() => handleBlockedAction('Create Approval Chain Rule')} className="btn btn-primary btn-sm">
            <MS icon="add" size={16} /> + New Approval Rule
          </button>
        </div>
      </div>

      {/* Telemetry Ribbon */}
      <div className="grid-metrics">
        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Active Chains</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>8 Rule Chains</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Tier & Margin Conditionals</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Multi-Sig Gates</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>3 Levels</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Rep &rarr; Manager &rarr; VP Finance</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Auto-Approval SLA</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>&lt; 200ms</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Instant Fast-Path Rule</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Manager Timeout SLA</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-surface)' }}>24 Hours</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Auto-Escalation Gate</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Executive Threshold</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--error)' }}>&gt; ₹2.0 Cr</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Dual VP Signature Lock</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Rule Execution</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>Enforced</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Frontend Evaluator Active</span>
        </div>
      </div>

      {/* Approval Flow Visualizer */}
      <div className="card card-body" style={{ background: 'var(--surface-container-low)', border: '1px solid rgba(209,195,202,0.3)' }}>
        <h3 className="headline-sm" style={{ color: 'var(--primary)', marginBottom: 12 }}>Multi-Tier Approval Hierarchy Visualization</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <div style={{ background: '#fff', padding: 12, borderRadius: 8, borderLeft: '4px solid var(--secondary)' }}>
            <span className="badge badge-secondary" style={{ fontSize: 10 }}>LEVEL 1</span>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>Fast-Path Auto-Approve</h4>
            <p style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 4 }}>
              Discount within Customer Tier Limit & Margin &ge; 35%. Instant execution without queue delay.
            </p>
          </div>

          <div style={{ background: '#fff', padding: 12, borderRadius: 8, borderLeft: '4px solid #f59e0b' }}>
            <span className="badge badge-amber" style={{ fontSize: 10 }}>LEVEL 2</span>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>Sales Manager Single-Sig</h4>
            <p style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 4 }}>
              Discount exceeds Tier Limit (up to 30%) or Margin between 22%-34.9%. Assigned to Regional Manager.
            </p>
          </div>

          <div style={{ background: '#fff', padding: 12, borderRadius: 8, borderLeft: '4px solid var(--primary)' }}>
            <span className="badge badge-primary" style={{ fontSize: 10 }}>LEVEL 3</span>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>Dual Executive Multi-Sig</h4>
            <p style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 4 }}>
              Discount &gt; 30% OR Contract Value &gt; ₹2.0 Cr. Requires signatures from VP Sales & VP Finance.
            </p>
          </div>

          <div style={{ background: '#fff', padding: 12, borderRadius: 8, borderLeft: '4px solid var(--error)' }}>
            <span className="badge badge-error" style={{ fontSize: 10 }}>LEVEL 4</span>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>Hard Policy Floor Block</h4>
            <p style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 4 }}>
              Discount &gt; 45% OR Margin &lt; 22%. System automatically rejects quote. No manual bypass permitted.
            </p>
          </div>
        </div>
      </div>

      {/* Approval Rule Matrix Table */}
      <div className="card">
        <div className="card-header flex-between">
          <div>
            <h3 className="headline-sm" style={{ color: 'var(--primary)' }}>Configured Approval Chains & Escalation Triggers</h3>
            <p className="body-sm" style={{ color: 'var(--outline)' }}>Rule priority, conditional logic, assigned approver roles, and enforcement status</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="Search approval rules..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ width: 200, height: 32 }}
            />
            <select
              value={filterTier}
              onChange={e => setFilterTier(e.target.value)}
              className="select-field"
              style={{ width: 140, height: 32 }}
            >
              <option value="ALL">All Tiers</option>
              <option value="STANDARD">Standard Tier</option>
              <option value="GOLD">Gold Tier</option>
              <option value="PLATINUM">Platinum Tier</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rule ID</th>
                <th>Rule Name</th>
                <th>Target Tier / Scope</th>
                <th>Trigger Conditions</th>
                <th>Assigned Approver</th>
                <th>Timeout SLA</th>
                <th>Action on Expire</th>
                <th>Status</th>
                <th>Ops</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono font-semibold">ARULE-101</td>
                <td>Standard Tier Over-Discount</td>
                <td><span className="badge badge-surface">Standard</span></td>
                <td className="font-mono">Discount &gt; 10% AND &le; 20%</td>
                <td>Sales Manager (Single-Sig)</td>
                <td>24 Hours</td>
                <td>Escalate to VP Sales</td>
                <td><span className="badge badge-success">ACTIVE</span></td>
                <td><button onClick={() => handleBlockedAction('Edit ARULE-101')} className="btn btn-outline btn-sm">Edit</button></td>
              </tr>
              <tr>
                <td className="font-mono font-semibold">ARULE-102</td>
                <td>Gold Tier Over-Discount</td>
                <td><span className="badge badge-amber">Gold</span></td>
                <td className="font-mono">Discount &gt; 20% AND &le; 30%</td>
                <td>Sales Manager (Single-Sig)</td>
                <td>24 Hours</td>
                <td>Escalate to VP Sales</td>
                <td><span className="badge badge-success">ACTIVE</span></td>
                <td><button onClick={() => handleBlockedAction('Edit ARULE-102')} className="btn btn-outline btn-sm">Edit</button></td>
              </tr>
              <tr>
                <td className="font-mono font-semibold">ARULE-103</td>
                <td>Platinum Tier Deep Discount</td>
                <td><span className="badge badge-secondary">Platinum</span></td>
                <td className="font-mono">Discount &gt; 30% AND &le; 40%</td>
                <td>VP Sales & VP Finance (Dual-Sig)</td>
                <td>12 Hours</td>
                <td>Escalate to CEO</td>
                <td><span className="badge badge-success">ACTIVE</span></td>
                <td><button onClick={() => handleBlockedAction('Edit ARULE-103')} className="btn btn-outline btn-sm">Edit</button></td>
              </tr>
              <tr>
                <td className="font-mono font-semibold">ARULE-201</td>
                <td>Low Margin Profit Lock</td>
                <td>All Tiers</td>
                <td className="font-mono">Gross Margin 22.0% - 29.9%</td>
                <td>Finance Ops Manager</td>
                <td>18 Hours</td>
                <td>Require Cost Breakdown</td>
                <td><span className="badge badge-success">ACTIVE</span></td>
                <td><button onClick={() => handleBlockedAction('Edit ARULE-201')} className="btn btn-outline btn-sm">Edit</button></td>
              </tr>
              <tr>
                <td className="font-mono font-semibold">ARULE-301</td>
                <td>Mega Deal Threshold Gate</td>
                <td>All Tiers</td>
                <td className="font-mono">Total Value &gt; ₹2,00,00,000</td>
                <td>VP Sales & VP Finance</td>
                <td>8 Hours</td>
                <td>Urgent Executive Alert</td>
                <td><span className="badge badge-success">ACTIVE</span></td>
                <td><button onClick={() => handleBlockedAction('Edit ARULE-301')} className="btn btn-outline btn-sm">Edit</button></td>
              </tr>
              <tr>
                <td className="font-mono font-semibold">ARULE-999</td>
                <td>Hard Ceiling System Floor</td>
                <td>Global</td>
                <td className="font-mono">Discount &gt; 45% OR Margin &lt; 22%</td>
                <td>System Auto-Reject</td>
                <td>Instant</td>
                <td>Block Deal Submission</td>
                <td><span className="badge badge-error">HARD FLOOR</span></td>
                <td><button onClick={() => handleBlockedAction('Inspect ARULE-999')} className="btn btn-outline btn-sm">Inspect</button></td>
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
            <span><strong>Read-Only Governance Protection:</strong> Rule updates are disabled until backend approval endpoints are deployed.</span>
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
