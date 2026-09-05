import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MetricCard from '../../components/common/MetricCard';
import Modal from '../../components/common/Modal';
import { api } from '../../services/api';
import { MOCK_QUOTATIONS } from '../../utils/constants';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { ShieldAlert, CheckCircle, XCircle, FileSpreadsheet, Eye, TrendingUp } from 'lucide-react';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');

  // Modal Decision State
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [modalType, setModalType] = useState(null); // 'approve' | 'reject' | 'return'
  const [managerNote, setManagerNote] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.getQuotations();
      if (res.success && Array.isArray(res.data)) {
        setQuotes(res.data);
      } else {
        // Handle API error or offline mode safely
        setQuotes(MOCK_QUOTATIONS);
        if (res.error) {
          console.info('[Manager Dashboard] API returned status error, utilizing structured fallback dataset:', res.error);
        }
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleAction = (e, quote, type) => {
    e.stopPropagation();
    setSelectedQuote(quote);
    setModalType(type);
    setManagerNote('');
  };

  const submitDecision = () => {
    if (!selectedQuote) return;
    setQuotes(quotes.map(q => {
      if (q.id === selectedQuote.id) {
        return {
          ...q,
          status: modalType === 'approve' ? 'APPROVED' : modalType === 'reject' ? 'REJECTED' : 'CUSTOMER_NEGOTIATION',
          requiresApprovalReason: `Decision by Sales Manager (David K.): ${managerNote || (modalType === 'approve' ? 'Approved discount exception' : modalType === 'reject' ? 'Discount rejected' : 'Returned for revision')}`
        };
      }
      return q;
    }));
    setSelectedQuote(null);
    setModalType(null);
    setManagerNote('');
  };

  // Filtered pending quotes
  const pendingQuotes = quotes.filter(q => {
    const matchesStatus = q.status === 'PENDING_APPROVAL' || q.status === 'CUSTOMER_NEGOTIATION';
    const matchesSearch = !searchTerm || 
      q.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.customerName && q.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (q.repName && q.repName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRisk = riskFilter === 'ALL' || q.riskScore === riskFilter;
    return matchesStatus && matchesSearch && matchesRisk;
  });

  const totalValueUnderReview = pendingQuotes.reduce((acc, q) => acc + Number(q.totalValue || 0), 0);
  const urgentCount = pendingQuotes.filter(q => q.discountPercent > 20 || q.riskScore === 'HIGH').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Operational Executive Header Bar */}
      <div className="card" style={{ padding: '20px', background: '#fff', borderLeft: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 className="page-title" style={{ margin: 0, fontSize: '1.4rem' }}>
                Sales Manager Operational Dashboard
              </h1>
              <span className="badge badge-pending">Enterprise Governance</span>
            </div>
            <p className="page-subtitle" style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>
              Real-time discount policy governance, risk monitoring, SLA compliance, and deal approval workflow.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-primary" onClick={() => navigate('/approvals')} style={{ gap: 6 }}>
              <MS icon="fact_check" size={18} />
              <span>Open Approval Queue ({pendingQuotes.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Operational Metric KPI Cards */}
      <div className="grid-metrics">
        <MetricCard
          title="Pending Approvals"
          value={pendingQuotes.length}
          change={`${urgentCount} Urgent SLA`}
          isPositive={false}
          icon={ShieldAlert}
          color="#f59e0b"
        />
        <MetricCard
          title="Value Under Review"
          value={formatCurrency(totalValueUnderReview)}
          change="INR Contract Volume"
          isPositive={true}
          icon={TrendingUp}
          color="var(--primary)"
        />
        <MetricCard
          title="Avg Discount Exception"
          value="21.4%"
          change="+3.4% above tier cap"
          isPositive={false}
          icon={FileSpreadsheet}
          color="#ef4444"
        />
        <MetricCard
          title="Approvals Completed (WTD)"
          value="14"
          change="92% within 4h SLA"
          isPositive={true}
          icon={CheckCircle}
          color="#10b981"
        />
      </div>

      {/* Main Content Multi-Column Layout (Stitch Composition) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.3fr) minmax(0, 1fr)', gap: '20px' }}>
        
        {/* Left Column: Approval / Quote Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--on-surface)' }}>
                  High-Discount & Risk Approval Queue
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
                  Automated rule triggers requiring sales management override
                </span>
              </div>

              {/* Filter Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="text"
                  placeholder="Filter quote or customer..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{
                    padding: '4px 10px', borderRadius: 6,
                    border: '1px solid rgba(209,195,202,0.4)', fontSize: '0.8rem', outline: 'none'
                  }}
                />

                <select
                  value={riskFilter}
                  onChange={e => setRiskFilter(e.target.value)}
                  style={{
                    padding: '4px 8px', borderRadius: 6,
                    border: '1px solid rgba(209,195,202,0.4)', fontSize: '0.8rem', background: '#fff'
                  }}
                >
                  <option value="ALL">All Risk Levels</option>
                  <option value="HIGH">High Risk</option>
                  <option value="MEDIUM">Medium Risk</option>
                  <option value="LOW">Low Risk</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--secondary-text)' }}>
                <span className="material-symbols-outlined spin" style={{ fontSize: 24, color: 'var(--primary)' }}>sync</span>
                <p style={{ marginTop: 8 }}>Loading manager approval queue...</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Quote ID</th>
                      <th>Customer & Tier</th>
                      <th>Sales Rep</th>
                      <th>Requested Discount</th>
                      <th>Contract Value</th>
                      <th>Gross Margin</th>
                      <th>Risk / Trigger</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingQuotes.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--secondary-text)' }}>
                          ✅ All pending approvals in queue are processed!
                        </td>
                      </tr>
                    ) : (
                      pendingQuotes.map(q => {
                        const isHighRisk = q.discountPercent > 20 || q.riskScore === 'HIGH';
                        return (
                          <tr
                            key={q.id}
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate(`/manager/approvals/${q.id}`)}
                          >
                            <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{q.id}</td>
                            <td>
                              <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{q.customerName}</div>
                              <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>{q.tier}</span>
                            </td>
                            <td style={{ fontSize: '0.85rem' }}>{q.repName || 'Alex Rivera'}</td>
                            <td style={{ color: isHighRisk ? '#b91c1c' : 'inherit', fontWeight: 700 }}>
                              {formatPercent(q.discountPercent)}
                            </td>
                            <td style={{ fontWeight: 700, fontFeatureSettings: "'tnum'" }}>{formatCurrency(q.totalValue)}</td>
                            <td style={{ color: q.marginPercent >= 35 ? '#059669' : '#d97706', fontWeight: 600 }}>
                              {formatPercent(q.marginPercent)}
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: isHighRisk ? '#b91c1c' : '#d97706', fontWeight: 600 }}>
                                <MS icon={isHighRisk ? "warning" : "info"} size={14} />
                                <span>{q.requiresApprovalReason || 'Exceeds Tier Policy Cap'}</span>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={e => e.stopPropagation()}>
                                <button
                                  onClick={(e) => handleAction(e, q, 'approve')}
                                  className="btn btn-success btn-sm"
                                  style={{ padding: '4px 8px', fontSize: '0.75rem', gap: 2 }}
                                >
                                  <CheckCircle size={13} />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={(e) => handleAction(e, q, 'reject')}
                                  className="btn btn-danger btn-sm"
                                  style={{ padding: '4px 8px', fontSize: '0.75rem', gap: 2 }}
                                >
                                  <XCircle size={13} />
                                  <span>Reject</span>
                                </button>
                                <button
                                  onClick={() => navigate(`/manager/approvals/${q.id}`)}
                                  className="btn btn-outline btn-sm"
                                  style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                >
                                  <Eye size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Multi-Column Operational Panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Panel 1: Urgent SLA & High Risk Alerts */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <MS icon="hourglass_top" size={20} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--on-surface)' }}>
                Urgent SLA & High Risk Queue
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{
                padding: '12px', borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#b91c1c' }}>Q-2026-001</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: 4, background: '#fee2e2', color: '#b91c1c', fontWeight: 700 }}>
                    1h 45m SLA Left
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--on-surface)', marginTop: 4, fontWeight: 600 }}>Nexus HyperScale Ltd</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', marginTop: 2 }}>Discount: 22.0% • Value: {formatCurrency(6760000)}</div>
              </div>

              <div style={{
                padding: '12px', borderRadius: '8px',
                background: 'var(--surface-container-low)', border: '1px solid rgba(209,195,202,0.3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>Q-2026-002</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: 4, background: 'var(--surface-container-high)', color: 'var(--secondary-text)', fontWeight: 600 }}>
                    3h 10m SLA
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--on-surface)', marginTop: 4, fontWeight: 600 }}>Apex Global Technologies</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', marginTop: 2 }}>Discount: 18.0% • Value: {formatCurrency(11360000)}</div>
              </div>
            </div>
          </div>

          {/* Panel 2: Risk & Margin Distribution Pulse */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--on-surface)' }}>
              Risk & Margin Distribution
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.8rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: 'var(--secondary-text)' }}>Healthy Margin (&ge;35%)</span>
                  <strong style={{ color: '#059669' }}>75% of deals</strong>
                </div>
                <div style={{ height: 6, background: 'var(--surface-container-highest)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: '75%', height: '100%', background: '#059669', borderRadius: 99 }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: 'var(--secondary-text)' }}>Tier Cap Breaches (&gt;20%)</span>
                  <strong style={{ color: '#d97706' }}>25% of deals</strong>
                </div>
                <div style={{ height: 6, background: 'var(--surface-container-highest)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: '25%', height: '100%', background: '#d97706', borderRadius: 99 }} />
                </div>
              </div>
            </div>
          </div>

          {/* Panel 3: Recent Workflow Audit Trail */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--on-surface)' }}>
              Manager Decision Activity Log
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <MS icon="check_circle" size={16} />
                <div>
                  <span style={{ fontWeight: 600 }}>Approved Q-2026-003</span>
                  <div style={{ color: 'var(--outline)' }}>Vanguard Retail • {formatCurrency(2272000)} • 2h ago</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <MS icon="lock_clock" size={16} />
                <div>
                  <span style={{ fontWeight: 600 }}>Policy Lock Enforced Q-2026-004</span>
                  <div style={{ color: 'var(--outline)' }}>Quantum Cloud • Fulfilled • Yesterday</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Decision Modal Dialog */}
      <Modal
        isOpen={Boolean(selectedQuote)}
        onClose={() => setSelectedQuote(null)}
        title={
          modalType === 'approve' ? `Approve Exception: ${selectedQuote?.id}` :
          modalType === 'reject' ? `Reject Exception: ${selectedQuote?.id}` :
          `Request Revision: ${selectedQuote?.id}`
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'var(--surface-container-low)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(209,195,202,0.3)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--secondary-text)' }}>Customer: <strong>{selectedQuote?.customerName}</strong></div>
            <div style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', marginTop: '4px' }}>
              Requested Discount: <strong style={{ color: '#b91c1c' }}>{selectedQuote?.discountPercent}%</strong> (Tier Limit: 20%)
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', marginTop: '4px' }}>
              Deal Margin: <strong style={{ color: '#059669' }}>{selectedQuote?.marginPercent}%</strong>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" style={{ fontWeight: 600 }}>Manager Governance Rationale / Audit Note</label>
            <textarea
              rows="3"
              className="textarea-field"
              placeholder={
                modalType === 'approve' ? 'E.g., Approved due to strategic multi-year commitment and upfront payment terms.' :
                modalType === 'reject' ? 'E.g., Discount is excessive given minimum 35% margin threshold.' :
                'E.g., Please reduce discount to 18%.'
              }
              value={managerNote}
              onChange={(e) => setManagerNote(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
            <button className="btn btn-outline" onClick={() => setSelectedQuote(null)}>Cancel</button>
            <button
              className={`btn ${modalType === 'approve' ? 'btn-success' : 'btn-danger'}`}
              style={{
                background: modalType === 'approve' ? '#10b981' : '#b91c1c',
                borderColor: modalType === 'approve' ? '#10b981' : '#b91c1c'
              }}
              onClick={submitDecision}
            >
              {modalType === 'approve' ? 'Confirm Approval & Audit Log' : 'Confirm Rejection'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
