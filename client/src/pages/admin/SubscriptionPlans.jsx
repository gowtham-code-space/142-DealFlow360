import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import Modal from '../../components/common/Modal';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

export default function SubscriptionPlans() {
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '' });

  const handleBlockedAction = (actionTitle) => {
    setModalConfig({
      isOpen: true,
      title: `Backend API Not Connected — ${actionTitle}`,
      message: `SaaS subscription plan modification for "${actionTitle}" is operating in Read-Only Mode. Billing rules and license tier pricing are enforced via static constants.`
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
              <MS icon="loyalty" size={22} />
            </div>
            <div>
              <h1 className="headline-lg" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                Subscription Plans & SaaS Billing Governance
              </h1>
              <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                Hybrid SaaS + CapEx Billing Models, License Pricing Tiering, SLA Commitments & Annual Indexation Caps
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="badge" style={{ background: 'rgba(87,52,79,0.1)', color: 'var(--primary)', padding: '6px 12px', fontSize: 12 }}>
            <MS icon="shield" size={16} /> Read-Only Subscription Engine
          </span>
          <button onClick={() => handleBlockedAction('Create Subscription Plan Tier')} className="btn btn-primary btn-sm">
            <MS icon="add" size={16} /> + New Plan Tier
          </button>
        </div>
      </div>

      {/* Telemetry Ribbon */}
      <div className="grid-metrics">
        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Subscription Plans</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>3 Canonical Tiers</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Starter, Growth, Enterprise</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Supported Models</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>Hybrid Billing</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>One-Time + Recurring OpEx</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Annual Indexation</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>5.0% Cap</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Inflation Adjustment Ceiling</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>SLA Commitment</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-surface)' }}>99.98% Uptime</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Mission Critical SLA</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Trial License Cap</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>30 Days</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>RECURRING_FREE Max Limit</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Billing Status</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>Read-Only</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Static Price Matrix</span>
        </div>
      </div>

      {/* Subscription Tier Plans Table */}
      <div className="card">
        <div className="card-header flex-between">
          <div>
            <h3 className="headline-sm" style={{ color: 'var(--primary)' }}>SaaS Subscription Plan Tier Matrix</h3>
            <p className="body-sm" style={{ color: 'var(--outline)' }}>Monthly/Annual recurring pricing, included user seats, support SLA level, and renewal rules</p>
          </div>
          <button onClick={() => handleBlockedAction('Export Plan Specs')} className="btn btn-outline btn-sm">
            <MS icon="download" size={16} /> Export Plan Matrix
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Plan Code</th>
                <th>Subscription Plan Name</th>
                <th>Billing Model</th>
                <th>List Unit Price</th>
                <th>Included Seats</th>
                <th>SLA Level</th>
                <th>Annual Indexation</th>
                <th>Status</th>
                <th>Ops</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono font-semibold">PLAN-SAAS-STR</td>
                <td>DealFlow SaaS Starter</td>
                <td><span className="badge badge-surface">RECURRING_MONTHLY</span></td>
                <td className="font-mono font-semibold">{formatCurrency(15000)} / mo</td>
                <td>10 User Seats</td>
                <td>Standard SLA (48h)</td>
                <td className="font-mono">Max 3.0%</td>
                <td><span className="badge badge-success">ACTIVE</span></td>
                <td><button onClick={() => handleBlockedAction('Edit PLAN-SAAS-STR')} className="btn btn-outline btn-sm">Edit Plan</button></td>
              </tr>
              <tr>
                <td className="font-mono font-semibold">PLAN-SAAS-GRW</td>
                <td>DealFlow SaaS Growth</td>
                <td><span className="badge badge-amber">RECURRING_MONTHLY</span></td>
                <td className="font-mono font-semibold">{formatCurrency(35000)} / mo</td>
                <td>50 User Seats</td>
                <td>High-Priority SLA (24h)</td>
                <td className="font-mono">Max 4.0%</td>
                <td><span className="badge badge-success">ACTIVE</span></td>
                <td><button onClick={() => handleBlockedAction('Edit PLAN-SAAS-GRW')} className="btn btn-outline btn-sm">Edit Plan</button></td>
              </tr>
              <tr>
                <td className="font-mono font-semibold">PLAN-SAAS-ENT</td>
                <td>DealFlow SaaS Enterprise</td>
                <td><span className="badge badge-secondary">RECURRING_ANNUAL</span></td>
                <td className="font-mono font-semibold">{formatCurrency(100000)} / yr</td>
                <td>Unlimited Seats</td>
                <td>Mission Critical SLA (4h)</td>
                <td className="font-mono">Max 5.0%</td>
                <td><span className="badge badge-success">ACTIVE</span></td>
                <td><button onClick={() => handleBlockedAction('Edit PLAN-SAAS-ENT')} className="btn btn-outline btn-sm">Edit Plan</button></td>
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
            <span><strong>Read-Only Governance Protection:</strong> Plan modifications are disabled in backend-disconnected state.</span>
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
