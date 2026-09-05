import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MetricCard from '../../components/common/MetricCard';
import Modal from '../../components/common/Modal';
import { api } from '../../services/api';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { ShieldAlert, CheckCircle, XCircle, FileSpreadsheet, Eye, TrendingUp } from 'lucide-react';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

// Normalize a Prisma quotation record to a flat display shape
function normalizeQuote(q) {
  return {
    ...q,
    displayId: q.quotationNumber || q.id,
    customerName: q.customer?.name || q.customerName || '—',
    repName: q.rep?.name || q.repName || '—',
    tier: q.customer?.tier || q.tier || 'STANDARD',
    totalValue: Number(q.estimatedNetTotal || q.confirmedNetTotal || q.subtotal || q.totalValue || 0),
    discountPercent: Number(q.discountTotal || q.discountPercent || 0),
    marginPercent: Number(q.marginPct || q.marginPercent || 0),
  };
}

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');

  // Modal Decision State
  const [selectedApproval, setSelectedApproval] = useState(null); // approval record
  const [modalType, setModalType] = useState(null); // 'approve' | 'reject' | 'return'
  const [managerNote, setManagerNote] = useState('');
  const [actionError, setActionError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [quotesRes, approvalsRes, summaryRes] = await Promise.all([
        api.getQuotations({ pageSize: 100 }),
        api.getApprovals({ pageSize: 100 }),
        api.getDashboardSummary()
      ]);

      if (quotesRes.success && Array.isArray(quotesRes.data)) {
        setQuotes(quotesRes.data.map(normalizeQuote));
      }
      if (approvalsRes.success && Array.isArray(approvalsRes.data)) {
        setApprovals(approvalsRes.data);
      }
      if (summaryRes.success && summaryRes.data) {
        setSummaryData(summaryRes.data);
      }
    } catch (err) {
      setErrorMsg('Failed to load live data from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = (e, approval, type) => {
    e.stopPropagation();
    setSelectedApproval(approval);
    setModalType(type);
    setManagerNote('');
    setActionError(null);
  };

  const submitDecision = async () => {
    if (!selectedApproval) return;
    setActionError(null);
    try {
      let res;
      if (modalType === 'approve') {
        res = await api.approveQuote(selectedApproval.id, managerNote);
      } else if (modalType === 'reject') {
        res = await api.rejectQuote(selectedApproval.id, managerNote);
      } else {
        res = await api.returnQuote(selectedApproval.id, managerNote);
      }

      if (res && res.success === false) {
        setActionError(res.error || `Failed to process ${modalType} action.`);
        return;
      }
    } catch (e) {
      setActionError(e.message);
      return;
    } finally {
      setSelectedApproval(null);
      setModalType(null);
      setManagerNote('');
      await loadData();
    }
  };

  // Pending approvals from Approval records (status = PENDING, stage = SALES_MANAGER)
  const pendingApprovals = approvals.filter(a => a.status === 'PENDING');

  // Quotes pending approval (for search/filter display in table)
  const pendingQuotes = quotes.filter(q => {
    const matchesStatus = q.status === 'PENDING_APPROVAL' || q.status === 'MANAGER_REVIEW';
    const matchesSearch = !searchTerm ||
      q.displayId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.repName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'ALL' || q.riskScore === riskFilter;
    return matchesStatus && matchesSearch && matchesRisk;
  });

  // Find the approval record for a given quotation
  const getApprovalForQuote = (quoteId) =>
    approvals.find(a => a.quotationId === quoteId || a.quotation?.id === quoteId);

  const totalValueUnderReview = pendingQuotes.reduce((acc, q) => acc + q.totalValue, 0);
  const urgentCount = pendingQuotes.filter(q => q.discountPercent > 20).length;

  // Dashboard Summary metrics
  const pendingCount = summaryData?.pendingApprovals ?? pendingApprovals.length;
  const approvedCount = summaryData?.approvedQuotes ?? 0;
  const confirmedRevenue = summaryData?.confirmedRevenue ?? 0;

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
              <span>Open Approval Queue ({pendingCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div style={{ padding: '12px 16px', borderRadius: 8, background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', fontSize: '0.9rem' }}>
          {errorMsg}
        </div>
      )}

      {/* Operational Metric KPI Cards — sourced from /dashboard/summary + derived */}
      <div className="grid-metrics">
        <MetricCard
          title="Pending Approvals"
          value={loading ? '—' : pendingCount}
          change={loading ? '...' : `${urgentCount} High Discount`}
          isPositive={false}
          icon={ShieldAlert}
          color="#f59e0b"
        />
        <MetricCard
          title="Confirmed Revenue"
          value={loading ? '—' : formatCurrency(confirmedRevenue)}
          change="Confirmed deals (INR)"
          isPositive={true}
          icon={TrendingUp}
          color="var(--primary)"
        />
        <MetricCard
          title="Avg Discount %"
          value={loading ? '—' : (summaryData?.avgCumulativeDiscountPct != null ? formatPercent(summaryData.avgCumulativeDiscountPct) : '—')}
          change="Portfolio average"
          isPositive={false}
          icon={FileSpreadsheet}
          color="#ef4444"
        />
        <MetricCard
          title="Approved Quotes"
          value={loading ? '—' : approvedCount}
          change={loading ? '...' : `${summaryData?.totalQuotes ?? 0} total in period`}
          isPositive={true}
          icon={CheckCircle}
          color="#10b981"
        />
      </div>

      {/* Main Content Multi-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.3fr) minmax(0, 1fr)', gap: '20px' }}>
        
        {/* Left Column: Pending Approval Queue Table */}
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
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingQuotes.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--secondary-text)' }}>
                          {quotes.length === 0
                            ? 'No quotations found in the database. Create a quote to see it here.'
                            : '✅ All pending approvals in queue are processed!'}
                        </td>
                      </tr>
                    ) : (
                      pendingQuotes.map(q => {
                        const isHighRisk = q.discountPercent > 20;
                        const approval = getApprovalForQuote(q.id);
                        return (
                          <tr
                            key={q.id}
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate(`/manager/approvals/${q.id}`)}
                          >
                            <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{q.displayId}</td>
                            <td>
                              <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{q.customerName}</div>
                              <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>{q.tier}</span>
                            </td>
                            <td style={{ fontSize: '0.85rem' }}>{q.repName}</td>
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
                                <span>{q.requiresApprovalReason || q.status}</span>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={e => e.stopPropagation()}>
                                {approval ? (
                                  <>
                                    <button
                                      onClick={(e) => handleAction(e, approval, 'approve')}
                                      className="btn btn-success btn-sm"
                                      style={{ padding: '4px 8px', fontSize: '0.75rem', gap: 2 }}
                                    >
                                      <CheckCircle size={13} />
                                      <span>Approve</span>
                                    </button>
                                    <button
                                      onClick={(e) => handleAction(e, approval, 'reject')}
                                      className="btn btn-danger btn-sm"
                                      style={{ padding: '4px 8px', fontSize: '0.75rem', gap: 2 }}
                                    >
                                      <XCircle size={13} />
                                      <span>Reject</span>
                                    </button>
                                  </>
                                ) : (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>No approval record</span>
                                )}
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

        {/* Right Column: Summary Panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Panel 1: Queue Summary */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--on-surface)' }}>
              Queue Summary (Live)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid rgba(209,195,202,0.2)' }}>
                <span style={{ color: 'var(--secondary-text)' }}>Pending Approval:</span>
                <strong style={{ color: '#d97706' }}>{loading ? '—' : pendingCount} deals</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid rgba(209,195,202,0.2)' }}>
                <span style={{ color: 'var(--secondary-text)' }}>Approved Quotes:</span>
                <strong style={{ color: '#059669' }}>{loading ? '—' : approvedCount} deals</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid rgba(209,195,202,0.2)' }}>
                <span style={{ color: 'var(--secondary-text)' }}>Confirmed Deals:</span>
                <strong style={{ color: 'var(--primary)' }}>{loading ? '—' : (summaryData?.confirmedQuotes ?? '—')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--secondary-text)' }}>Total Quotes (Period):</span>
                <strong style={{ color: 'var(--on-surface)' }}>{loading ? '—' : (summaryData?.totalQuotes ?? '—')}</strong>
              </div>
            </div>
          </div>

          {/* Panel 2: Risk & Margin Distribution — derived from real data */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--on-surface)' }}>
              Risk & Margin Distribution
            </h3>
            {!loading && quotes.length > 0 ? (() => {
              const healthy = quotes.filter(q => q.marginPercent >= 35).length;
              const breaches = quotes.filter(q => q.discountPercent > 20).length;
              const healthyPct = Math.round((healthy / quotes.length) * 100);
              const breachPct = Math.round((breaches / quotes.length) * 100);
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.8rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: 'var(--secondary-text)' }}>Healthy Margin (≥35%)</span>
                      <strong style={{ color: '#059669' }}>{healthyPct}% of deals</strong>
                    </div>
                    <div style={{ height: 6, background: 'var(--surface-container-highest)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ width: `${healthyPct}%`, height: '100%', background: '#059669', borderRadius: 99 }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: 'var(--secondary-text)' }}>Tier Cap Breaches (&gt;20%)</span>
                      <strong style={{ color: '#d97706' }}>{breachPct}% of deals</strong>
                    </div>
                    <div style={{ height: 6, background: 'var(--surface-container-highest)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ width: `${breachPct}%`, height: '100%', background: '#d97706', borderRadius: 99 }} />
                    </div>
                  </div>
                </div>
              );
            })() : (
              <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', textAlign: 'center', padding: '12px 0' }}>
                {loading ? 'Loading...' : 'No quote data available to compute distribution.'}
              </div>
            )}
          </div>

          {/* Panel 3: Discount Policy Reference (Static UI Reference) */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--on-surface)' }}>
              Discount Governance Policy Caps
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.8rem' }}>
              <div style={{ padding: '8px 10px', borderRadius: 6, background: 'var(--surface-container-low)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Standard Tier Limit:</span>
                <strong style={{ color: 'var(--primary)' }}>≤ 10%</strong>
              </div>
              <div style={{ padding: '8px 10px', borderRadius: 6, background: 'var(--surface-container-low)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Gold Tier Limit:</span>
                <strong style={{ color: 'var(--primary)' }}>≤ 20%</strong>
              </div>
              <div style={{ padding: '8px 10px', borderRadius: 6, background: 'var(--surface-container-low)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Platinum Tier Limit:</span>
                <strong style={{ color: 'var(--primary)' }}>≤ 30%</strong>
              </div>
              <div style={{ padding: '8px 10px', borderRadius: 6, background: 'rgba(239, 68, 68, 0.08)', color: '#b91c1c', display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span>Hard Policy Floor:</span>
                <span>&gt;45% Prohibited</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Decision Modal Dialog */}
      <Modal
        isOpen={Boolean(selectedApproval)}
        onClose={() => { setSelectedApproval(null); setActionError(null); }}
        title={
          modalType === 'approve' ? `Approve Approval: ${selectedApproval?.quotation?.quotationNumber || selectedApproval?.quotationId}` :
          modalType === 'reject' ? `Reject Approval: ${selectedApproval?.quotation?.quotationNumber || selectedApproval?.quotationId}` :
          `Request Revision: ${selectedApproval?.quotation?.quotationNumber || selectedApproval?.quotationId}`
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {actionError && (
            <div style={{ padding: 10, borderRadius: 6, background: '#fee2e2', color: '#b91c1c', fontSize: '0.85rem' }}>
              {actionError}
            </div>
          )}

          <div style={{ background: 'var(--surface-container-low)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(209,195,202,0.3)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--secondary-text)' }}>
              Approval Stage: <strong>{selectedApproval?.stage || '—'}</strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', marginTop: '4px' }}>
              Quote: <strong>{selectedApproval?.quotation?.quotationNumber || selectedApproval?.quotationId || '—'}</strong>
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
            <button className="btn btn-outline" onClick={() => { setSelectedApproval(null); setActionError(null); }}>Cancel</button>
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
