import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { MOCK_WAREHOUSES } from '../../utils/constants';
import Modal from '../../components/common/Modal';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

export default function ResourcesWarehouses() {
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '' });

  const handleBlockedAction = (actionTitle) => {
    setModalConfig({
      isOpen: true,
      title: `Backend API Not Connected — ${actionTitle}`,
      message: `Warehouse allocation modification for "${actionTitle}" is operating in Read-Only Mode. Stock levels and pool splits are managed locally via fallback constants.`
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
              <MS icon="warehouse" size={22} />
            </div>
            <div>
              <h1 className="headline-lg" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                Resource & Regional Warehouse Allocation
              </h1>
              <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                Multi-Warehouse Stock Splitting, 50/50 Pool Allocation, 48h Inventory Hold Locks & Shipping Optimization
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="badge" style={{ background: 'rgba(87,52,79,0.1)', color: 'var(--primary)', padding: '6px 12px', fontSize: 12 }}>
            <MS icon="shield" size={16} /> Read-Only Warehouse Engine
          </span>
          <button onClick={() => handleBlockedAction('Add Regional Hub')} className="btn btn-primary btn-sm">
            <MS icon="add_location" size={16} /> + Provision Warehouse Hub
          </button>
        </div>
      </div>

      {/* Telemetry Ribbon */}
      <div className="grid-metrics">
        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Active Warehouses</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>3 Hubs</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>East, West, Central</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Total Stock Pool</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>1,370 Units</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Hardware Inventory</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>50/50 Pool Split</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>ENFORCED</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Normal vs Bulk Pool</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Active 48h Holds</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>4 Holds</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Customer Negotiation Holds</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Backorder Queue</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-surface)' }}>0 Backorders</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>100% Stock Available</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Optimization Engine</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>Cost & Distance</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Nearest Warehouse Route</span>
        </div>
      </div>

      {/* Warehouse Roster Table */}
      <div className="card">
        <div className="card-header flex-between">
          <div>
            <h3 className="headline-sm" style={{ color: 'var(--primary)' }}>Regional Warehouse Roster & Pool Split Status</h3>
            <p className="body-sm" style={{ color: 'var(--outline)' }}>Stock balances, pool splits (Normal vs Bulk), and shipping rates per regional hub</p>
          </div>
          <button onClick={() => handleBlockedAction('Export Warehouse Manifest')} className="btn btn-outline btn-sm">
            <MS icon="download" size={16} /> Export Inventory Manifest
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Warehouse ID</th>
                <th>Regional Facility Name</th>
                <th>Total Stock Units</th>
                <th>Normal Pool (50%)</th>
                <th>Premium Bulk Pool (50%)</th>
                <th>Shipping Cost Rate</th>
                <th>Allocation Status</th>
                <th>Ops</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_WAREHOUSES.map((wh) => {
                const halfStock = Math.floor(wh.stock / 2);
                return (
                  <tr key={wh.id}>
                    <td className="font-mono font-semibold">{wh.id}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{wh.name}</div>
                    </td>
                    <td className="font-mono font-semibold">{wh.stock} Units</td>
                    <td className="font-mono text-secondary-color">{halfStock} Units</td>
                    <td className="font-mono text-primary-color">{halfStock} Units</td>
                    <td className="font-mono">₹{wh.shippingCostRate} / unit</td>
                    <td>
                      <span className="badge badge-success">ACTIVE & OPTIMIZED</span>
                    </td>
                    <td>
                      <button onClick={() => handleBlockedAction(`Configure ${wh.id}`)} className="btn btn-outline btn-sm">
                        Configure
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 50/50 Inventory Pool Allocation Policy Diagram */}
      <div className="card card-body" style={{ background: 'var(--surface-container-low)', border: '1px solid rgba(209,195,202,0.3)' }}>
        <h3 className="headline-sm" style={{ color: 'var(--primary)', marginBottom: 8 }}>50/50 Inventory Reservation Governance Architecture</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <div style={{ background: '#fff', padding: 12, borderRadius: 8, borderLeft: '4px solid var(--secondary)' }}>
            <span className="badge badge-secondary" style={{ fontSize: 10 }}>POOL A (50%)</span>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>Normal Pool (Standard Orders)</h4>
            <p style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 4 }}>
              Allocated for single-item or standard quotation orders from Sales Reps. Immediate fulfillment dispatch.
            </p>
          </div>

          <div style={{ background: '#fff', padding: 12, borderRadius: 8, borderLeft: '4px solid var(--primary)' }}>
            <span className="badge badge-primary" style={{ fontSize: 10 }}>POOL B (50%)</span>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>Premium Bulk Pool (Enterprise)</h4>
            <p style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 4 }}>
              Reserved for Gold and Platinum bulk deployments. Prevents inventory exhaustion by standard orders.
            </p>
          </div>

          <div style={{ background: '#fff', padding: 12, borderRadius: 8, borderLeft: '4px solid #f59e0b' }}>
            <span className="badge badge-amber" style={{ fontSize: 10 }}>HOLD GOVERNANCE</span>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>48-Hour Atomic Lock</h4>
            <p style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 4 }}>
              When a buyer submits a negotiation counter-offer, stock is locked atomically for 48 hours to prevent race conditions.
            </p>
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
            <span><strong>Read-Only Governance Protection:</strong> Warehouse adjustments are disabled in backend-disconnected state.</span>
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
