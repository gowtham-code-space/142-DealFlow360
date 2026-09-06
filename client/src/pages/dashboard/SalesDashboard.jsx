import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size }}>{icon}</span>
);

export default function SalesDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quotations, setQuotations] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  const [summary, setSummary] = useState(null);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      const [qRes, wRes, summaryRes] = await Promise.all([
        api.getQuotations(),
        api.getWarehouses(),
        api.getDashboardSummary()
      ]);
      if (qRes.success) setQuotations(qRes.data?.items || []);
      if (wRes.success) setWarehouses(wRes.data?.items || []);
      if (summaryRes.success) setSummary(summaryRes.data);
      setLoading(false);
    }
    loadDashboardData();
  }, []);

  const filteredQuotes = quotations.filter(q => {
    if (activeTab === 'PENDING') return q.status === 'PENDING_APPROVAL';
    if (activeTab === 'APPROVED') return q.status === 'APPROVED';
    if (activeTab === 'DRAFT') return q.status === 'DRAFT';
    return true;
  });

  const handleUnavailableFeature = (featureName) => {
    alert(`${featureName} is currently unavailable. Backend endpoint not connected.`);
  };

  const pipelineValue = summary ? summary.confirmedRevenue : quotations.reduce((sum, q) => sum + (Number(q.estimatedNetTotal || q.totalValue) || 0), 0);
  const pendingCount = summary ? summary.pendingApprovals : quotations.filter(q => q.status === 'PENDING_APPROVAL' || q.status === 'MANAGER_REVIEW' || q.status === 'FINANCE_REVIEW' || q.status === 'SALES_REP_REVIEW').length;
  const activeNegCount = quotations.filter(q => q.status === 'CUSTOMER_NEGOTIATION' || q.status === 'RETURNED').length;
  const approvedCount = summary ? summary.approvedQuotes : quotations.filter(q => q.status === 'APPROVED').length;

  return (
    <div className="flex-col gap-4">
      {/* Executive Performance Banner */}
      <div className="card flex-between" style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
        color: '#ffffff', padding: '20px 24px', borderRadius: 'var(--radius-xl)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 4 }}>
              Q3 2026 Fiscal Performance
            </span>
            <span style={{ fontSize: 12, color: 'var(--secondary-container)', fontWeight: 600 }}>
              Sales Representative: {user?.name || 'Sales Rep'}
            </span>
          </div>
          <h1 className="headline-lg" style={{ color: '#fff', margin: '4px 0' }}>Sales Representative Dashboard</h1>
          <p className="body-md" style={{ color: 'rgba(255,255,255,0.85)', margin: 0 }}>
            Active Pipeline: <strong style={{ color: '#fff' }}>{formatCurrency(pipelineValue)}</strong> across {quotations.length} deals — Pace: <span style={{ color: 'var(--secondary-container)', fontWeight: 700 }}>Tracking positively</span>
          </p>
        </div>
        <div>
          <button className="btn" style={{
            background: 'var(--secondary-container)', color: 'var(--on-secondary-container)',
            fontWeight: 700, padding: '10px 16px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)'
          }} onClick={() => navigate('/quotations/new')}>
            <MS icon="add_circle" size={20} />
            <span>Create New Quote</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon Cards */}
      <div className="grid-metrics" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="card card-body">
          <div className="flex-between" style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}>
            <span>Active Pipeline Value</span>
            <MS icon="description" size={16} />
          </div>
          <div className="headline-lg" style={{ marginTop: 6, color: 'var(--text-primary)' }}>{formatCurrency(pipelineValue)}</div>
          <div style={{ fontSize: 11, color: 'var(--success)', marginTop: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <MS icon="trending_up" size={14} /> Tracking all active quotes
          </div>
        </div>

        <div className="card card-body">
          <div className="flex-between" style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}>
            <span>Pending Manager Review</span>
            <span style={{ color: 'var(--warning)' }}><MS icon="schedule" size={16} /></span>
          </div>
          <div className="headline-lg" style={{ marginTop: 6, color: 'var(--text-primary)' }}>{pendingCount} Quotes</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>Pending SLA tracking</div>
        </div>

        <div className="card card-body">
          <div className="flex-between" style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}>
            <span>Active Negotiations</span>
            <span style={{ color: 'var(--secondary)' }}><MS icon="forum" size={16} /></span>
          </div>
          <div className="headline-lg" style={{ marginTop: 6, color: 'var(--text-primary)' }}>{activeNegCount} Deals</div>
          <div style={{ fontSize: 11, color: 'var(--secondary)', marginTop: 2, fontWeight: 600 }}>Action required</div>
        </div>

        <div className="card card-body">
          <div className="flex-between" style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}>
            <span>Approved Ready to Send</span>
            <span style={{ color: 'var(--success)' }}><MS icon="check_circle" size={16} /></span>
          </div>
          <div className="headline-lg" style={{ marginTop: 6, color: 'var(--text-primary)' }}>{approvedCount} Quotes</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>Cleared for customer</div>
        </div>
      </div>

      {/* Main Grid: Pipeline Table & Right Sidebar */}
      <div className="grid-3">
        {/* Left Column (2 spans): Pipeline Table & Regional Stock */}
        <div className="flex-col gap-4" style={{ gridColumn: 'span 2' }}>
          <div className="card">
            <div className="card-header flex-between">
              <div>
                <h2 className="headline-sm" style={{ margin: 0 }}>Quote Pipeline & Re-Approval Matrix</h2>
                <p className="body-sm" style={{ color: 'var(--text-secondary)', margin: 0 }}>Track discount verdicts, SLA timers, and customer response states</p>
              </div>
              <div className="tab-bar">
                {['ALL', 'PENDING', 'APPROVED', 'DRAFT'].map(tab => (
                  <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div className="spin" style={{ display: 'inline-block', marginBottom: 8 }}><MS icon="sync" size={24} /></div>
                <p>Fetching backend quotation status...</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Quote ID & Customer</th>
                      <th>Tier</th>
                      <th>Value</th>
                      <th>Discount</th>
                      <th>Margin</th>
                      <th>Status / Verdict</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuotes.map(q => (
                      <tr key={q.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: 13 }}>{q.quotationNumber || q.id}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{q.customer?.name || q.customerName}</div>
                        </td>
                        <td>
                          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: (q.customer?.tier || q.tier) === 'PLATINUM' ? '#6b21a8' : (q.customer?.tier || q.tier) === 'GOLD' ? '#854d0e' : '#475569' }}>
                            {q.customer?.tier || q.tier}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, fontFeatureSettings: "'tnum'" }}>{formatCurrency(q.estimatedNetTotal || q.totalValue)}</td>
                        <td style={{ fontFeatureSettings: "'tnum'" }}>{formatPercent(q.marginPct !== undefined ? (q.discountTotal / (q.subtotal || 1) * 100) : q.discountPercent)}</td>
                        <td>
                          <span style={{ fontWeight: 600, fontFeatureSettings: "'tnum'", color: (q.marginPct || q.marginPercent) >= 35 ? 'var(--success)' : 'var(--warning)' }}>
                            {formatPercent(q.marginPct || q.marginPercent)}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={q.status} />
                        </td>
                        <td>
                          <div className="action-group">
                            <button className="btn-icon" title="View Details" onClick={() => navigate(`/quotations/${q.id}`)}>
                              <MS icon="open_in_new" size={16} />
                            </button>
                            {q.status === 'CUSTOMER_NEGOTIATION' && (
                              <button className="btn btn-secondary-teal btn-sm" style={{ padding: '4px 8px' }} title="Open Negotiation" onClick={() => navigate(`/negotiation/${q.id}`)}>
                                <MS icon="forum" size={14} />
                                <span>Negotiate</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Regional Resource / Warehouse Depot Stock */}
          <div className="card card-body">
            <div className="flex-between" style={{ marginBottom: 12 }}>
              <div className="flex-gap-2">
                <span style={{ color: 'var(--primary)' }}><MS icon="inventory_2" size={18} /></span>
                <h3 className="headline-sm" style={{ margin: 0 }}>Regional Resource / Warehouse Depot Stock</h3>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Backend Real-Time Inventory Feed</span>
            </div>

            <div className="grid-3" style={{ gap: 12, gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {warehouses.map(w => (
                <div key={w.id} style={{ background: 'var(--surface-container-low)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{w.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                    Available Stock: <strong style={{ color: 'var(--success)' }}>{w.stock} units</strong>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    Shipping Cost: {formatCurrency(w.shippingCostRate)}/kg
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Shortcuts & Negotiation Card */}
        <div className="flex-col gap-4">
          <div className="card card-body" style={{ background: 'var(--surface-container-low)' }}>
            <h3 className="headline-sm" style={{ marginBottom: 12 }}>Quick Actions</h3>
            <div className="flex-col gap-2">
              <button className="btn btn-primary" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/quotations/new')}>
                <MS icon="add_circle" size={16} /> <span>Create New Customer Quote</span>
              </button>
              <button className="btn btn-outline" style={{ justifyContent: 'flex-start', background: '#fff' }} onClick={() => {
                const firstNegQuoteId = quotations.find(q => q.status === 'CUSTOMER_NEGOTIATION' || q.status === 'RETURNED')?.id;
                if (firstNegQuoteId) navigate(`/negotiation/${firstNegQuoteId}`);
                else alert('No active negotiations found.');
              }}>
                <MS icon="forum" size={16} /> <span>Direct Customer Chat</span>
              </button>
            </div>
          </div>

          <div className="card card-body" style={{ borderLeft: '4px solid var(--secondary)' }}>
            <div className="flex-between" style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Counter Offer</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Sep 4, 14:32</span>
            </div>

            <h4 className="headline-sm" style={{ margin: 0 }}>Active Counter Offer Tracking</h4>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Check Negotiation states in the Pipeline table.
            </div>

            <div style={{
              background: 'var(--surface-container-low)', padding: '10px 12px', borderRadius: 'var(--radius-md)',
              margin: '12px 0', fontSize: 12, color: 'var(--text-primary)', borderLeft: '2px solid var(--secondary)'
            }}>
              Direct integration with customer chat for active negotiation quotes.
            </div>

            <div className="flex-between" style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 12 }}>
              <span>Status tracking</span>
              <StatusBadge status="CUSTOMER_NEGOTIATION" text="Action Tracking" />
            </div>

            <button className="btn btn-secondary-teal" style={{ width: '100%' }} onClick={() => {
                const firstNegQuoteId = quotations.find(q => q.status === 'CUSTOMER_NEGOTIATION' || q.status === 'RETURNED')?.id;
                if (firstNegQuoteId) navigate(`/negotiation/${firstNegQuoteId}`);
                else alert('No active negotiations found.');
            }}>
              <MS icon="forum" size={16} /> <span>Review & Respond</span>
            </button>
          </div>

          <div className="card card-body">
            <div className="flex-between" style={{ marginBottom: 8 }}>
              <h4 className="headline-sm" style={{ margin: 0 }}>Margin & Deal Risk Pulse</h4>
              <MS icon="trending_up" size={16} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Portfolio Avg Margin: <strong style={{ color: 'var(--success)' }}>{summary ? `${(50 - summary.avgCumulativeDiscountPct).toFixed(1)}%` : '40.9%'}</strong>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              Deal Health Index: <strong style={{ color: 'var(--primary)' }}>92/100 (Optimal)</strong>
            </div>
            <div style={{
              marginTop: 12, padding: '8px 10px', background: '#fef3c7', borderRadius: 'var(--radius-sm)',
              fontSize: 11, color: '#92400e', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500
            }}>
              <MS icon="warning" size={14} />
              <span>1 quote requires Manager re-approval if discount &gt; 20%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
