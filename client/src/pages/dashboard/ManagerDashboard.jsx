import React, { useState } from 'react';
import MetricCard from '../../components/common/MetricCard';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { MOCK_QUOTATIONS } from '../../utils/constants';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { ShieldAlert, CheckCircle, XCircle, FileSpreadsheet, Eye } from 'lucide-react';

export default function ManagerDashboard() {
  const [quotes, setQuotes] = useState(MOCK_QUOTATIONS);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [modalType, setModalType] = useState(null); // 'approve' | 'reject'
  const [managerNote, setManagerNote] = useState('');

  const pendingQuotes = quotes.filter(q => q.status === 'PENDING_APPROVAL');

  const handleAction = (quote, type) => {
    setSelectedQuote(quote);
    setModalType(type);
  };

  const submitDecision = () => {
    if (!selectedQuote) return;
    setQuotes(quotes.map(q => {
      if (q.id === selectedQuote.id) {
        return {
          ...q,
          status: modalType === 'approve' ? 'APPROVED' : 'REJECTED',
          requiresApprovalReason: `Decision by Manager: ${managerNote || (modalType === 'approve' ? 'Approved discount exception' : 'Discount rejected - Margin too low')}`
        };
      }
      return q;
    }));
    setSelectedQuote(null);
    setModalType(null);
    setManagerNote('');
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Sales Manager Governance & Approvals</h1>
          <p className="page-subtitle">Configure discount policy limits, review margin risk triggers, and unblock high-value deals.</p>
        </div>
      </div>

      <div className="grid-metrics">
        <MetricCard
          title="Pending Approvals"
          value={pendingQuotes.length}
          change="Urgent"
          isPositive={false}
          icon={ShieldAlert}
          color="#f59e0b"
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
          title="Approvals This Week"
          value="14"
          change="92% within SLA"
          isPositive={true}
          icon={CheckCircle}
          color="#10b981"
        />
      </div>

      {/* Approval Queue Table */}
      <div className="card">
        <div className="flex-between" style={{ marginBottom: '16px' }}>
          <div>
            <h3 className="section-title" style={{ margin: 0 }}>High-Discount & Risk Approval Queue</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Automated rule triggers requiring management override</span>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Quote ID</th>
                <th>Customer</th>
                <th>Tier Cap</th>
                <th>Requested Discount</th>
                <th>Total Value</th>
                <th>Gross Margin</th>
                <th>Rule Trigger Violation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingQuotes.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    ✅ All pending approvals cleared!
                  </td>
                </tr>
              ) : (
                pendingQuotes.map(q => (
                  <tr key={q.id}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{q.id}</td>
                    <td>{q.customerName}</td>
                    <td><span className="badge badge-gold">{q.tier} (20% Max)</span></td>
                    <td style={{ color: '#ef4444', fontWeight: 700 }}>{formatPercent(q.discountPercent)}</td>
                    <td style={{ fontWeight: 700 }}>{formatCurrency(q.totalValue)}</td>
                    <td style={{ color: '#10b981', fontWeight: 600 }}>{formatPercent(q.marginPercent)}</td>
                    <td style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 500 }}>
                      ⚠️ {q.requiresApprovalReason}
                    </td>
                    <td>
                      <div className="flex-gap-2">
                        <button
                          onClick={() => handleAction(q, 'approve')}
                          className="btn btn-success btn-sm"
                          style={{ padding: '4px 10px' }}
                        >
                          <CheckCircle size={14} />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleAction(q, 'reject')}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '4px 10px' }}
                        >
                          <XCircle size={14} />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Modal */}
      <Modal
        isOpen={Boolean(selectedQuote)}
        onClose={() => setSelectedQuote(null)}
        title={modalType === 'approve' ? `Approve Exception: ${selectedQuote?.id}` : `Reject Exception: ${selectedQuote?.id}`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: 'var(--radius-md)', border: 'var(--glass-border)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Customer: <strong>{selectedQuote?.customerName}</strong></div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Requested Discount: <strong style={{ color: '#ef4444' }}>{selectedQuote?.discountPercent}%</strong> (Tier Limit: 20%)</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Deal Margin: <strong style={{ color: '#10b981' }}>{selectedQuote?.marginPercent}%</strong></div>
          </div>

          <div className="input-group">
            <label className="input-label">Manager Audit Note</label>
            <textarea
              rows="3"
              className="textarea-field"
              placeholder={modalType === 'approve' ? 'E.g., Approved due to strategic multi-year commitment and upfront payment terms.' : 'E.g., Discount is excessive given minimum 40% margin threshold.'}
              value={managerNote}
              onChange={(e) => setManagerNote(e.target.value)}
            />
          </div>

          <div className="flex-between" style={{ marginTop: '12px' }}>
            <button className="btn btn-secondary" onClick={() => setSelectedQuote(null)}>Cancel</button>
            <button
              className={`btn ${modalType === 'approve' ? 'btn-success' : 'btn-danger'}`}
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
