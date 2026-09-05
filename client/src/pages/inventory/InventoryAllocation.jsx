import React, { useState } from 'react';
import { MOCK_WAREHOUSES, MOCK_PRODUCTS } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import { Boxes, Truck, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react';

export default function InventoryAllocation() {
  const [selectedProduct, setSelectedProduct] = useState(MOCK_PRODUCTS[0]);
  const [orderQuantity, setOrderQuantity] = useState(25);
  const [destination, setDestination] = useState('New York, NY (East)');

  // Optimal Split Calculation Simulation (Requirement 5 in PS)
  const calculateAllocation = () => {
    // East Coast stock: 450, California stock: 320, Midwest stock: 600
    if (orderQuantity <= 20) {
      return [
        { warehouse: 'East Coast Distribution (NJ)', allocated: orderQuantity, shippingCost: orderQuantity * 45, reason: 'Lowest shipping cost & single shipment' }
      ];
    } else {
      return [
        { warehouse: 'East Coast Distribution (NJ)', allocated: 20, shippingCost: 20 * 45, reason: 'Primary local fulfillment' },
        { warehouse: 'Midwest Hub (IL)', allocated: orderQuantity - 20, shippingCost: (orderQuantity - 20) * 55, reason: 'Secondary stock transfer minimizing split penalty' }
      ];
    }
  };

  const allocationResult = calculateAllocation();
  const totalFreight = allocationResult.reduce((acc, r) => acc + r.shippingCost, 0);

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Multi-Warehouse Inventory Allocation Engine</h1>
          <p className="page-subtitle">Algorithmic stock split optimization balancing inventory levels, freight costs, and shipment minimization.</p>
        </div>
      </div>

      <div className="grid-3" style={{ alignItems: 'start' }}>
        {/* Allocation Configuration Input */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 className="section-title">Order Allocation Parameters</h3>

          <div className="input-group">
            <label className="input-label">Product to Allocate</label>
            <select
              className="select-field"
              value={selectedProduct.id}
              onChange={(e) => setSelectedProduct(MOCK_PRODUCTS.find(p => p.id === e.target.value) || MOCK_PRODUCTS[0])}
            >
              {MOCK_PRODUCTS.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Order Quantity (Units)</label>
            <input
              type="number"
              min="1"
              max="500"
              className="input-field"
              value={orderQuantity}
              onChange={(e) => setOrderQuantity(Number(e.target.value))}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Customer Shipping Destination</label>
            <select
              className="select-field"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            >
              <option value="New York, NY (East)">New York, NY (East Coast Zone)</option>
              <option value="San Francisco, CA (West)">San Francisco, CA (West Coast Zone)</option>
              <option value="Chicago, IL (Midwest)">Chicago, IL (Midwest Zone)</option>
            </select>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: 'var(--radius-md)', border: 'var(--glass-border)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Optimization Objective:</span>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', marginTop: '4px' }}>
              Min Freight Cost + Minimal Split Shipments
            </div>
          </div>
        </div>

        {/* Allocation Result (2 columns) */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <div className="flex-gap-2">
                <Boxes size={20} color="var(--primary)" />
                <h3 className="section-title" style={{ margin: 0 }}>Optimal Warehouse Split Plan</h3>
              </div>
              <span className="badge badge-approved">Optimal Solved</span>
            </div>

            <div className="table-container" style={{ marginBottom: '16px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Warehouse Source</th>
                    <th>Allocated Qty</th>
                    <th>Est. Shipping Cost</th>
                    <th>Routing Decision Logic</th>
                  </tr>
                </thead>
                <tbody>
                  {allocationResult.map((res, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700 }}>{res.warehouse}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{res.allocated} Units</td>
                      <td>{formatCurrency(res.shippingCost)}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{res.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex-between" style={{ background: 'var(--bg-elevated)', padding: '14px 20px', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Calculated Freight:</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{formatCurrency(totalFreight)}</div>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => alert(`Allocated ${orderQuantity} units successfully across ${allocationResult.length} warehouse(s)!`)}
              >
                <CheckCircle2 size={16} />
                <span>Confirm & Lock Allocation</span>
              </button>
            </div>
          </div>

          {/* Current Real-time Warehouse Inventory Levels */}
          <div className="card">
            <h3 className="section-title">Network Warehouse Stock Availability</h3>
            <div className="grid-3" style={{ marginTop: '12px' }}>
              {MOCK_WAREHOUSES.map(wh => (
                <div key={wh.id} style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: 'var(--radius-md)', border: 'var(--glass-border)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{wh.id}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', margin: '4px 0' }}>{wh.name}</div>
                  <div className="flex-between" style={{ marginTop: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>In Stock:</span>
                    <strong style={{ color: '#10b981' }}>{wh.stock} units</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
