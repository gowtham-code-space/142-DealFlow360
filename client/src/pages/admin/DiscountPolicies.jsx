import React, { useState } from 'react';
import Modal from '../../components/common/Modal';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

export default function DiscountPolicies() {
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '' });

  const handleBlockedAction = (actionTitle) => {
    setModalConfig({
      isOpen: true,
      title: `Backend API Not Connected — ${actionTitle}`,
      message: `Discount policy modification for "${actionTitle}" is operating in Read-Only Mode. Mathematical discount guardrails are enforced via static policy rules.`
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
              <MS icon="percent" size={22} />
            </div>
            <div>
              <h1 className="headline-lg" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                Discount Policy Governance & Mathematical Guardrails
              </h1>
              <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                System-Wide Discount Limits, Margin Formula Engine, Stacking Rules & Automated Rejection Ceiling
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="badge" style={{ background: 'rgba(87,52,79,0.1)', color: 'var(--primary)', padding: '6px 12px', fontSize: 12 }}>
            <MS icon="shield" size={16} /> Read-Only Policy Engine
          </span>
          <button onClick={() => handleBlockedAction('Add Discount Guardrail Rule')} className="btn btn-primary btn-sm">
            <MS icon="add" size={16} /> + New Guardrail Rule
          </button>
        </div>
      </div>

      {/* Telemetry Ribbon */}
      <div className="grid-metrics">
        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Hard Policy Ceiling</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--error)' }}>45.0% Max</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Automated System Block</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Margin Floor Lock</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>22.0% Min</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Enforced Gross Profit</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Fast-Path Cap Range</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>5% - 20%</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>By Customer Tier</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Executive Escalation</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>&gt; 30% Disc</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Dual Sign Required</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Discount Stacking</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-surface)' }}>Linear Non-Additive</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Prevents Double Discounting</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Evaluator Mode</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>Read-Only</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Rule Matrix Active</span>
        </div>
      </div>

      {/* Tier Discount Limits Table */}
      <div className="card">
        <div className="card-header flex-between">
          <div>
            <h3 className="headline-sm" style={{ color: 'var(--primary)' }}>Discount Ceiling Matrix by Customer Tier</h3>
            <p className="body-sm" style={{ color: 'var(--outline)' }}>Fast-path thresholds, manager review triggers, and executive escalation limits</p>
          </div>
          <button onClick={() => handleBlockedAction('Export Policy Matrix')} className="btn btn-outline btn-sm">
            <MS icon="download" size={16} /> Export Policy Matrix
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Tier</th>
                <th>Auto-Approve Cap</th>
                <th>Manager Review Range</th>
                <th>Executive Dual-Sig Range</th>
                <th>Hard System Rejection</th>
                <th>Allowed Stacking</th>
                <th>Ops</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="badge badge-surface" style={{ fontSize: 12 }}>STANDARD</span></td>
                <td className="font-mono text-emerald">&le; 5.0%</td>
                <td className="font-mono text-amber">5.1% - 10.0%</td>
                <td className="font-mono text-primary-color">10.1% - 45.0%</td>
                <td className="font-mono text-error">&gt; 45.0%</td>
                <td>Single Line Discount</td>
                <td><button onClick={() => handleBlockedAction('Edit Standard Tier Policy')} className="btn btn-outline btn-sm">Configure</button></td>
              </tr>
              <tr>
                <td><span className="badge badge-amber" style={{ fontSize: 12 }}>GOLD</span></td>
                <td className="font-mono text-emerald">&le; 12.0%</td>
                <td className="font-mono text-amber">12.1% - 20.0%</td>
                <td className="font-mono text-primary-color">20.1% - 45.0%</td>
                <td className="font-mono text-error">&gt; 45.0%</td>
                <td>Volume + Line Discount</td>
                <td><button onClick={() => handleBlockedAction('Edit Gold Tier Policy')} className="btn btn-outline btn-sm">Configure</button></td>
              </tr>
              <tr>
                <td><span className="badge badge-secondary" style={{ fontSize: 12 }}>PLATINUM</span></td>
                <td className="font-mono text-emerald">&le; 20.0%</td>
                <td className="font-mono text-amber">20.1% - 30.0%</td>
                <td className="font-mono text-primary-color">30.1% - 45.0%</td>
                <td className="font-mono text-error">&gt; 45.0%</td>
                <td>Custom SLA + Line Discount</td>
                <td><button onClick={() => handleBlockedAction('Edit Platinum Tier Policy')} className="btn btn-outline btn-sm">Configure</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Mathematical Margin Guardrail Formula Card */}
      <div className="card card-body" style={{ background: 'var(--surface-container-low)', border: '1px solid rgba(209,195,202,0.3)' }}>
        <h3 className="headline-sm" style={{ color: 'var(--primary)', marginBottom: 8 }}>Automated Margin Formula Engine Specification</h3>
        <p className="body-sm" style={{ color: 'var(--on-surface-variant)', marginBottom: 12 }}>
          DealFlow360 calculates gross margin dynamically for every line item using the canonical formula:
        </p>
        <div style={{ background: '#fff', padding: 14, borderRadius: 8, fontFamily: 'monospace', fontSize: 13, color: 'var(--primary)', fontWeight: 700 }}>
          Calculated Margin % = Max ( 12.0% , 50.0% - ( Discount % &times; 0.8 ) )
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 12 }}>
          <div style={{ background: '#fff', padding: 10, borderRadius: 6, fontSize: 11 }}>
            <strong>HEALTHY MARGIN:</strong> Gross Margin &ge; 35.0%. Quote passes auto-approval evaluation.
          </div>
          <div style={{ background: '#fff', padding: 10, borderRadius: 6, fontSize: 11 }}>
            <strong>WARNING / FLOOR LOCK:</strong> Gross Margin &lt; 35.0%. Requires Manager override; &lt; 22.0% triggers system rejection.
          </div>
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
            <span><strong>Read-Only Governance Protection:</strong> Policy changes are disabled in backend-disconnected state.</span>
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
