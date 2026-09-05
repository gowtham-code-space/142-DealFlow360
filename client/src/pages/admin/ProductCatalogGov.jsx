import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { MOCK_PRODUCTS } from '../../utils/constants';
import Modal from '../../components/common/Modal';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

export default function ProductCatalogGov() {
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '' });
  const [filterCategory, setFilterCategory] = useState('ALL');

  const handleBlockedAction = (actionTitle) => {
    setModalConfig({
      isOpen: true,
      title: `Backend API Not Connected — ${actionTitle}`,
      message: `Product catalog modification for "${actionTitle}" is operating in Read-Only Mode. List prices, cost prices, and margin thresholds are enforced via static constants.`
    });
  };

  const filteredProducts = filterCategory === 'ALL'
    ? MOCK_PRODUCTS
    : MOCK_PRODUCTS.filter(p => p.category.toUpperCase() === filterCategory);

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
              <MS icon="inventory_2" size={22} />
            </div>
            <div>
              <h1 className="headline-lg" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                Product Configuration & Catalog Governance
              </h1>
              <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                Catalog Matrix, Minimum Margin Thresholds, Pricing Rules & Cross-Sell Governance
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="badge" style={{ background: 'rgba(87,52,79,0.1)', color: 'var(--primary)', padding: '6px 12px', fontSize: 12 }}>
            <MS icon="shield" size={16} /> Read-Only Catalog Engine
          </span>
          <button onClick={() => handleBlockedAction('Add Product to Catalog')} className="btn btn-primary btn-sm">
            <MS icon="add" size={16} /> + Add Catalog Product
          </button>
        </div>
      </div>

      {/* Telemetry Ribbon */}
      <div className="grid-metrics">
        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Catalog Items</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>5 Products</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Hardware, Software, Services</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Margin Floor</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>20.0% Minimum</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Enforced Profit Floor</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Highest Margin</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>88.5% SaaS</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>DealFlow SaaS License</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Hardware SKUs</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-surface)' }}>2 SKUs</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Cloud Server X1, Switch 48P</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Upsell Accessories</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>1 Pack</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Optical Transceivers</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Catalog Mode</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>Read-Only</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Static Price Snapshot</span>
        </div>
      </div>

      {/* Product Catalog Table */}
      <div className="card">
        <div className="card-header flex-between">
          <div>
            <h3 className="headline-sm" style={{ color: 'var(--primary)' }}>Product Catalog & Pricing Governance Matrix</h3>
            <p className="body-sm" style={{ color: 'var(--outline)' }}>List prices, unit cost, minimum margin floors, and billing classifications</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="select-field"
              style={{ width: 160, height: 32 }}
            >
              <option value="ALL">All Categories</option>
              <option value="HARDWARE">Hardware</option>
              <option value="SOFTWARE">Software</option>
              <option value="SERVICE">Service</option>
              <option value="ACCESSORY">Accessory</option>
            </select>
            <button onClick={() => handleBlockedAction('Export Catalog Matrix')} className="btn btn-outline btn-sm">
              <MS icon="download" size={16} /> Export Catalog
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>List Price</th>
                <th>Unit Cost Price</th>
                <th>Min Margin %</th>
                <th>Billing Model</th>
                <th>Upsell Recommended</th>
                <th>Ops</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((prd) => {
                const marginVal = (((prd.listPrice - prd.costPrice) / prd.listPrice) * 100).toFixed(1);
                return (
                  <tr key={prd.id}>
                    <td className="font-mono font-semibold">{prd.id}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{prd.name}</div>
                    </td>
                    <td>
                      <span className="badge badge-surface">{prd.category}</span>
                    </td>
                    <td className="font-mono font-semibold">{formatCurrency(prd.listPrice)}</td>
                    <td className="font-mono">{formatCurrency(prd.costPrice)}</td>
                    <td className="font-mono">
                      <strong style={{ color: Number(marginVal) >= 40 ? 'var(--secondary)' : '#f59e0b' }}>
                        {marginVal}% (Floor {prd.minMargin}%)
                      </strong>
                    </td>
                    <td className="font-mono text-sm">{prd.billingType}</td>
                    <td>
                      {prd.isUpsell ? (
                        <span className="badge badge-amber">YES (REC-01)</span>
                      ) : (
                        <span className="badge badge-surface">STANDARD</span>
                      )}
                    </td>
                    <td>
                      <button onClick={() => handleBlockedAction(`Edit ${prd.name}`)} className="btn btn-outline btn-sm">
                        Edit SKU
                      </button>
                    </td>
                  </tr>
                );
              })}
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
            <span><strong>Read-Only Governance Protection:</strong> Catalog updates are disabled in backend-disconnected state.</span>
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
