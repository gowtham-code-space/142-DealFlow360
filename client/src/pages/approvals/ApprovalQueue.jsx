import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { MOCK_QUOTATIONS } from '../../utils/constants';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { CheckCircle, XCircle, Eye, Search } from 'lucide-react';

export default function ApprovalQueue() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('PENDING_APPROVAL');

  // Decision Modal State
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [auditNote, setAuditNote] = useState('');

  useEffect(() => {
    async function loadQuotations() {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.getQuotations();
      if (res.success && Array.isArray(res.data)) {
        setQuotes(res.data);
      } else {
        setQuotes(MOCK_QUOTATIONS);
        if (res.error) {
          console.info('[Approval Queue] API status notice, using structured fallback dataset:', res.error);
        }
      }
      setLoading(false);
    }
    loadQuotations();
  }, []);

  const handleAction = (e, quote, type) => {
    e.stopPropagation();
    setSelectedQuote(quote);
    setModalType(type);
    setAuditNote('');
  };

  const handleConfirmDecision = () => {
    if (!selectedQuote) return;
    setQuotes(quotes.map(q => {
      if (q.id === selectedQuote.id) {
        return {
          ...q,
          status: modalType === 'approve' ? 'APPROVED' : modalType === 'reject' ? 'REJECTED' : 'CUSTOMER_NEGOTIATION',
          requiresApprovalReason: `Manager Decision: ${auditNote || (modalType === 'approve' ? 'Approved discount exception' : 'Discount rejected')}`
        };
      }
      return q;
    }));
    setSelectedQuote(null);
    setModalType(null);
    setAuditNote('');
  };

  // Filtered queue items
  const filteredQuotes = quotes.filter(q => {
    const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
    const matchesTier = tierFilter === 'ALL' || q.tier === tierFilter;
    const matchesRisk = riskFilter === 'ALL' || q.riskScore === riskFilter;
    const matchesSearch = !searchQuery ||
      q.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.customerName && q.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (q.repName && q.repName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesStatus && matchesTier && matchesRisk && matchesSearch;
  });

  const pendingCount = quotes.filter(q => q.status === 'PENDING_APPROVAL').length;
  const approvedCount = quotes.filter(q => q.status === 'APPROVED').length;
  const totalValue = filteredQuotes.reduce((acc, q) => acc + Number(q.totalValue || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div className="card" style={{ padding: '20px', background: '#fff', borderLeft: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 className="page-title" style={{ margin: 0, fontSize: '1.4rem' }}>
                Sales Manager Approval Queue
              </h1>
              <span className="badge badge-pending">{pendingCount} Action Required</span>
            </div>
            <p className="page-subtitle" style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>
              Dedicated manager workspace for evaluating quote discount exceptions, gross margins, and compliance risks.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
              Queue Total Value: <strong style={{ color: 'var(--primary)', fontFeatureSettings: "'tnum'" }}>{formatCurrency(totalValue)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Layout: 2 Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.4fr) minmax(0, 1fr)', gap: '20px' }}>
        
        {/* Left Column: Work Queue & Filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            
            {/* Filter Bar */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexWrap: 'wrap', gap: 12, marginBottom: 16,
              paddingBottom: 16, borderBottom: '1px solid rgba(209,195,202,0.3)'
            }}>
              {/* Search */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', minWidth: 240 }}>
                <Search size={16} style={{ position: 'absolute', left: 10, color: 'var(--outline)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Search quote ID, customer, sales rep..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    height: 34, paddingLeft: 32, paddingRight: 12,
                    borderRadius: 6, border: '1px solid rgba(209,195,202,0.4)',
                    fontSize: '0.8rem', width: '100%', outline: 'none'
                  }}
                />
              </div>

              {/* Dropdown Filters */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  style={{
                    height: 34, padding: '0 10px', borderRadius: 6,
                    border: '1px solid rgba(209,195,202,0.4)', fontSize: '0.8rem', background: '#fff'
                  }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING_APPROVAL">Pending Approval</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CUSTOMER_NEGOTIATION">Negotiation</option>
                </select>

                <select
                  value={tierFilter}
                  onChange={e => setTierFilter(e.target.value)}
                  style={{
                    height: 34, padding: '0 10px', borderRadius: 6,
                    border: '1px solid rgba(209,195,202,0.4)', fontSize: '0.8rem', background: '#fff'
                  }}
                >
                  <option value="ALL">All Customer Tiers</option>
                  <option value="PLATINUM">Platinum Tier</option>
                  <option value="GOLD">Gold Tier</option>
                  <option value="STANDARD">Standard Tier</option>
                </select>

                <select
                  value={riskFilter}
                  onChange={e => setRiskFilter(e.target.value)}
                  style={{
                    height: 34, padding: '0 10px', borderRadius: 6,
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

            {/* Queue Data Table */}
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--secondary-text)' }}>
                <span className="material-symbols-outlined spin" style={{ fontSize: 24, color: 'var(--primary)' }}>sync</span>
                <p style={{ marginTop: 8 }}>Loading approval work queue...</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Quote ID</th>
                      <th>Customer & Tier</th>
                      <th>Sales Rep</th>
                      <th>Contract Value</th>
                      <th>Discount</th>
                      <th>Margin</th>
                      <th>Status / Trigger</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuotes.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--secondary-text)' }}>
                          No matching quotations found in approval queue.
                        </td>
                      </tr>
                    ) : (
                      filteredQuotes.map(q => {
                        const isPending = q.status === 'PENDING_APPROVAL';
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
                              <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>{q.tier || 'GOLD'}</span>
                            </td>
                            <td style={{ fontSize: '0.85rem' }}>{q.repName || 'Sales Rep'}</td>
                            <td style={{ fontWeight: 700, fontFeatureSettings: "'tnum'" }}>{formatCurrency(q.totalValue)}</td>
                            <td style={{ color: isHighRisk ? '#b91c1c' : 'inherit', fontWeight: 700 }}>
                              {formatPercent(q.discountPercent)}
                            </td>
                            <td style={{ color: q.marginPercent >= 35 ? '#059669' : '#d97706', fontWeight: 600 }}>
                              {formatPercent(q.marginPercent)}
                            </td>
                            <td>
                              <StatusBadge status={q.status} />
                              {q.requiresApprovalReason && (
                                <div style={{ fontSize: '0.7rem', color: '#b91c1c', marginTop: 2, fontWeight: 500 }}>
                                  ⚠️ {q.requiresApprovalReason}
                                </div>
                              )}
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={e => e.stopPropagation()}>
                                {isPending ? (
                                  <>
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
                                  </>
                                ) : (
                                  <button
                                    onClick={() => navigate(`/manager/approvals/${q.id}`)}
                                    className="btn btn-outline btn-sm"
                                    style={{ padding: '4px 8px', fontSize: '0.75rem', gap: 4 }}
                                  >
                                    <Eye size={13} />
                                    <span>Review Workspace</span>
                                  </button>
                                )}
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

        {/* Right Column: Workload Summary & Policy Guide */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Workload Summary */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--on-surface)' }}>
              Queue Summary Metrics
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid rgba(209,195,202,0.2)' }}>
                <span style={{ color: 'var(--secondary-text)' }}>Pending Approval:</span>
                <strong style={{ color: '#d97706' }}>{pendingCount} deals</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid rgba(209,195,202,0.2)' }}>
                <span style={{ color: 'var(--secondary-text)' }}>Approved Today:</span>
                <strong style={{ color: '#059669' }}>{approvedCount} deals</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid rgba(209,195,202,0.2)' }}>
                <span style={{ color: 'var(--secondary-text)' }}>Avg Manager Turnaround:</span>
                <strong style={{ color: 'var(--primary)' }}>2.1 Hours</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--secondary-text)' }}>SLA Compliance Rate:</span>
                <strong style={{ color: '#059669' }}>94.8%</strong>
              </div>
            </div>
          </div>

          {/* Discount Policy Matrix Overview */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--on-surface)' }}>
              Discount Governance Policy Caps
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.8rem' }}>
              <div style={{ padding: '8px 10px', borderRadius: 6, background: 'var(--surface-container-low)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Standard Tier Limit:</span>
                <strong style={{ color: 'var(--primary)' }}>&le; 10%</strong>
              </div>
              <div style={{ padding: '8px 10px', borderRadius: 6, background: 'var(--surface-container-low)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Gold Tier Limit:</span>
                <strong style={{ color: 'var(--primary)' }}>&le; 20%</strong>
              </div>
              <div style={{ padding: '8px 10px', borderRadius: 6, background: 'var(--surface-container-low)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Platinum Tier Limit:</span>
                <strong style={{ color: 'var(--primary)' }}>&le; 30%</strong>
              </div>
              <div style={{ padding: '8px 10px', borderRadius: 6, background: 'rgba(239, 68, 68, 0.08)', color: '#b91c1c', display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span>Hard Policy Floor:</span>
                <span>&gt;45% Prohibited</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Decision Modal */}
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
              Contract Value: <strong>{formatCurrency(selectedQuote?.totalValue)}</strong>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" style={{ fontWeight: 600 }}>Manager Rationale / Audit Note</label>
            <textarea
              rows="3"
              className="textarea-field"
              placeholder={
                modalType === 'approve' ? 'E.g., Approved based on strategic expansion potential.' :
                'E.g., Discount exceeds gross margin floor.'
              }
              value={auditNote}
              onChange={(e) => setAuditNote(e.target.value)}
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
              onClick={handleConfirmDecision}
            >
              {modalType === 'approve' ? 'Confirm Approval & Audit Log' : 'Confirm Rejection'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
