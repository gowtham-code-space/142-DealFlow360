import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { MOCK_CUSTOMERS } from '../../utils/constants';
import Modal from '../../components/common/Modal';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

export default function CustomerConfig() {
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '' });

  const handleBlockedAction = (actionTitle) => {
    setModalConfig({
      isOpen: true,
      title: `Backend API Not Connected — ${actionTitle}`,
      message: `Customer governance modification for "${actionTitle}" is operating in Read-Only Mode. Customer tier assignments and credit limits are enforced via static constants.`
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
              <MS icon="group" size={22} />
            </div>
            <div>
              <h1 className="headline-lg" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                Customer Configuration & Tier Classification
              </h1>
              <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                Account Governance, Credit Floor Limits, Risk Score Ratings & Billing Type Classification
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="badge" style={{ background: 'rgba(87,52,79,0.1)', color: 'var(--primary)', padding: '6px 12px', fontSize: 12 }}>
            <MS icon="shield" size={16} /> Read-Only Customer Tier Engine
          </span>
          <button onClick={() => handleBlockedAction('Onboard New Enterprise Account')} className="btn btn-primary btn-sm">
            <MS icon="person_add" size={16} /> + Onboard Account
          </button>
        </div>
      </div>

      {/* Telemetry Ribbon */}
      <div className="grid-metrics">
        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Managed Accounts</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>4 Enterprises</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Canonical Customer Directory</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Total Credit Exposure</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>{formatCurrency(51000000)}</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Combined Credit Ceiling</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Platinum Accounts</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>1 Account</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Apex Global (30% Max Disc)</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Gold Accounts</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>2 Accounts</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Nexus & Quantum (20% Max)</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Standard Accounts</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-surface)' }}>1 Account</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Vanguard (10% Max Disc)</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Risk Governance</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>Real-Time</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Blended Score Matrix Active</span>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="card">
        <div className="card-header flex-between">
          <div>
            <h3 className="headline-sm" style={{ color: 'var(--primary)' }}>Enterprise Account Governance Directory</h3>
            <p className="body-sm" style={{ color: 'var(--outline)' }}>Tier classification, credit limits, risk scores, and SLA governance commitments</p>
          </div>
          <button onClick={() => handleBlockedAction('Export Account Directory')} className="btn btn-outline btn-sm">
            <MS icon="download" size={16} /> Export Account Spec
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Account ID</th>
                <th>Customer Enterprise Name</th>
                <th>Customer Tier</th>
                <th>Max Discount %</th>
                <th>Credit Limit Floor</th>
                <th>Risk Score</th>
                <th>Purchase Model</th>
                <th>SLA Level</th>
                <th>Ops</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CUSTOMERS.map((cust) => (
                <tr key={cust.id}>
                  <td className="font-mono font-semibold">{cust.id}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{cust.name}</div>
                  </td>
                  <td>
                    <span className={`badge ${cust.tier === 'PLATINUM' ? 'badge-secondary' : cust.tier === 'GOLD' ? 'badge-amber' : 'badge-surface'}`}>
                      {cust.tier}
                    </span>
                  </td>
                  <td className="font-mono font-semibold">
                    {cust.tier === 'PLATINUM' ? '30.0%' : cust.tier === 'GOLD' ? '20.0%' : '10.0%'}
                  </td>
                  <td className="font-mono">{formatCurrency(cust.creditLimit)}</td>
                  <td>
                    <span className={`badge ${cust.riskScore < 25 ? 'badge-success' : cust.riskScore < 50 ? 'badge-amber' : 'badge-error'}`}>
                      Score {cust.riskScore} / 100 ({cust.riskScore < 25 ? 'LOW' : cust.riskScore < 50 ? 'MEDIUM' : 'HIGH'})
                    </span>
                  </td>
                  <td className="font-mono text-sm">
                    {cust.tier === 'PLATINUM' ? 'RECURRING_PREMIUM' : cust.tier === 'GOLD' ? 'BULK_ONE_TIME' : 'ONE_TIME'}
                  </td>
                  <td>
                    {cust.tier === 'PLATINUM' ? 'Mission Critical (4h)' : cust.tier === 'GOLD' ? 'High-Priority (24h)' : 'Standard (48h)'}
                  </td>
                  <td>
                    <button onClick={() => handleBlockedAction(`Configure ${cust.name}`)} className="btn btn-outline btn-sm">
                      Configure
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tier vs Purchase Type Clarification Matrix */}
      <div className="card card-body" style={{ background: 'var(--surface-container-low)', border: '1px solid rgba(209,195,202,0.3)' }}>
        <h3 className="headline-sm" style={{ color: 'var(--primary)', marginBottom: 8 }}>Tier Classification & Purchase Type Governance Rule</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: '#fff', padding: 14, borderRadius: 8 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>Customer Tier Governance (Tier Rules)</h4>
            <p style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 4 }}>
              Determines max fast-path discount % ceiling, manager approval triggers, and credit limit ceilings.
            </p>
            <ul style={{ fontSize: 11, color: 'var(--on-surface)', marginTop: 8, paddingLeft: 16, lineHeight: 1.6 }}>
              <li><strong>STANDARD:</strong> Max 10% discount floor. Credit limit: ₹40 Lakh.</li>
              <li><strong>GOLD:</strong> Max 20% discount floor. Credit limit: ₹1.2 Cr.</li>
              <li><strong>PLATINUM:</strong> Max 30% discount floor. Credit limit: ₹2.0 Cr.</li>
            </ul>
          </div>

          <div style={{ background: '#fff', padding: 14, borderRadius: 8 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--secondary)' }}>Customer Purchase Type (Billing Rules)</h4>
            <p style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 4 }}>
              Determines billing engine model, warehouse pool allocation, and subscription SLA.
            </p>
            <ul style={{ fontSize: 11, color: 'var(--on-surface)', marginTop: 8, paddingLeft: 16, lineHeight: 1.6 }}>
              <li><strong>ONE_TIME:</strong> Direct hardware purchases (50% Normal Pool).</li>
              <li><strong>BULK_ONE_TIME:</strong> Large-scale volume hardware (50% Premium Pool).</li>
              <li><strong>RECURRING_FREE:</strong> SaaS trial evaluation (30-day cap).</li>
              <li><strong>RECURRING_PREMIUM:</strong> SaaS licenses & 24/7 SLA (Annual/Monthly).</li>
            </ul>
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
            <span><strong>Read-Only Governance Protection:</strong> Account edits are disabled in backend-disconnected state.</span>
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
