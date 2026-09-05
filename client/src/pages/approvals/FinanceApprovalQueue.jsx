import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MetricCard from '../../components/common/MetricCard';
import Modal from '../../components/common/Modal';
import { api } from '../../services/api';
import { MOCK_QUOTATIONS, MOCK_CUSTOMERS } from '../../utils/constants';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { ShieldAlert, CheckCircle, XCircle, FileSpreadsheet, Eye, CreditCard, Building2, AlertTriangle, Lock } from 'lucide-react';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

export default function FinanceApprovalQueue() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Modal Decision State
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [modalType, setModalType] = useState(null); // 'clear' | 'hold' | 'request'
  const [financeNote, setFinanceNote] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await api.getQuotations();
      if (res.success && Array.isArray(res.data)) {
        setQuotes(res.data);
      } else {
        setQuotes(MOCK_QUOTATIONS);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleAction = (e, quote, type) => {
    e.stopPropagation();
    setSelectedQuote(quote);
    setModalType(type);
    setFinanceNote('');
  };

  const submitDecision = () => {
    if (!selectedQuote) return;
    setQuotes(quotes.map(q => {
      if (q.id === selectedQuote.id) {
        return {
          ...q,
          financeClearanceStatus: modalType === 'clear' ? 'CLEARED' : modalType === 'hold' ? 'CREDIT_HOLD' : 'REVISION_REQUESTED',
          requiresApprovalReason: `Finance & Ops Clearance (${modalType === 'clear' ? 'Cleared by Finance' : modalType === 'hold' ? 'Credit Limit Exceeded Hold' : 'Collateral Requested'}): ${financeNote || 'Processed by Operations'}`
        };
      }
      return q;
    }));
    setSelectedQuote(null);
    setModalType(null);
    setFinanceNote('');
  };

  // Filtered queue items
  const queueItems = quotes.filter(q => {
    const matchesSearch = !searchTerm || 
      q.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.customerName && q.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (q.repName && q.repName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const currentFinanceStatus = q.financeClearanceStatus || (q.discountPercent > 18 ? 'PENDING_CLEARANCE' : 'CLEARED');
    const matchesStatus = statusFilter === 'ALL' || currentFinanceStatus === statusFilter;
    
    const priority = q.discountPercent > 20 || q.totalValue > 8000000 ? 'HIGH' : 'MEDIUM';
    const matchesPriority = priorityFilter === 'ALL' || priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const pendingClearanceCount = quotes.filter(q => (q.financeClearanceStatus || (q.discountPercent > 18 ? 'PENDING_CLEARANCE' : 'CLEARED')) === 'PENDING_CLEARANCE').length;
  const totalExposure = quotes.reduce((acc, q) => acc + Number(q.totalValue || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Finance Operational Header Bar */}
      <div className="card" style={{ padding: '20px', background: '#fff', borderLeft: '4px solid #00696e' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 className="page-title" style={{ margin: 0, fontSize: '1.4rem' }}>
                Finance & Operations Clearance Queue
              </h1>
              <span className="badge" style={{ background: 'rgba(0, 105, 110, 0.1)', color: '#00696e', border: '1px solid rgba(0, 105, 110, 0.25)' }}>
                Financial Clearance Console
              </span>
            </div>
            <p className="page-subtitle" style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>
              Review customer credit risk, payment terms, revenue recognition limits, and issue operational financial clearance.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              fontSize: '0.75rem', padding: '4px 10px', borderRadius: 99,
              background: 'var(--surface-container-low)', border: '1px solid rgba(209,195,202,0.4)',
              color: 'var(--on-surface-variant)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4
            }}>
              <Lock size={14} />
              <span>Credit Ceiling Lock: Active</span>
            </span>
          </div>
        </div>
      </div>

      {/* KPI Metrics Ribbon */}
      <div className="grid-metrics">
        <MetricCard
          title="Pending Financial Clearance"
          value={pendingClearanceCount}
          change="Requires Credit Audit"
          isPositive={false}
          icon={ShieldAlert}
          color="#00696e"
        />
        <MetricCard
          title="Total Contract Exposure"
          value={formatCurrency(totalExposure)}
          change="Combined Deal Volume"
          isPositive={true}
          icon={CreditCard}
          color="#57344f"
        />
        <MetricCard
          title="Avg Credit Score Risk"
          value="24.2 / 100"
          change="Low Risk Portfolio"
          isPositive={true}
          icon={Building2}
          color="#059669"
        />
        <MetricCard
          title="Cleared for Fulfillment"
          value={quotes.length - pendingClearanceCount}
          change="Order-to-Cash Ready"
          isPositive={true}
          icon={CheckCircle}
          color="#0284c7"
        />
      </div>

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.4fr) minmax(0, 1fr)', gap: '20px' }}>
        
        {/* Left Column: Approval Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--on-surface)' }}>
                  Financial & Credit Clearance Queue
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
                  Quotations requiring credit checks, payment term review, or financial authorization
                </span>
              </div>

              {/* Filter Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="text"
                  placeholder="Filter quote, customer, rep..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{
                    padding: '4px 10px', borderRadius: 6,
                    border: '1px solid rgba(209,195,202,0.4)', fontSize: '0.8rem', outline: 'none'
                  }}
                />

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  style={{
                    padding: '4px 8px', borderRadius: 6,
                    border: '1px solid rgba(209,195,202,0.4)', fontSize: '0.8rem', background: '#fff'
                  }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING_CLEARANCE">Pending Clearance</option>
                  <option value="CLEARED">Cleared / Approved</option>
                  <option value="CREDIT_HOLD">Credit Hold</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={e => setPriorityFilter(e.target.value)}
                  style={{
                    padding: '4px 8px', borderRadius: 6,
                    border: '1px solid rgba(209,195,202,0.4)', fontSize: '0.8rem', background: '#fff'
                  }}
                >
                  <option value="ALL">All Priorities</option>
                  <option value="HIGH">High Priority (&gt;₹80L)</option>
                  <option value="MEDIUM">Medium Priority</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--secondary-text)' }}>
                <span className="material-symbols-outlined spin" style={{ fontSize: 24, color: '#00696e' }}>sync</span>
                <p style={{ marginTop: 8 }}>Loading finance clearance queue...</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Quote Ref</th>
                      <th>Customer & Tier</th>
                      <th>Contract Value</th>
                      <th>Discount</th>
                      <th>Gross Margin</th>
                      <th>Credit Risk</th>
                      <th>Clearance Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queueItems.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--secondary-text)' }}>
                          No financial clearance records match your filters.
                        </td>
                      </tr>
                    ) : (
                      queueItems.map(q => {
                        const status = q.financeClearanceStatus || (q.discountPercent > 18 ? 'PENDING_CLEARANCE' : 'CLEARED');
                        const isPending = status === 'PENDING_CLEARANCE';
                        const isHold = status === 'CREDIT_HOLD';
                        const customerObj = MOCK_CUSTOMERS.find(c => c.name === q.customerName) || MOCK_CUSTOMERS[0];
                        
                        return (
                          <tr key={q.id}>
                            <td style={{ fontWeight: 700, color: '#00696e' }}>{q.id}</td>
                            <td>
                              <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{q.customerName}</div>
                              <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>{q.tier}</span>
                            </td>
                            <td style={{ fontWeight: 700, fontFeatureSettings: "'tnum'" }}>{formatCurrency(q.totalValue)}</td>
                            <td style={{ fontFeatureSettings: "'tnum'" }}>{formatPercent(q.discountPercent)}</td>
                            <td style={{ color: q.marginPercent >= 35 ? '#059669' : '#d97706', fontWeight: 600 }}>
                              {formatPercent(q.marginPercent)}
                            </td>
                            <td>
                              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: customerObj.riskScore > 30 ? '#d97706' : '#059669' }}>
                                Score: {customerObj.riskScore}/100
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--secondary-text)' }}>
                                Limit: {formatCurrency(customerObj.creditLimit)}
                              </div>
                            </td>
                            <td>
                              <span style={{
                                fontSize: '0.75rem', padding: '3px 8px', borderRadius: 99, fontWeight: 700,
                                background: isPending ? 'rgba(234, 179, 8, 0.15)' : isHold ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                color: isPending ? '#ca8a04' : isHold ? '#b91c1c' : '#047857'
                              }}>
                                {isPending ? 'PENDING CLEARANCE' : isHold ? 'CREDIT HOLD' : 'CLEARED'}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <button
                                  onClick={(e) => handleAction(e, q, 'clear')}
                                  className="btn btn-success btn-sm"
                                  style={{ padding: '4px 8px', fontSize: '0.75rem', gap: 2 }}
                                  title="Approve Financial Clearance"
                                >
                                  <CheckCircle size={13} />
                                  <span>Clear</span>
                                </button>
                                <button
                                  onClick={(e) => handleAction(e, q, 'hold')}
                                  className="btn btn-danger btn-sm"
                                  style={{ padding: '4px 8px', fontSize: '0.75rem', gap: 2 }}
                                  title="Flag Credit Hold"
                                >
                                  <XCircle size={13} />
                                  <span>Hold</span>
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

        {/* Right Column: Financial Exposure & Credit Intelligence */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Credit Risk Policy Reference */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--on-surface)' }}>
              Finance Clearance Guidelines
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.78rem', color: 'var(--secondary-text)' }}>
              <div style={{ padding: '8px 10px', borderRadius: 6, background: 'var(--surface-container-low)', borderLeft: '3px solid #059669' }}>
                <strong style={{ color: 'var(--on-surface)' }}>Auto-Clearance Threshold:</strong> Deals below ₹50L with margin &ge;35% and customer risk score &lt;30 auto-pass.
              </div>

              <div style={{ padding: '8px 10px', borderRadius: 6, background: 'var(--surface-container-low)', borderLeft: '3px solid #d97706' }}>
                <strong style={{ color: 'var(--on-surface)' }}>Credit Limit Warning:</strong> Contracts exceeding 80% of customer credit limit require Net 30 collateral proof.
              </div>

              <div style={{ padding: '8px 10px', borderRadius: 6, background: 'var(--surface-container-low)', borderLeft: '3px solid #b91c1c' }}>
                <strong style={{ color: 'var(--on-surface)' }}>Hard Credit Hold:</strong> Unpaid invoices older than 60 days trigger mandatory financial freeze on new quotes.
              </div>
            </div>
          </div>

          {/* Accounts Credit Utilization */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--on-surface)' }}>
              Customer Credit Exposure
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {MOCK_CUSTOMERS.map(c => (
                <div key={c.id} style={{ fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{c.name}</span>
                    <span style={{ color: 'var(--secondary-text)' }}>Limit: {formatCurrency(c.creditLimit)}</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--surface-container-highest)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(100, (c.riskScore * 2))}%`, height: '100%',
                      background: c.riskScore > 35 ? '#d97706' : '#059669', borderRadius: 99
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Decision Modal */}
      <Modal
        isOpen={Boolean(selectedQuote)}
        onClose={() => setSelectedQuote(null)}
        title={
          modalType === 'clear' ? `Financial Clearance: ${selectedQuote?.id}` :
          modalType === 'hold' ? `Flag Credit Hold: ${selectedQuote?.id}` :
          `Request Collateral: ${selectedQuote?.id}`
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'var(--surface-container-low)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(209,195,202,0.3)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--secondary-text)' }}>Customer: <strong>{selectedQuote?.customerName}</strong> ({selectedQuote?.tier} Tier)</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', marginTop: '4px' }}>
              Contract Value: <strong>{formatCurrency(selectedQuote?.totalValue)}</strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', marginTop: '4px' }}>
              Applied Discount: <strong style={{ color: '#00696e' }}>{selectedQuote?.discountPercent}%</strong> | Gross Margin: <strong>{selectedQuote?.marginPercent}%</strong>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" style={{ fontWeight: 600 }}>Finance Rationale / Audit Memorandum</label>
            <textarea
              rows="3"
              className="textarea-field"
              placeholder={
                modalType === 'clear' ? 'E.g., Credit line verified. Approved Net 30 payment terms and financial release.' :
                'E.g., Credit limit exceeded. Pending bank guarantee or upfront payment.'
              }
              value={financeNote}
              onChange={(e) => setFinanceNote(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
            <button className="btn btn-outline" onClick={() => setSelectedQuote(null)}>Cancel</button>
            <button
              className={`btn ${modalType === 'clear' ? 'btn-success' : 'btn-danger'}`}
              style={{
                background: modalType === 'clear' ? '#047857' : '#b91c1c',
                borderColor: modalType === 'clear' ? '#047857' : '#b91c1c'
              }}
              onClick={submitDecision}
            >
              {modalType === 'clear' ? 'Confirm Financial Clearance' : 'Confirm Credit Hold'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
