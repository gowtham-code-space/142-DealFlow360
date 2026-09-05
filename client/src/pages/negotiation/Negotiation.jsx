import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import StatusBadge from '../../components/common/StatusBadge';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size }}>{icon}</span>
);

export default function Negotiation() {
  const { id = 'Q-2026-002' } = useParams();
  const navigate = useNavigate();

  const [negotiation, setNegotiation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Counter proposal inputs
  const [counterDiscount, setCounterDiscount] = useState(22);
  const [counterPaymentTerms, setCounterPaymentTerms] = useState('Net 45');

  // Backend Reapproval Evaluation State
  const [submittingCounter, setSubmittingCounter] = useState(false);
  const [_reapprovalState, setReapprovalState] = useState(null);

  // Customer-facing preview toggle
  const [customerPreview, setCustomerPreview] = useState(false);

  useEffect(() => {
    async function loadNegotiation() {
      setLoading(true);
      
      const [quoteRes, ticketsRes, msgsRes] = await Promise.all([
        api.getQuotationById(id),
        api.getNegotiationTickets(id),
        api.getNegotiation(id)
      ]);

      if (quoteRes.success) {
        const q = quoteRes.data;
        const activeTicket = ticketsRes.success && ticketsRes.data?.length > 0 ? ticketsRes.data[0] : null;
        const msgs = msgsRes.success ? msgsRes.data : [];

        // Build the composite negotiation object
        setNegotiation({
          quoteId: q.id,
          status: q.status,
          customerName: q.customer?.name || q.customerName,
          tier: q.customer?.tier || q.tier,
          originalTerms: {
            totalValue: q.estimatedNetTotal || q.totalValue,
            discountPercent: q.discountTotal ? (q.discountTotal / (q.subtotal || 1) * 100).toFixed(1) : q.discountPercent,
            paymentTerms: 'Net 30',
            marginPercent: q.marginPct || q.marginPercent
          },
          counterOffer: activeTicket ? {
            id: activeTicket.id,
            timestamp: new Date(activeTicket.createdAt).toLocaleString(),
            customerNote: activeTicket.comments || 'No comments provided',
            requestedDiscountPercent: activeTicket.requestedDiscountPct,
            requestedTerms: 'Net 60' // Mocked parameter for now
          } : null,
          messages: msgs.map(m => ({
            id: m.id,
            sender: m.senderRole === 'CUSTOMER' ? 'customer' : 'rep',
            author: m.senderRole === 'CUSTOMER' ? (q.customer?.name || 'Customer') : 'Sales Representative',
            timestamp: new Date(m.createdAt).toLocaleString(),
            text: m.message
          })),
          parameterDiffs: activeTicket ? [
            { field: 'Discount', original: `${q.discountTotal ? (q.discountTotal / (q.subtotal || 1) * 100).toFixed(1) : q.discountPercent}%`, counter: `${activeTicket.requestedDiscountPct}%`, delta: `+${(activeTicket.requestedDiscountPct - (q.discountPercent || 0)).toFixed(1)}%` },
            { field: 'Payment Terms', original: 'Net 30', counter: 'Net 60', delta: '+30 Days' }
          ] : []
        });
      }
      setLoading(false);
    }
    loadNegotiation();
  }, [id]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    setSendingMsg(true);
    const res = await api.sendNegotiationMessage(id, {
      senderRole: 'REP',
      message: messageText
    });
    if (res.success) {
      setMessageText('');
      // Trigger a re-fetch of the messages
      const msgsRes = await api.getNegotiation(id);
      if (msgsRes.success) {
        setNegotiation(prev => ({
          ...prev,
          messages: msgsRes.data.map(m => ({
            id: m.id,
            sender: m.senderRole === 'CUSTOMER' ? 'customer' : 'rep',
            author: m.senderRole === 'CUSTOMER' ? (prev.customerName || 'Customer') : 'Sales Representative',
            timestamp: new Date(m.createdAt).toLocaleString(),
            text: m.message
          }))
        }));
      }
    }
    setSendingMsg(false);
  };

  const handleSubmitRepCounter = async () => {
    if (!negotiation?.counterOffer?.id) {
      alert("No active negotiation ticket to counter.");
      return;
    }
    
    setSubmittingCounter(true);
    const payload = {
      counterDiscountPct: counterDiscount,
      comments: `Proposed Payment Terms: ${counterPaymentTerms}`
    };

    const res = await api.submitCounterOffer(negotiation.counterOffer.id, payload);
    if (res.success) {
      setReapprovalState(res.data);

      await api.sendNegotiationMessage(id, {
        senderRole: 'REP',
        message: `Submitted revised counter-offer: ${counterDiscount}% discount with ${counterPaymentTerms} payment terms.`
      });

      // Simple reload to get updated ticket status and messages
      window.location.reload();
    } else {
      alert(res.error || 'Failed to submit counter offer');
    }
    setSubmittingCounter(false);
  };

  const handleAcceptTerms = async () => {
    if (!negotiation?.counterOffer?.id) {
      alert("No active negotiation ticket to accept.");
      return;
    }
    if (window.confirm("Are you sure you want to accept the customer's terms? This will update the quotation status.")) {
      const res = await api.acceptNegotiationTicket(negotiation.counterOffer.id, {
        comments: 'Accepted by Sales Rep from Negotiation Workspace'
      });
      if (res.success) {
        alert("Terms accepted successfully!");
        navigate(`/quotations/${id}`);
      } else {
        alert("Failed to accept terms: " + res.error);
      }
    }
  };

  const handleEscalate = async () => {
    if (!negotiation?.counterOffer?.id) {
      alert("No active negotiation ticket to escalate.");
      return;
    }
    if (window.confirm("Are you sure you want to escalate this negotiation to your Manager?")) {
      const res = await api.escalateNegotiationTicket(negotiation.counterOffer.id, {
        comments: 'Escalated by Sales Rep for Manager Review'
      });
      if (res.success) {
        alert("Negotiation escalated to Manager successfully!");
        navigate(`/quotations/${id}`);
      } else {
        alert("Failed to escalate: " + res.error);
      }
    }
  };

  const handleExportPdf = async () => {
    const res = await api.exportNegotiationSummaryPdf(id);
    if (!res.success) {
      alert("Failed to export PDF: " + res.error);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="spin flex-center"><MS icon="sync" size={24} /></div>
        <p style={{ marginTop: 8 }}>Loading Customer Negotiation Workspace...</p>
      </div>
    );
  }

  return (
    <div className="flex-col gap-4">
      {/* 1. TOP HEADER & CONTEXT BAR */}
      <div className="card card-body flex-between">
        <div className="flex-gap-3">
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/quotations')}>
            <MS icon="arrow_back" size={16} /> <span>Pipeline</span>
          </button>
          <div>
            <div className="flex-gap-2 items-center">
              <h1 className="headline-md" style={{ margin: 0 }}>Negotiation Workspace: {negotiation?.quoteId}</h1>
              <StatusBadge status={negotiation?.status} />
            </div>
            <div className="body-sm text-secondary" style={{ marginTop: 2 }}>
              Account: <strong className="text-primary-color">{negotiation?.customerName}</strong> ({negotiation?.tier} Tier) | Quoted: <strong>{formatCurrency(negotiation?.originalTerms?.totalValue || 142000)}</strong>
            </div>
          </div>
        </div>

        <div className="flex-gap-2">
          <button className={`btn btn-sm ${customerPreview ? 'btn-primary' : 'btn-outline'}`} onClick={() => setCustomerPreview(!customerPreview)}>
            <MS icon={customerPreview ? "visibility_off" : "visibility"} size={16} />
            <span>{customerPreview ? 'Customer View Active' : 'Toggle Customer Preview'}</span>
          </button>
        </div>
      </div>

      {customerPreview && (
        <div className="banner-info flex-gap-2">
          <MS icon="visibility" size={18} />
          <span className="body-sm font-semibold">Customer Portal View Mode — Internal margins, risk scores, and approval rules are hidden.</span>
        </div>
      )}

      {/* 2. DENSE STITCH 2-COLUMN WORKSPACE */}
      <div className="grid-negotation">
        
        {/* LEFT COLUMN: Conversation, Chat & Counter Controls */}
        <div className="flex-col gap-4">
          
          {/* Customer Counter Offer Summary Header */}
          <div className="card card-body" style={{ borderLeft: '4px solid var(--secondary)' }}>
            <div className="flex-between" style={{ marginBottom: 12 }}>
              <div className="flex-gap-2 text-secondary-color">
                <MS icon="forum" size={20} />
                <h3 className="headline-sm" style={{ margin: 0 }}>Customer Counter-Proposal Received</h3>
              </div>
              <span className="label-sm text-muted">Received {negotiation?.counterOffer?.timestamp}</span>
            </div>

            <div style={{
              background: 'var(--surface-container-low)', padding: '12px 16px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)', fontSize: 13, color: 'var(--on-surface)', fontStyle: 'italic',
              marginBottom: 12
            }}>
              "{negotiation?.counterOffer?.customerNote}"
            </div>

            <div className="flex-between body-sm text-secondary">
              <span>Requested Discount: <strong className="text-secondary-color font-bold">{negotiation?.counterOffer?.requestedDiscountPercent}%</strong> (Orig: {negotiation?.originalTerms?.discountPercent}%)</span>
              <span>Requested Payment: <strong className="text-secondary-color font-bold">{negotiation?.counterOffer?.requestedTerms}</strong> (Orig: {negotiation?.originalTerms?.paymentTerms})</span>
            </div>
          </div>

          {/* Direct Negotiation Chat Timeline */}
          <div className="card flex-col" style={{ height: 420 }}>
            <div className="card-header flex-between" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <h3 className="headline-sm" style={{ margin: 0 }}>Direct Customer Chat Timeline</h3>
                <div className="flex-between">
                  <span className="label-sm text-muted">Customer Contacts</span>
                  <span className="badge badge-surface" style={{ fontSize: 10 }}>Primary</span>
                </div>
              </div>
              <span className="label-sm text-emerald flex-gap-2 font-bold">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} /> Online
              </span>
            </div>

            <div className="card-body" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {negotiation?.messages?.map((msg) => {
                const isRep = msg.sender === 'rep';
                return (
                  <div key={msg.id} style={{ alignSelf: isRep ? 'flex-end' : 'flex-start', maxWidth: '85%' }} className={`body-md ${isRep ? 'chat-rep' : 'chat-customer'}`}>
                    <div style={{ padding: '10px 14px' }}>
                      <div style={{ fontSize: 10, opacity: 0.8, marginBottom: 4, fontWeight: 600, letterSpacing: '0.02em' }}>
                        {msg.author} • {msg.timestamp}
                      </div>
                      <div>{msg.text}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="card-body" style={{ borderTop: '1px solid var(--border-color)', background: 'var(--surface-container-lowest)' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text" className="input-field" placeholder="Type response to customer..."
                  value={messageText} onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button className="btn btn-primary" onClick={handleSendMessage} disabled={sendingMsg || !messageText.trim()}>
                  <MS icon="send" size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Rep Counter Controls & Decision Toolbar */}
          <div className="card card-body" style={{ background: 'var(--surface-container-low)' }}>
            <h3 className="headline-sm" style={{ marginBottom: 16 }}>Sales Rep Decision & Counter Builder</h3>

            <div className="grid-2" style={{ marginBottom: 16 }}>
              <div className="input-group">
                <label className="input-label">Revised Counter Discount %</label>
                <input type="number" min="0" max="40" className="input-field" value={counterDiscount} onChange={(e) => setCounterDiscount(Number(e.target.value))} />
              </div>
              <div className="input-group">
                <label className="input-label">Revised Payment Terms</label>
                <select className="select-field" value={counterPaymentTerms} onChange={(e) => setCounterPaymentTerms(e.target.value)}>
                  <option value="Net 30">Net 30 (Standard)</option>
                  <option value="Net 45">Net 45 (Compromise)</option>
                  <option value="Net 60">Net 60 (Requested)</option>
                </select>
              </div>
            </div>

            <div className="flex-between">
              <div className="flex-gap-2">
                <button className="btn btn-outline btn-sm" style={{ color: 'var(--success)', borderColor: 'var(--success)', background: '#fff' }} onClick={handleAcceptTerms}>
                  <MS icon="check_circle" size={14} /> <span>Accept Terms</span>
                </button>
                <button className="btn btn-outline btn-sm" style={{ color: 'var(--warning)', borderColor: 'var(--warning)', background: '#fff' }} onClick={handleEscalate}>
                  <MS icon="gavel" size={14} /> <span>Escalate to Manager</span>
                </button>
              </div>
              <button className="btn btn-primary" onClick={handleSubmitRepCounter} disabled={submittingCounter}>
                {submittingCounter ? <div className="spin flex"><MS icon="sync" size={14} /></div> : <MS icon="send" size={14} />}
                <span>Submit Revised Counter</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (420px): Parameter Differential, Governance & Analytics */}
        <div className="flex-col gap-4">
          
          <div className="card card-body">
            <div className="flex-between" style={{ marginBottom: 12 }}>
              <h3 className="headline-sm" style={{ margin: 0 }}>Parameter Differential</h3>
              <span className="text-primary-color"><MS icon="tune" size={18} /></span>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>Term</th><th>Original</th><th>Counter</th><th>Delta</th></tr></thead>
                <tbody>
                  {negotiation?.parameterDiffs?.map((diff, idx) => (
                    <tr key={idx}>
                      <td className="font-semibold">{diff.field}</td>
                      <td className="body-sm">{diff.original}</td>
                      <td className="body-sm text-secondary-color font-bold">{diff.counter}</td>
                      <td className="data-mono-sm text-error font-bold">{diff.delta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {!customerPreview && (
            <div className="card card-body">
              <h3 className="headline-sm" style={{ marginBottom: 12 }}>Backend Margin & Deal Risk Pulse</h3>
              <div className="flex-col gap-2">
                <div className="flex-between compact-row" style={{ background: 'var(--surface-container-low)', padding: '10px 12px', borderRadius: 'var(--radius-md)', opacity: 1, border: '1px solid var(--border-color)' }}>
                  <span className="body-sm text-secondary">Original Gross Margin:</span>
                  <strong className="data-mono text-emerald">{formatPercent(negotiation?.originalTerms?.marginPercent)}</strong>
                </div>
                <div className="flex-between compact-row" style={{ background: 'var(--surface-container-low)', padding: '10px 12px', borderRadius: 'var(--radius-md)', opacity: 1, border: '1px solid var(--border-color)' }}>
                  <span className="body-sm text-secondary">Counter Offer Margin:</span>
                  <strong className="data-mono text-amber">36.8% (-7.4%)</strong>
                </div>
                <div className="flex-between compact-row" style={{ background: 'var(--surface-container-low)', padding: '10px 12px', borderRadius: 'var(--radius-md)', opacity: 1, border: '1px solid var(--border-color)' }}>
                  <span className="body-sm text-secondary">Deal Risk Score:</span>
                  <strong className="data-mono text-primary-color">24 / 100 (Low Risk)</strong>
                </div>
              </div>
            </div>
          )}

          <div className="card card-body">
            <div className="flex-between" style={{ marginBottom: 12 }}>
              <h3 className="headline-sm" style={{ margin: 0 }}>Governance & Reapproval Chain</h3>
              <span className="text-primary-color"><MS icon="verified_user" size={18} /></span>
            </div>

            <div style={{
              padding: 12, background: counterDiscount > 20 ? '#fef3c7' : '#e0f7f6', borderRadius: 'var(--radius-md)',
              fontSize: 12, color: counterDiscount > 20 ? '#92400e' : '#00696e', fontWeight: 600, marginBottom: 16,
              display: 'flex', gap: 6, alignItems: 'center'
            }}>
              <MS icon={counterDiscount > 20 ? "warning" : "check_circle"} size={16} />
              <span>{counterDiscount > 20 ? `Counter discount (${counterDiscount}%) exceeds Gold tier auto-approval (20%). Requires Manager Re-approval.` : 'Counter discount within auto-approval limits.'}</span>
            </div>

            <div className="flex-col gap-2">
              <div className="body-sm flex-gap-2">
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
                <span>Sales Rep Counter Submitted</span>
              </div>
              <div className="body-sm flex-gap-2">
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: counterDiscount > 20 ? 'var(--warning)' : 'var(--success)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
                <span>Sales Manager Re-approval ({counterDiscount > 20 ? 'Pending' : 'Waived'})</span>
              </div>
              <div className="body-sm flex-gap-2 text-muted">
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--surface-container-high)', color: 'var(--on-surface-variant)', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
                <span>Customer Final Signature</span>
              </div>
            </div>
          </div>

          <div className="card card-body flex-col gap-2">
            <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }} onClick={handleExportPdf}>
              <MS icon="download" size={16} /> <span>Export Negotiation Summary PDF</span>
            </button>
            <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/quotations')}>
              <MS icon="description" size={16} /> <span>Return to Quotations List</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
