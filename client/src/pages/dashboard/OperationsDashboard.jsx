import React from 'react';
import MetricCard from '../../components/common/MetricCard';
import { MOCK_WAREHOUSES } from '../../utils/constants';
import { Boxes, Truck, RefreshCw, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OperationsDashboard() {
  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Operations & Fulfillment Dashboard</h1>
          <p className="page-subtitle">Multi-warehouse stock allocation, fulfillment logistics, and recurring subscription billing.</p>
        </div>
        <Link to="/inventory" className="btn btn-primary">
          <Boxes size={16} />
          <span>Run Multi-Warehouse Allocation</span>
        </Link>
      </div>

      <div className="grid-metrics">
        <MetricCard
          title="Total Warehouse Inventory"
          value="1,370 Units"
          change="Sufficient Stock"
          isPositive={true}
          icon={Boxes}
          color="#06b6d4"
        />
        <MetricCard
          title="Active Backorders"
          value="0"
          change="100% On-time"
          isPositive={true}
          icon={AlertTriangle}
          color="#10b981"
        />
        <MetricCard
          title="Avg Fulfillment SLA"
          value="1.4 Days"
          change="-0.3 Days"
          isPositive={true}
          icon={Truck}
          color="#6366f1"
        />
        <MetricCard
          title="Recurring MRR Pipeline"
          value="$14,500/mo"
          change="+8.2%"
          isPositive={true}
          icon={RefreshCw}
          color="#a855f7"
        />
      </div>

      {/* Warehouse Status Grid */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        {MOCK_WAREHOUSES.map(wh => (
          <div key={wh.id} className="card">
            <div className="flex-between" style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{wh.id}</span>
              <span className="badge badge-approved">Online</span>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>{wh.name}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div className="flex-between">
                <span>Available Units:</span>
                <strong style={{ color: '#fff' }}>{wh.stock}</strong>
              </div>
              <div className="flex-between">
                <span>Shipping Cost Multiplier:</span>
                <strong style={{ color: 'var(--primary)' }}>{wh.shippingCostRate}x</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fulfillment Pipeline */}
      <div className="card">
        <div className="flex-between" style={{ marginBottom: '16px' }}>
          <h3 className="section-title" style={{ margin: 0 }}>Fulfillment & Delivery Pipeline</h3>
          <Link to="/inventory" className="btn btn-secondary btn-sm">
            <span>Detailed Allocation View</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order / Quote ID</th>
                <th>Customer</th>
                <th>Destination</th>
                <th>Optimal Warehouse Split</th>
                <th>Shipment Strategy</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>Q-2026-004</td>
                <td>Quantum Cloud Logistics</td>
                <td>Chicago, IL</td>
                <td>Midwest Hub (4 units) + East Coast (1 unit)</td>
                <td><span className="badge badge-approved">Min Cost & Min Split</span></td>
                <td><span className="badge badge-fulfilled">Delivered</span></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>Q-2026-003</td>
                <td>Vanguard Retail Systems</td>
                <td>Dallas, TX</td>
                <td>East Coast Distribution (3 units)</td>
                <td><span className="badge badge-approved">Single Shipment</span></td>
                <td><span className="badge badge-pending">Ready for Dispatch</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
