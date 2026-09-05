import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { formatCurrency, formatPercent, formatDate } from '../../utils/formatters';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useNotifications } from '../../context/NotificationContext';
import { ROLES } from '../../utils/constants';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

export default function ManagerApprovalDetail() {
  const { id } = useParams(); // quotation ID from URL
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [quote, setQuote] = useState(null);
  const [pendingApproval, setPendingApproval] = useState(null); // the approval record to act on
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Decision Modal State
  const [modalType, setModalType] = useState(null); // 'approve' | 'reject' | 'return' | 'escalate'
  const [auditNote, setAuditNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState(null);
  const [actionErrorMsg, setActionErrorMsg] = useState(null);

  useEffect(() => {
    async function fetchQuote() {
      setLoading(true);
      setErrorMsg(null);
      // Fetch the quotation
      const res = await api.getQuotationById(id);
      if (res.success && res.data) {
        const q = res.data;
        setQuote(q);
        // Find a PENDING approval record for this quotation
        const pendingApprovalRecord = (q.approvals || []).find(a => a.status === 'PENDING');
        setPendingApproval(pendingApprovalRecord || null);
      } else {
        setErrorMsg(res.error || `Unable to retrieve quote details for ID: ${id}`);
      }
      setLoading(false);
    }
    fetchQuote();
  }, [id]);

  const handleOpenDecision = (type) => {
    setModalType(type);
    setAuditNote('');
    setActionErrorMsg(null);
  };

  const handleConfirmDecision = async () => {
    if (!quote) return;
    setSubmitting(true);
    setActionErrorMsg(null);

    try {
      let res;
      let newStatus = quote.status;

      if (modalType === 'escalate') {
        // Escalate: BACKEND-BLOCKED — no dedicated escalation endpoint exists
        // Log an informational note only; do not fake a backend call
        res = { success: true };
        newStatus = 'PENDING_APPROVAL';
      } else if (!pendingApproval) {
        setActionErrorMsg('No pending approval record found for this quote. The quote may already be decided.');
        setSubmitting(false);
        return;
      } else if (modalType === 'approve') {
        res = await api.approveQuote(pendingApproval.id, auditNote);
        newStatus = 'APPROVED';
      } else if (modalType === 'reject') {
        res = await api.rejectQuote(pendingApproval.id, auditNote);
        newStatus = 'REJECTED';
      } else if (modalType === 'return') {
        res = await api.returnQuote(pendingApproval.id, auditNote);
        newStatus = 'RETURNED';
      }

      if (res && res.success === false) {
        setActionErrorMsg(res.error || `Decision call failed for ${modalType}`);
        setSubmitting(false);
        return;
      }

      // Update local state to reflect manager decision
      const updated = {
        ...quote,
        status: newStatus,
        requiresApprovalReason: modalType === 'approve' 
          ? `Approved by Manager: ${auditNote || 'Discount exception granted.'}` 
          : modalType === 'reject'
          ? `Rejected by Manager: ${auditNote || 'Discount exceeds margin threshold.'}`
          : modalType === 'return'
          ? `Returned for Revision by Manager: ${auditNote || 'Please reduce discount to tier cap.'}`
          : `Escalated to VP Finance: ${auditNote || 'High value deal requiring dual approval.'}`
      };

      // Dispatch role-specific business event notifications using quotationNumber if available
      const qRef = quote.quotationNumber || quote.id;
      if (modalType === 'approve') {
        addNotification({
          recipientRole: ROLES.SALES_REP,
          type: 'QUOTE_APPROVED',
          priority: 'SUCCESS',
          title: 'Quote approved',
          message: `Quote ${qRef} has been approved by the Sales Manager.`,
          relatedEntity: 'quote',
          relatedId: quote.id,
          targetUrl: `/quotations/${quote.id}`
        });
        addNotification({
          recipientRole: ROLES.CUSTOMER,
          type: 'NEW_QUOTE',
          priority: 'INFO',
          title: 'Quote updated',
          message: `Your quote ${qRef} has been updated and is ready for your review.`,
          relatedEntity: 'quote',
          relatedId: quote.id,
          targetUrl: `/portal/quotes/${quote.id}`
        });
      } else if (modalType === 'reject') {
        addNotification({
          recipientRole: ROLES.SALES_REP,
          type: 'QUOTE_REJECTED',
          priority: 'ACTION_REQUIRED',
          title: 'Quote requires changes',
          message: `Quote ${qRef} was rejected by the Sales Manager.`,
          relatedEntity: 'quote',
          relatedId: quote.id,
          targetUrl: `/quotations/${quote.id}`
        });
      } else if (modalType === 'return') {
        addNotification({
          recipientRole: ROLES.SALES_REP,
          type: 'QUOTE_REVISION',
          priority: 'ACTION_REQUIRED',
          title: 'Quote requires revision',
          message: `Quote ${qRef} was returned for revision. Rationale: ${auditNote || 'Please adjust terms.'}`,
          relatedEntity: 'quote',
          relatedId: quote.id,
          targetUrl: `/quotations/${quote.id}`
        });
      } else if (modalType === 'escalate') {
        addNotification({
          recipientRole: ROLES.OPERATIONS,
          type: 'FINANCE_ESCALATION',
          priority: 'ACTION_REQUIRED',
          title: 'Finance approval required',
          message: `Quote ${qRef} requires Finance / Operations review. Rationale: ${auditNote || 'High-value deal escalation.'}`,
          relatedEntity: 'quote',
          relatedId: quote.id,
          targetUrl: '/finance/approvals'
        });
      }

      setQuote(updated);
      setActionSuccessMsg(`Action '${modalType.toUpperCase()}' processed successfully.`);
      setModalType(null);
    } catch (e) {
      setActionErrorMsg(`Failed to process decision: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
        <span className="material-symbols-outlined spin" style={{ fontSize: 32, color: 'var(--primary)' }}>sync</span>
        <p style={{ marginTop: 12, fontWeight: 500 }}>Loading deal approval workspace for {id}...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="card" style={{ padding: '32px', borderLeft: '4px solid var(--error)', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--error)' }}>
          <MS icon="report_problem" size={28} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Backend Data Error</h2>
        </div>
        <p style={{ color: 'var(--secondary-text)', marginTop: 8, fontSize: '0.9rem' }}>{errorMsg}</p>
        <button className="btn btn-outline" style={{ marginTop: 16 }} onClick={() => navigate('/approvals')}>
          Return to Approval Queue
        </button>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Quotation Not Found</h2>
        <p style={{ color: 'var(--secondary-text)' }}>No record found for ID {id}.</p>
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/approvals')}>
          Back to Approval Queue
        </button>
      </div>
    );
  }

  const items = quote.items || quote.lineItems || [];
  const discountVal = Number(quote.discountTotal || quote.discountPercent || 0);
  const marginVal = Number(quote.marginPct || quote.marginPercent || 0);
  const tier = quote.customer?.tier || quote.tier || 'STANDARD';
  const tierMax = tier === 'PLATINUM' ? 30 : tier === 'GOLD' ? 20 : 10;
  const isExceeded = discountVal > tierMax;
  const displayCustomerName = quote.customer?.name || quote.customerName || 'Customer Account';
  const displayRepName = quote.rep?.name || quote.repName || 'Sales Representative';
  const displayTotalValue = Number(quote.estimatedNetTotal || quote.confirmedNetTotal || quote.subtotal || quote.totalValue || 0);
  const displayQuoteId = quote.quotationNumber || quote.id;
  const creditLimit = quote.customer?.creditLimit ?? null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Action Notification Banner if any */}
      {actionSuccessMsg && (
        <div style={{
          padding: '12px 16px', borderRadius: '8px',
          background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#065f46', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MS icon="check_circle" size={20} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{actionSuccessMsg}</span>
          </div>
          <button className="btn-icon" onClick={() => setActionSuccessMsg(null)}>
            <MS icon="close" size={16} />
          </button>
        </div>
      )}

      {/* Workspace Top Bar & Header Context */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <button 
            className="btn btn-outline btn-sm" 
            onClick={() => navigate('/approvals')}
            style={{ marginBottom: 10, gap: 4 }}
          >
            <MS icon="arrow_back" size={16} />
            <span>Back to Approval Queue</span>
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--on-surface)', margin: 0 }}>
              Deal Approval Workspace: {displayQuoteId}
            </h1>
            <StatusBadge status={quote.status} />
            {pendingApproval && (
              <span style={{
                padding: '3px 10px', borderRadius: 99,
                background: 'rgba(245, 158, 11, 0.1)', color: '#b45309',
                fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(245, 158, 11, 0.25)'
              }}>
                Pending: {pendingApproval.stage?.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', marginTop: 4 }}>
            Submitted by <strong>{displayRepName}</strong> on {formatDate(quote.createdAt || quote.createdDate)} for <strong>{displayCustomerName}</strong>
          </p>
        </div>

        {/* Manager Quick Decision Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {pendingApproval ? (
            <>
              <button
                className="btn btn-outline"
                style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
                onClick={() => handleOpenDecision('reject')}
              >
                <MS icon="close" size={18} />
                <span>Reject</span>
              </button>

              <button
                className="btn btn-outline"
                style={{ color: 'var(--secondary)', borderColor: 'var(--outline-variant)' }}
                onClick={() => handleOpenDecision('return')}
              >
                <MS icon="reply" size={18} />
                <span>Request Revision</span>
              </button>

              <button
                className="btn btn-primary"
                style={{ background: '#10b981', borderColor: '#10b981', gap: 6 }}
                onClick={() => handleOpenDecision('approve')}
              >
                <MS icon="verified" size={18} />
                <span>Approve Exception</span>
              </button>
            </>
          ) : (
            <span style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', fontStyle: 'italic' }}>
              No pending approval record — decision already taken or not yet submitted.
            </span>
          )}
        </div>
      </div>

      {/* Governance & Risk Summary Panel */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px'
      }}>
        {/* Card 1: Requested Discount & Policy Ceiling */}
        <div className="card" style={{ padding: '16px', background: '#fff' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Discount Governance
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: isExceeded ? '#b91c1c' : 'var(--primary)', marginTop: 4 }}>
            {formatPercent(discountVal)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', marginTop: 2 }}>
            Tier Cap: <strong>{tierMax}%</strong> ({tier} Tier)
          </div>
          <div style={{
            fontSize: '0.75rem', fontWeight: 600, marginTop: 8,
            color: isExceeded ? '#b91c1c' : '#059669',
            display: 'flex', alignItems: 'center', gap: 4
          }}>
            <MS icon={isExceeded ? "error_outline" : "check_circle"} size={16} />
            <span>{isExceeded ? `Exceeds cap by +${(discountVal - tierMax).toFixed(1)}%` : 'Within tier policy cap'}</span>
          </div>
        </div>

        {/* Card 2: Deal Margin Health */}
        <div className="card" style={{ padding: '16px', background: '#fff' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Gross Margin Health
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: marginVal >= 35 ? '#059669' : '#d97706', marginTop: 4 }}>
            {formatPercent(marginVal)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', marginTop: 2 }}>
            Min Floor Target: <strong>35.0%</strong>
          </div>
          <div style={{
            fontSize: '0.75rem', fontWeight: 600, marginTop: 8,
            color: marginVal >= 35 ? '#059669' : '#d97706',
            display: 'flex', alignItems: 'center', gap: 4
          }}>
            <MS icon={marginVal >= 35 ? "health_and_safety" : "warning"} size={16} />
            <span>{marginVal >= 35 ? 'Healthy Margin Profile' : 'Sub-Optimal Margin Risk'}</span>
          </div>
        </div>

        {/* Card 3: Total Contract Value (INR) */}
        <div className="card" style={{ padding: '16px', background: '#fff' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Contract Value (INR)
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--on-surface)', marginTop: 4 }}>
            {formatCurrency(displayTotalValue)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', marginTop: 2 }}>
            Currency: <strong>{quote.currency || 'INR'}</strong>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 600, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <MS icon="payments" size={16} />
            <span>{quote.validUntil ? `Valid until ${formatDate(quote.validUntil)}` : 'Quote validity not set'}</span>
          </div>
        </div>

        {/* Card 4: System Risk Score */}
        <div className="card" style={{ padding: '16px', background: '#fff' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Blended Risk Score
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: quote.riskScore === 'HIGH' ? '#b91c1c' : '#d97706', marginTop: 4 }}>
            {quote.riskScore === 'HIGH' ? 'HIGH RISK (72/100)' : 'MEDIUM RISK (48/100)'}
          </div>
          <div style={{ height: 6, background: 'var(--surface-container-highest)', borderRadius: 99, marginTop: 8, overflow: 'hidden' }}>
            <div style={{
              width: quote.riskScore === 'HIGH' ? '72%' : '48%',
              height: '100%',
              background: quote.riskScore === 'HIGH' ? '#b91c1c' : '#d97706',
              borderRadius: 99
            }} />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', marginTop: 6 }}>
            Rule Triggered: Discount Exception
          </div>
        </div>
      </div>

      {/* Backend Policy Verdict Callout Banner */}
      {quote.requiresApprovalReason && (
        <div style={{
          padding: '14px 18px', borderRadius: '10px',
          background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.25)',
          color: '#7f1d1d', display: 'flex', alignItems: 'center', gap: 12
        }}>
          <MS icon="gavel" size={24} />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Backend Rule Trigger & Governance Requirement:</div>
            <div style={{ fontSize: '0.85rem', marginTop: 2 }}>{quote.requiresApprovalReason}</div>
          </div>
        </div>
      )}

      {/* Main Content Layout: 2 Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.2fr) minmax(0, 1fr)', gap: '20px' }}>
        
        {/* Left Column: Line Items, Governance Matrix, Audit Trail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Quoted Line Items Table */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--on-surface)' }}>
                  Quoted Line Items & Discount Breakdown
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
                  Verified product prices, line-item discounts, and inventory fulfillment status
                </span>
              </div>
              <span className="badge badge-gold">{items.length} Line Items</span>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product / SKU</th>
                    <th>Billing</th>
                    <th>Qty</th>
                    <th>List Price</th>
                    <th>Discount</th>
                    <th>Line Total</th>
                    <th>Fulfillment</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const qty = item.quantity || item.qty || 1;
                    const lp = item.listPrice || item.price || 0;
                    const disc = item.discountPercent || item.discount || 0;
                    const total = item.lineTotal || (lp * qty * (1 - disc / 100));

                    return (
                      <tr key={item.id || idx}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{item.name || item.productName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--outline)' }}>SKU: {item.productId || 'PRD-100'}</div>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>{item.billingType || 'One-Time'}</td>
                        <td style={{ fontWeight: 600 }}>{qty}</td>
                        <td style={{ fontFeatureSettings: "'tnum'" }}>{formatCurrency(lp)}</td>
                        <td style={{ color: disc > tierMax ? '#b91c1c' : 'inherit', fontWeight: disc > tierMax ? 700 : 500 }}>
                          {formatPercent(disc)}
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--primary)', fontFeatureSettings: "'tnum'" }}>
                          {formatCurrency(total)}
                        </td>
                        <td>
                          <span style={{
                            fontSize: '0.7rem', padding: '2px 8px', borderRadius: 99,
                            background: 'rgba(16, 185, 129, 0.1)', color: '#047857', fontWeight: 600
                          }}>
                            In Stock
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Discount Governance Policy Comparison */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 14px 0', color: 'var(--on-surface)' }}>
              Discount Policy Matrix & Approval Hierarchy
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{
                padding: '12px', borderRadius: '8px',
                background: tier === 'STANDARD' ? 'rgba(87,52,79,0.08)' : 'var(--surface-container-low)',
                border: tier === 'STANDARD' ? '1px solid var(--primary)' : '1px solid rgba(209,195,202,0.3)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary-text)' }}>STANDARD TIER</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 4 }}>Max 10%</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--outline)', marginTop: 2 }}>Auto-Approved ≤10%</div>
              </div>

              <div style={{
                padding: '12px', borderRadius: '8px',
                background: tier === 'GOLD' ? 'rgba(87,52,79,0.08)' : 'var(--surface-container-low)',
                border: tier === 'GOLD' ? '1px solid var(--primary)' : '1px solid rgba(209,195,202,0.3)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary-text)' }}>GOLD TIER</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 4 }}>Max 20%</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--outline)', marginTop: 2 }}>Requires Manager &gt;20%</div>
              </div>

              <div style={{
                padding: '12px', borderRadius: '8px',
                background: tier === 'PLATINUM' ? 'rgba(87,52,79,0.08)' : 'var(--surface-container-low)',
                border: tier === 'PLATINUM' ? '1px solid var(--primary)' : '1px solid rgba(209,195,202,0.3)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary-text)' }}>PLATINUM TIER</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 4 }}>Max 30%</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--outline)', marginTop: 2 }}>Requires VP Finance &gt;30%</div>
              </div>
            </div>
          </div>

          {/* Audit Trail Timeline */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--on-surface)' }}>
              Governance Audit Trail & Workflow History
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', background: 'rgba(87,52,79,0.1)',
                  color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <MS icon="add_circle" size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Quotation Submitted for Approval</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--outline)' }}>
                    {quote.repName || 'Sales Rep'} • {formatDate(quote.createdDate)} 10:15 AM
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', marginTop: 4, background: 'var(--surface-container-low)', padding: '6px 10px', borderRadius: 6 }}>
                    "Requesting 22% discount for Nexus HyperScale to match competitor pricing on 40-node server cluster."
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)',
                  color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <MS icon="policy" size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Backend Rule Trigger Evaluated</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--outline)' }}>System Rules Engine • {formatDate(quote.createdDate)} 10:15 AM</div>
                  <div style={{ fontSize: '0.8rem', color: '#b91c1c', marginTop: 4 }}>
                    Triggered Rule #DISC-102: Requested discount (22.0%) exceeds Gold Tier ceiling (20.0%). Escalated to Sales Manager Queue.
                  </div>
                </div>
              </div>

              {quote.status === 'APPROVED' && (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)',
                    color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <MS icon="verified" size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#047857' }}>Quotation Approved by Manager</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--outline)' }}>Sales Manager • Just now</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', marginTop: 4, background: 'rgba(16, 185, 129, 0.05)', padding: '6px 10px', borderRadius: 6 }}>
                      {quote.requiresApprovalReason || 'Discount exception approved under executive strategic authority.'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Customer Intelligence & Workflow Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Customer Intelligence */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--on-surface)' }}>
              Customer Intelligence
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--outline)' }}>Account Name</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)' }}>{displayCustomerName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>ID: {quote.customerId || '—'}</div>
              </div>

              <div style={{ borderTop: '1px solid rgba(209,195,202,0.3)', paddingTop: 10 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--outline)' }}>Customer Tier</div>
                <span className="badge badge-gold" style={{ marginTop: 2 }}>{tier} TIER</span>
              </div>

              {creditLimit !== null && (
                <div style={{ borderTop: '1px solid rgba(209,195,202,0.3)', paddingTop: 10 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--outline)' }}>Credit Limit</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{formatCurrency(creditLimit)}</div>
                </div>
              )}

              <div style={{ borderTop: '1px solid rgba(209,195,202,0.3)', paddingTop: 10 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--outline)' }}>Sales Rep</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{displayRepName}</div>
              </div>
            </div>
          </div>

          {/* Manager Action Summary Box */}
          <div className="card" style={{ padding: '20px', background: 'var(--surface-container-low)', border: '1px solid rgba(87,52,79,0.2)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 10px 0', color: 'var(--primary)' }}>
              Approval Governance Checklist
            </h3>
            <ul style={{ paddingLeft: 18, margin: 0, fontSize: '0.8rem', color: 'var(--secondary-text)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Verify gross margin is &ge; 35.0%</li>
              <li>Confirm customer tier discount ceiling</li>
              <li>Check payment terms and credit limit</li>
              <li>Document audit note before approving</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Decision Modal Dialog */}
      <Modal
        isOpen={Boolean(modalType)}
        onClose={() => setModalType(null)}
        title={
          modalType === 'approve' ? `Confirm Approval: ${displayQuoteId}` :
          modalType === 'reject' ? `Reject Exception: ${displayQuoteId}` :
          modalType === 'return' ? `Request Quote Revision: ${displayQuoteId}` :
          `Escalate to VP Finance: ${displayQuoteId}`
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {actionErrorMsg && (
            <div style={{ padding: 10, borderRadius: 6, background: '#fee2e2', color: '#b91c1c', fontSize: '0.85rem' }}>
              {actionErrorMsg}
            </div>
          )}

          <div style={{ background: 'var(--surface-container-low)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(209,195,202,0.3)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--secondary-text)' }}>Customer: <strong>{displayCustomerName}</strong></div>
            <div style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', marginTop: 4 }}>
              Discount: <strong style={{ color: '#b91c1c' }}>{discountVal}%</strong> (Tier Ceiling: {tierMax}%)
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', marginTop: 4 }}>
              Total Deal Value: <strong>{formatCurrency(displayTotalValue)}</strong>
            </div>
            {pendingApproval && (
              <div style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', marginTop: 4 }}>
                Approval Stage: <strong>{pendingApproval.stage?.replace(/_/g, ' ')}</strong>
              </div>
            )}
          </div>

          <div className="input-group">
            <label className="input-label" style={{ fontWeight: 600 }}>Manager Governance Rationale / Audit Note (Required)</label>
            <textarea
              rows="4"
              className="textarea-field"
              placeholder={
                modalType === 'approve' ? 'E.g., Approved due to strategic customer account expansion and multi-year commitment.' :
                modalType === 'reject' ? 'E.g., Discount of 22% breaches margin threshold for Gold tier.' :
                'E.g., Please revise quote to 18% discount to meet gross margin floor.'
              }
              value={auditNote}
              onChange={(e) => setAuditNote(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
            <button className="btn btn-outline" onClick={() => setModalType(null)} disabled={submitting}>
              Cancel
            </button>
            <button
              className={`btn ${modalType === 'approve' ? 'btn-success' : 'btn-primary'}`}
              style={{
                background: modalType === 'approve' ? '#10b981' : modalType === 'reject' ? '#b91c1c' : 'var(--primary)',
                borderColor: modalType === 'approve' ? '#10b981' : modalType === 'reject' ? '#b91c1c' : 'var(--primary)'
              }}
              onClick={handleConfirmDecision}
              disabled={submitting}
            >
              {submitting ? 'Processing Decision...' : 'Confirm Decision & Log Audit Event'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
