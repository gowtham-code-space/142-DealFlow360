import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MetricCard from '../../components/common/MetricCard';
import { api } from '../../services/api';
import { MOCK_QUOTATIONS, MOCK_WAREHOUSES } from '../../utils/constants';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { Boxes, Truck, RefreshCw, AlertTriangle, ArrowRight, ShieldCheck, CreditCard, Layers, CheckCircle2 } from 'lucide-react';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

export default function OperationsDashboard() {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [qRes, wRes] = await Promise.all([
        api.getQuotations(),
        api.getWarehouses()
      ]);
      if (qRes.success && Array.isArray(qRes.data)) {
        setQuotations(qRes.data);
      } else {
        setQuotations(MOCK_QUOTATIONS);
      }
      if (wRes.success && Array.isArray(wRes.data)) {
        setWarehouses(wRes.data);
      } else {
        setWarehouses(MOCK_WAREHOUSES);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const totalWarehouseUnits = warehouses.reduce((acc, w) => acc + (w.stock || 0), 0);
  const pendingApprovalsCount = quotations.filter(q => q.status === 'PENDING_APPROVAL' || q.financeClearanceStatus === 'PENDING_CLEARANCE').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Finance & Operations Executive Header Bar */}
      <div className="card" style={{ padding: '20px', background: '#fff', borderLeft: '4px solid #0284c7' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 className="page-title" style={{ margin: 0, fontSize: '1.4rem' }}>
                Finance & Operations Operational Dashboard
              </h1>
              <span className="badge" style={{ background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', border: '1px solid rgba(2, 132, 199, 0.25)' }}>
                FINANCE & OPERATIONS
              </span>
            </div>
            <p className="page-subtitle" style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>
              Multi-warehouse stock allocation, financial clearances, fulfillment logistics, and recurring subscription billing execution.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link to="/inventory" className="btn btn-primary" style={{ gap: 6 }}>
              <Boxes size={16} />
              <span>Run Warehouse Allocation</span>
            </Link>
            <Link to="/finance/approvals" className="btn btn-outline" style={{ gap: 6 }}>
              <ShieldCheck size={16} />
              <span>Clearance Queue ({pendingApprovalsCount})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Operational KPI Cards Ribbon */}
      <div className="grid-metrics">
        <MetricCard
          title="Total Network Stock"
          value={`${totalWarehouseUnits || 1370} Units`}
          change="Optimal Multi-Warehouse Stock"
          isPositive={true}
          icon={Boxes}
          color="#06b6d4"
        />
        <MetricCard
          title="Pending Finance Clearance"
          value={pendingApprovalsCount}
          change="Requires Operations Audit"
          isPositive={false}
          icon={AlertTriangle}
          color="#f59e0b"
        />
        <MetricCard
          title="Avg Fulfillment Lead Time"
          value="1.4 Days"
          change="SLA Target: < 2.0 Days"
          isPositive={true}
          icon={Truck}
          color="#0284c7"
        />
        <MetricCard
          title="Monthly Recurring Revenue"
          value={`${formatCurrency(1450000)}/mo`}
          change="+8.2% Subscription Growth"
          isPositive={true}
          icon={RefreshCw}
          color="#7c3aed"
        />
      </div>

      {/* Main Grid: 2 Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.4fr) minmax(0, 1fr)', gap: '20px' }}>
        
        {/* Left Column: Fulfillment & Operational Queue Table & Stock Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Main Operational Queue */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--on-surface)' }}>
                  Order-to-Cash Execution & Fulfillment Queue
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
                  Active quotations progressing through financial clearance, stock allocation, and invoice generation
                </span>
              </div>
              <span className="badge badge-approved">{quotations.length} Active Orders</span>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--secondary-text)' }}>
                <span className="material-symbols-outlined spin" style={{ fontSize: 24, color: '#0284c7' }}>sync</span>
                <p style={{ marginTop: 8 }}>Loading operational queue...</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order Ref</th>
                      <th>Customer</th>
                      <th>Contract Value</th>
                      <th>Financial Clearance</th>
                      <th>Stock Allocation</th>
                      <th>Priority</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotations.map((q, idx) => {
                      const isCleared = q.status === 'APPROVED' || q.status === 'FULFILLED';
                      const isPending = q.status === 'PENDING_APPROVAL';
                      
                      return (
                        <tr key={q.id}>
                          <td style={{ fontWeight: 700, color: '#0284c7' }}>{q.id}</td>
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{q.customerName}</div>
                            <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>{q.tier}</span>
                          </td>
                          <td style={{ fontWeight: 700, fontFeatureSettings: "'tnum'" }}>{formatCurrency(q.totalValue)}</td>
                          <td>
                            <span style={{
                              fontSize: '0.75rem', padding: '3px 8px', borderRadius: 99, fontWeight: 700,
                              background: isCleared ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                              color: isCleared ? '#047857' : '#a16207'
                            }}>
                              {isCleared ? 'CLEARED' : 'PENDING REVIEW'}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              fontSize: '0.75rem', padding: '3px 8px', borderRadius: 99, fontWeight: 600,
                              background: idx % 2 === 0 ? 'rgba(2, 132, 199, 0.1)' : 'rgba(124, 58, 237, 0.1)',
                              color: idx % 2 === 0 ? '#0284c7' : '#7c3aed'
                            }}>
                              {idx % 2 === 0 ? 'Allocated (NJ Hub)' : 'Split Allocated (IL+NJ)'}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: q.totalValue > 8000000 ? '#b91c1c' : '#047857' }}>
                              {q.totalValue > 8000000 ? 'HIGH PRIORITY' : 'NORMAL'}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => navigate('/inventory')}
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            >
                              <span>Manage</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Regional Warehouse Depot Network */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--on-surface)' }}>
                  Regional Warehouse Stock Network
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
                  Real-time stock availability and freight multipliers across fulfillment depots
                </span>
              </div>
              <Link to="/inventory" className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }}>
                <span>Run Full Optimization</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid-3" style={{ gap: 14 }}>
              {warehouses.map(wh => (
                <div key={wh.id} style={{
                  padding: '14px', borderRadius: 8, background: 'var(--surface-container-low)',
                  border: '1px solid rgba(209,195,202,0.3)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7' }}>{wh.id}</span>
                    <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: 4, background: 'rgba(16, 185, 129, 0.1)', color: '#047857', fontWeight: 700 }}>
                      ONLINE
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--on-surface)' }}>{wh.name}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8, fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Available Stock:</span>
                      <strong style={{ color: '#059669' }}>{wh.stock} Units</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Freight Rate:</span>
                      <strong style={{ color: 'var(--on-surface)' }}>{wh.shippingCostRate}x multiplier</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Exception Cards & Billing Overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Active Operational Exceptions */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--on-surface)' }}>
              Operational Exceptions & Alerts
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{
                padding: '12px', borderRadius: 8, background: 'rgba(234, 179, 8, 0.08)',
                border: '1px solid rgba(234, 179, 8, 0.25)', fontSize: '0.8rem'
              }}>
                <div style={{ fontWeight: 700, color: '#a16207', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlertTriangle size={14} />
                  <span>Pending Finance Clearance</span>
                </div>
                <div style={{ color: 'var(--on-surface)', marginTop: 4 }}>
                  Quotation #Q-2026-001 (Nexus HyperScale) requires credit limit re-evaluation.
                </div>
              </div>

              <div style={{
                padding: '12px', borderRadius: 8, background: 'var(--surface-container-low)',
                border: '1px solid rgba(209,195,202,0.3)', fontSize: '0.8rem'
              }}>
                <div style={{ fontWeight: 700, color: '#0284c7', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={14} />
                  <span>Fulfillment Allocation Optimal</span>
                </div>
                <div style={{ color: 'var(--secondary-text)', marginTop: 4 }}>
                  Order #Q-2026-004 allocated with 0 backorders across Midwest and East depots.
                </div>
              </div>
            </div>
          </div>

          {/* Quick Billing Shortcuts */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--on-surface)' }}>
              Finance & Billing Operations
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to="/billing" className="btn btn-outline" style={{ justifyContent: 'flex-start', fontSize: '0.85rem' }}>
                <CreditCard size={16} color="#7c3aed" />
                <span>View Billing & Invoices</span>
              </Link>
              <Link to="/inventory" className="btn btn-outline" style={{ justifyContent: 'flex-start', fontSize: '0.85rem' }}>
                <Boxes size={16} color="#06b6d4" />
                <span>Multi-Warehouse Allocation Engine</span>
              </Link>
              <Link to="/finance/approvals" className="btn btn-outline" style={{ justifyContent: 'flex-start', fontSize: '0.85rem' }}>
                <ShieldCheck size={16} color="#00696e" />
                <span>Financial Clearance Workspace</span>
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
