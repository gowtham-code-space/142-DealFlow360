import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MetricCard from '../../components/common/MetricCard';
import StatusBadge from '../../components/common/StatusBadge';
import { api } from '../../services/api';
import { MOCK_QUOTATIONS } from '../../utils/constants';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { ShieldCheck, Truck, FileSpreadsheet, Award, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

export default function CustomerPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPortalData() {
      setLoading(true);
      const res = await api.getQuotations();
      if (res.success && Array.isArray(res.data)) {
        // Filter quotes for the authenticated user if applicable
        const companyName = user?.name?.includes('(') ? user.name.split('(')[1].replace(')', '') : 'Corporate Account';
        const userQuotes = res.data.filter(q =>
          q.customerId === 'CUST-002' || (q.customerName && q.customerName.includes(companyName))
        );
        setQuotes(userQuotes.length > 0 ? userQuotes : res.data);
      } else {
        setQuotes(MOCK_QUOTATIONS);
      }

      const recRes = await api.getRecommendations('CUST-002');
      if (recRes.success && Array.isArray(recRes.data)) {
        setRecommendations(recRes.data);
      }
      setLoading(false);
    }
    loadPortalData();
  }, []);

  const activeQuotesCount = quotes.filter(q => q.status === 'PENDING_APPROVAL' || q.status === 'CUSTOMER_NEGOTIATION' || q.status === 'APPROVED').length;
  const totalVolume = quotes.reduce((acc, q) => acc + Number(q.totalValue || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Executive Welcome Header */}
      <div className="card" style={{ padding: '20px', background: '#fff', borderLeft: '4px solid #059669' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 className="page-title" style={{ margin: 0, fontSize: '1.4rem' }}>
                Welcome back, {user?.name?.split(' (')[0] || 'Customer'}
              </h1>
              <span className="badge badge-gold" style={{ background: 'rgba(5, 150, 105, 0.1)', color: '#059669', border: '1px solid rgba(5, 150, 105, 0.25)' }}>
                {user?.name?.includes('(') ? user.name.split('(')[1].replace(')', '') : 'Corporate Account'} • Customer Portal
              </span>
            </div>
            <p className="page-subtitle" style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>
              Customer Procurement Command Center • Track active quotes, order fulfillment, SLA support, and account billing.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="btn btn-outline" onClick={() => navigate('/portal/quotes')} style={{ gap: 6 }}>
              <MS icon="request_quote" size={18} />
              <span>View All Quotes ({quotes.length})</span>
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/portal/orders')} style={{ background: '#059669', borderColor: '#059669', gap: 6 }}>
              <MS icon="local_shipping" size={18} />
              <span>Track Orders & Fulfillment</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Procurement Metric Cards */}
      <div className="grid-metrics">
        <MetricCard
          title="Active Proposals & Quotes"
          value={activeQuotesCount}
          change="2 Ready for Review"
          isPositive={true}
          icon={FileSpreadsheet}
          color="#059669"
        />
        <MetricCard
          title="Active Orders In Progress"
          value="3"
          change="1 In Transit (ETA Oct)"
          isPositive={true}
          icon={Truck}
          color="var(--primary)"
        />
        <MetricCard
          title="Total Contract Value"
          value={formatCurrency(totalVolume || 18120000)}
          change="Gold Tier Rate Applied"
          isPositive={true}
          icon={Award}
          color="#7c3aed"
        />
        <MetricCard
          title="Outstanding Payable"
          value="₹0.00"
          change="All Payments Current"
          isPositive={true}
          icon={ShieldCheck}
          color="#10b981"
        />
      </div>

      {/* Main Grid: Left Workspace (2.3fr) vs Right Panel (1fr) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.3fr) minmax(0, 1fr)', gap: '20px' }}>
        
        {/* Left Column: Active Proposals + Hardware Delivery Status + Add-on Recommendations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Active Proposals & Quotes */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--on-surface)' }}>
                  Active Proposals & Quotations
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
                  Review line items, submit counter-offers, or authorize quotes directly
                </span>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/portal/quotes')}>
                View All ({quotes.length})
              </button>
            </div>

            {loading ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--secondary-text)' }}>
                <span className="material-symbols-outlined spin" style={{ fontSize: 24, color: '#059669' }}>sync</span>
                <p style={{ marginTop: 6 }}>Loading quotations...</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Quote Ref</th>
                      <th>Configuration / Description</th>
                      <th>Contract Value</th>
                      <th>Discount</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.map(q => (
                      <tr key={q.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/portal/quotes/${q.id}`)}>
                        <td style={{ fontWeight: 700, color: '#059669' }}>{q.id}</td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>
                            {q.id === 'Q-2026-002' ? 'Enterprise Server Fleet & AI Acceleration' : q.id === 'Q-2026-001' ? 'High-Density Switch & Cloud License Expansion' : 'Enterprise IT Infrastructure'}
                          </div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--outline)' }}>Created: {q.createdDate} • Rep: {q.repName || 'Alex Rivera'}</span>
                        </td>
                        <td style={{ fontWeight: 700, fontFeatureSettings: "'tnum'" }}>{formatCurrency(q.totalValue)}</td>
                        <td style={{ fontWeight: 700, color: '#059669' }}>{formatPercent(q.discountPercent)}</td>
                        <td>
                          <StatusBadge status={q.status} />
                        </td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={(e) => { e.stopPropagation(); navigate(`/portal/quotes/${q.id}`); }}
                            style={{ background: '#059669', borderColor: '#059669', padding: '4px 10px', fontSize: '0.75rem' }}
                          >
                            Review & Order
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Hardware Fulfillment & Active Deliveries */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MS icon="local_shipping" size={20} />
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: 'var(--on-surface)' }}>
                  Hardware Fulfillment & Active Deliveries
                </h3>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/portal/orders')}>
                Track All Orders
              </button>
            </div>

            <div style={{
              padding: '16px', borderRadius: 8, background: 'var(--surface-container-low)',
              border: '1px solid rgba(209,195,202,0.3)', display: 'flex', flexDirection: 'column', gap: 12
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>Order # ORD-2026-0041</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--outline)', marginLeft: 8 }}>(Ref: Q-2026-004)</span>
                </div>
                <span className="badge badge-fulfilled">IN TRANSIT — ETA OCT 12</span>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>
                6x Enterprise Cloud Server X1 • 1x 24/7 Mission Critical Support SLA
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--outline)' }}>
                <span>Dispatched: Midwest Hub (IL)</span>
                <span>Destination: Regional Data Center</span>
                <span>Carrier: FedEx Freight Priority</span>
              </div>
            </div>
          </div>

          {/* Recommended Add-ons for Infrastructure */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <MS icon="auto_awesome" size={20} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--on-surface)' }}>
                Recommended Add-ons for your Infrastructure
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {recommendations.map(rec => (
                <div key={rec.id} style={{
                  padding: '14px', borderRadius: 8, background: '#fff',
                  border: '1px solid rgba(209,195,202,0.4)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className="badge badge-surface" style={{ fontSize: '0.65rem' }}>{rec.category}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#059669' }}>{rec.confidence}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--on-surface)', marginTop: 6 }}>
                      {rec.name}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', margin: '4px 0 8px 0', lineHeight: 1.3 }}>
                      {rec.reason}
                    </p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(209,195,202,0.2)' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--outline)', textDecoration: 'line-through', marginRight: 4 }}>{formatCurrency(rec.listPrice)}</span>
                      <strong style={{ fontSize: '0.88rem', color: '#059669' }}>{formatCurrency(rec.recommendedPrice)}</strong>
                    </div>
                    <button className="btn btn-outline btn-sm" onClick={() => navigate('/portal/quotes')} style={{ padding: '2px 8px', fontSize: '0.72rem' }}>
                      + Add to Quote
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Account Team + Counter-Offer Status + Support & SLA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Panel 1: Dedicated Account Team */}
          <div className="card" style={{ padding: '20px', background: '#fff', borderTop: '4px solid #059669' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--on-surface)' }}>
              Dedicated Account Team
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', background: 'var(--primary)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
                }}>
                  DF
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--on-surface)' }}>DealFlow Account Exec</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>Account Executive</div>
                  <div style={{ fontSize: '0.72rem', color: '#059669' }}>sales@dealflow360.internal</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', background: '#0284c7',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
                }}>
                  OPS
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--on-surface)' }}>DealFlow Fulfillment</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>Fulfillment Lead</div>
                  <div style={{ fontSize: '0.72rem', color: '#0284c7' }}>ops@dealflow360.internal</div>
                </div>
              </div>

              <button
                className="btn btn-outline"
                onClick={() => navigate('/portal/quotes/Q-2026-002')}
                style={{ width: '100%', marginTop: 4, gap: 6, justifyContent: 'center', borderColor: '#059669', color: '#059669' }}
              >
                <MS icon="chat" size={16} />
                <span>Message Account Executive</span>
              </button>
            </div>
          </div>

          {/* Panel 2: Active Counter-Offer Status */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 10px 0', color: 'var(--on-surface)' }}>
              Active Counter-Offer Status
            </h3>

            <div style={{
              padding: '12px', borderRadius: 8, background: 'rgba(234, 179, 8, 0.08)',
              border: '1px solid rgba(234, 179, 8, 0.3)', fontSize: '0.8rem', color: '#a16207'
            }}>
              <div style={{ fontWeight: 700 }}>Q-2026-002 Counter-Offer Sent</div>
              <div style={{ marginTop: 4 }}>Requested: 25% Discount • Net 60 Terms</div>
              <div style={{ fontSize: '0.72rem', marginTop: 4, color: 'var(--secondary-text)' }}>
                Status: Pending Sales Manager Override Review (David K.)
              </div>
            </div>
          </div>

          {/* Panel 3: Support & SLA Status */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--on-surface)' }}>
              Support & SLA Status
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--secondary-text)' }}>Emergency Incident SLA:</span>
                <strong style={{ color: '#059669' }}>15 Min Response</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--secondary-text)' }}>System Uptime Guarantee:</span>
                <strong style={{ color: '#059669' }}>99.99% Operational</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--secondary-text)' }}>Active Support Plan:</span>
                <strong style={{ color: 'var(--primary)' }}>24/7 Mission Critical SLA</strong>
              </div>
            </div>
          </div>

          {/* Panel 4: Recent Portal Activity Log */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--on-surface)' }}>
              Recent Portal Activity
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Clock size={15} color="#059669" style={{ marginTop: 2 }} />
                <div>
                  <span style={{ fontWeight: 600 }}>Counter-offer submitted for Q-2026-002</span>
                  <div style={{ color: 'var(--outline)', fontSize: '0.7rem' }}>Sep 04, 2:32 PM</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <CheckCircle size={15} color="#10b981" style={{ marginTop: 2 }} />
                <div>
                  <span style={{ fontWeight: 600 }}>Order ORD-2026-0041 dispatched</span>
                  <div style={{ color: 'var(--outline)', fontSize: '0.7rem' }}>Sep 03, 11:20 AM</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
