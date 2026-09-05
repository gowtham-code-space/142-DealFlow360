import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { formatCurrency, formatPercent, formatDate } from '../../utils/formatters';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { CheckCircle, XCircle, Eye, Search } from 'lucide-react';

export default function ApprovalQueue() {
  const navigate = useNavigate();

  // Primary data: approval records from /approvals
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('PENDING');

  // Decision Modal State
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [auditNote, setAuditNote] = useState('');
  const [actionError, setActionError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const approvalsRes = await api.getApprovals({ pageSize: 100 });
      if (approvalsRes.success && Array.isArray(approvalsRes.data)) {
        setApprovals(approvalsRes.data);
      } else {
        setErrorMsg(approvalsRes.error || 'Failed to load approval queue from backend.');
      }
    } catch (e) {
      setErrorMsg(`Network error: ${e.message}`);
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
    setAuditNote('');
    setActionError(null);
  };

  const handleConfirmDecision = async () => {
    if (!selectedApproval) return;
    setActionError(null);
    try {
      let res;
      if (modalType === 'approve') {
        res = await api.approveQuote(selectedApproval.id, auditNote);
      } else if (modalType === 'reject') {
        res = await api.rejectQuote(selectedApproval.id, auditNote);
      } else {
        res = await api.returnQuote(selectedApproval.id, auditNote);
      }

      if (res && res.success === false) {
        setActionError(res.error || `Failed to ${modalType}: ${res.status ? `HTTP ${res.status}` : 'Unknown error'}`);
        return;
      }
      // Success: close modal and reload
      setSelectedApproval(null);
      setModalType(null);
      setAuditNote('');
      await loadData();
    } catch (e) {
      setActionError(e.message);
    }
  };

  // Filtered approval records
  const filteredApprovals = approvals.filter(a => {
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchesStage = stageFilter === 'ALL' || a.stage === stageFilter;
    const quoteNum = a.quotation?.quotationNumber || a.quotationId || '';
    const approverName = a.approver?.name || '';
    const matchesSearch = !searchQuery ||
      quoteNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approverName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesStage && matchesSearch;
  });

  const pendingCount = approvals.filter(a => a.status === 'PENDING').length;
  const approvedCount = approvals.filter(a => a.status === 'APPROVED').length;
  const rejectedCount = approvals.filter(a => a.status === 'REJECTED').length;

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
              Total Approvals: <strong style={{ color: 'var(--primary)' }}>{approvals.length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div style={{ padding: '12px 16px', borderRadius: 8, background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', fontSize: '0.9rem' }}>
          {errorMsg}
        </div>
      )}

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
                  placeholder="Search quote ID or approver..."
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
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="RETURNED">Returned</option>
                </select>

                <select
                  value={stageFilter}
                  onChange={e => setStageFilter(e.target.value)}
                  style={{
                    height: 34, padding: '0 10px', borderRadius: 6,
                    border: '1px solid rgba(209,195,202,0.4)', fontSize: '0.8rem', background: '#fff'
                  }}
                >
                  <option value="ALL">All Stages</option>
                  <option value="SALES_REP">Sales Rep</option>
                  <option value="SALES_MANAGER">Sales Manager</option>
                  <option value="FINANCE_OPS">Finance / Ops</option>
                </select>

              </div>
            </div>

            {/* Approval Data Table */}
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--secondary-text)' }}>
                <span className="material-symbols-outlined spin" style={{ fontSize: 24, color: 'var(--primary)' }}>sync</span>
                <p style={{ marginTop: 8 }}>Loading approval work queue from backend...</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Approval ID</th>
                      <th>Quote Ref</th>
                      <th>Stage</th>
                      <th>Level</th>
                      <th>Status</th>
                      <th>Approver</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApprovals.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--secondary-text)' }}>
                          {approvals.length === 0
                            ? 'No approval records found. Approval records are created when a quote is submitted for review.'
                            : 'No approvals match your current filter criteria.'}
                        </td>
                      </tr>
                    ) : (
                      filteredApprovals.map(a => {
                        const isPending = a.status === 'PENDING';
                        const quoteNum = a.quotation?.quotationNumber || a.quotationId || a.id;
                        const quoteId = a.quotation?.id || a.quotationId;

                        return (
                          <tr
                            key={a.id}
                            style={{ cursor: 'pointer' }}
                            onClick={() => quoteId && navigate(`/manager/approvals/${quoteId}`)}
                          >
                            <td style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.8rem' }}>{a.id?.substring(0, 12)}…</td>
                            <td style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{quoteNum}</td>
                            <td>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--secondary-text)' }}>
                                {a.stage?.replace(/_/g, ' ') || '—'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 700 }}>L{a.level || '?'}</td>
                            <td>
                              <StatusBadge status={a.status} />
                            </td>
                            <td style={{ fontSize: '0.85rem' }}>{a.approver?.name || '—'}</td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>{formatDate(a.createdAt)}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={e => e.stopPropagation()}>
                                {isPending ? (
                                  <>
                                    <button
                                      onClick={(e) => handleAction(e, a, 'approve')}
                                      className="btn btn-success btn-sm"
                                      style={{ padding: '4px 8px', fontSize: '0.75rem', gap: 2 }}
                                    >
                                      <CheckCircle size={13} />
                                      <span>Approve</span>
                                    </button>
                                    <button
                                      onClick={(e) => handleAction(e, a, 'reject')}
                                      className="btn btn-danger btn-sm"
                                      style={{ padding: '4px 8px', fontSize: '0.75rem', gap: 2 }}
                                    >
                                      <XCircle size={13} />
                                      <span>Reject</span>
                                    </button>
                                    <button
                                      onClick={(e) => handleAction(e, a, 'return')}
                                      className="btn btn-outline btn-sm"
                                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                    >
                                      <span>Return</span>
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => quoteId && navigate(`/manager/approvals/${quoteId}`)}
                                    className="btn btn-outline btn-sm"
                                    style={{ padding: '4px 8px', fontSize: '0.75rem', gap: 4 }}
                                  >
                                    <Eye size={13} />
                                    <span>View</span>
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
          
          {/* Live Workload Summary */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--on-surface)' }}>
              Queue Summary Metrics
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid rgba(209,195,202,0.2)' }}>
                <span style={{ color: 'var(--secondary-text)' }}>Pending Approval:</span>
                <strong style={{ color: '#d97706' }}>{loading ? '—' : pendingCount} records</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid rgba(209,195,202,0.2)' }}>
                <span style={{ color: 'var(--secondary-text)' }}>Approved:</span>
                <strong style={{ color: '#059669' }}>{loading ? '—' : approvedCount} records</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--secondary-text)' }}>Rejected:</span>
                <strong style={{ color: '#b91c1c' }}>{loading ? '—' : rejectedCount} records</strong>
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

      {/* Decision Modal */}
      <Modal
        isOpen={Boolean(selectedApproval)}
        onClose={() => { setSelectedApproval(null); setActionError(null); }}
        title={
          modalType === 'approve' ? `Approve Approval Record` :
          modalType === 'reject' ? `Reject Approval Record` :
          `Return for Revision`
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
              Quote: <strong>{selectedApproval?.quotation?.quotationNumber || selectedApproval?.quotationId || '—'}</strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', marginTop: '4px' }}>
              Stage: <strong>{selectedApproval?.stage?.replace(/_/g, ' ') || '—'}</strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', marginTop: '4px' }}>
              Level: <strong>L{selectedApproval?.level || '?'}</strong>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" style={{ fontWeight: 600 }}>
              Manager Rationale / Audit Note{modalType === 'reject' ? ' (Required)' : ' (Optional)'}
            </label>
            <textarea
              rows="3"
              className="textarea-field"
              placeholder={
                modalType === 'approve' ? 'E.g., Approved based on strategic expansion potential.' :
                modalType === 'reject' ? 'E.g., Discount exceeds gross margin floor. (Required)' :
                'E.g., Please revise the discount to within tier cap.'
              }
              value={auditNote}
              onChange={(e) => setAuditNote(e.target.value)}
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
              onClick={handleConfirmDecision}
            >
              {modalType === 'approve' ? 'Confirm Approval & Audit Log' : 'Confirm Decision'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
