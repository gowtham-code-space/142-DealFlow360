import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, API_BASE_URL } from '../../services/api';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import StatusBadge from '../../components/common/StatusBadge';
import { io } from 'socket.io-client';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size }}>{icon}</span>
);

export default function Negotiation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [negotiation, setNegotiation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [resolvedQuoteId, setResolvedQuoteId] = useState(null);

  // Counter proposal inputs
  const [counterDiscount, setCounterDiscount] = useState(22);
  const [counterPaymentTerms, setCounterPaymentTerms] = useState('Net 45');

  // Backend Reapproval Evaluation State
  const [submittingCounter, setSubmittingCounter] = useState(false);
  const [_reapprovalState, setReapprovalState] = useState(null);

  // Customer-facing preview toggle
  const [customerPreview, setCustomerPreview] = useState(false);

  // Socket state
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    console.log(`[Quote] frontend identifier=${id || 'none'}`);
    async function loadNegotiation() {
      setLoading(true);
<<<<<<< Updated upstream
      const res = await api.getNegotiation(id);
      if (res.success) setNegotiation(res.data);
=======

      let targetId = id;
      if (!targetId) {
        // Automatically find active negotiation quote if navigated to bare /negotiation
        const qListRes = await api.getQuotations();
        if (qListRes.success && qListRes.data?.items?.length > 0) {
          const activeNeg = qListRes.data.items.find(q => q.status === 'CUSTOMER_NEGOTIATION' || q.status === 'RETURNED') || qListRes.data.items[0];
          if (activeNeg) {
            targetId = activeNeg.id;
            navigate(`/negotiation/${targetId}`, { replace: true });
            return;
          }
        }
      }

      if (!targetId) {
        setLoading(false);
        return;
      }

      const [quoteRes, ticketsRes, msgsRes] = await Promise.all([
        api.getQuotationById(targetId),
        api.getNegotiationTickets(targetId),
        api.getNegotiation(targetId)
      ]);

      if (quoteRes.success && quoteRes.data) {
        const q = quoteRes.data;
        const realId = q.id;
        setResolvedQuoteId(realId);

        const activeTicket = ticketsRes.success && ticketsRes.data?.length > 0 ? ticketsRes.data[0] : null;
        const msgs = msgsRes.success ? msgsRes.data : [];

        // Build composite negotiation object
        setNegotiation({
          quoteId: q.quotationNumber || q.id,
          realId: q.id,
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
            requestedTerms: 'Net 60'
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
>>>>>>> Stashed changes
      setLoading(false);
    }
    loadNegotiation();
  }, [id, navigate]);

  useEffect(() => {
    if (!resolvedQuoteId) return;

    const token = localStorage.getItem('dealflow_token');
    const socketUrl = API_BASE_URL.replace('/api/v1', '');
    const newSocket = io(socketUrl, {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket', newSocket.id);
      newSocket.emit('negotiation:join', { quoteId: resolvedQuoteId });
    });

    newSocket.on('negotiation:message:new', (newMsg) => {
      setNegotiation(prev => {
        if (!prev) return prev;
        
        // Prevent duplicate messages if already in state
        if (prev.messages.find(m => m.id === newMsg.id)) return prev;

        const formattedMsg = {
          id: newMsg.id,
          sender: newMsg.senderRole === 'CUSTOMER' ? 'customer' : 'rep',
          author: newMsg.senderRole === 'CUSTOMER' ? (prev.customerName || 'Customer') : 'Sales Representative',
          timestamp: new Date(newMsg.createdAt).toLocaleString(),
          text: newMsg.message
        };

        return {
          ...prev,
          messages: [...prev.messages, formattedMsg]
        };
      });
    });

    newSocket.on('negotiation:error', (err) => {
      console.error('Socket error:', err);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [resolvedQuoteId]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !resolvedQuoteId) return;
    setSendingMsg(true);
<<<<<<< Updated upstream
    const res = await api.sendNegotiationMessage(id, {
      sender: 'rep',
      author: 'Alex Rivera (Sales Rep)',
      text: messageText
    });
    if (res.success) {
      setMessageText('');
      const fresh = await api.getNegotiation(id);
      if (fresh.success) setNegotiation(fresh.data);
=======

    if (socket && socket.connected) {
      socket.emit('negotiation:message', {
        quoteId: resolvedQuoteId,
        message: messageText
      });
      setMessageText('');
    } else {
      // Fallback to REST
      const res = await api.sendNegotiationMessage(resolvedQuoteId, {
        senderRole: 'REP',
        message: messageText
      });
      if (res.success) {
        setMessageText('');
        const msgsRes = await api.getNegotiation(resolvedQuoteId);
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
>>>>>>> Stashed changes
    }
    setSendingMsg(false);
  };

  const handleSubmitRepCounter = async () => {
    setSubmittingCounter(true);
    const payload = {
      proposedDiscount: counterDiscount,
      proposedPaymentTerms: counterPaymentTerms
    };

    const res = await api.submitCounterOffer(id, payload);
    if (res.success) {
      setReapprovalState(res.data);

      await api.sendNegotiationMessage(id, {
        sender: 'rep',
        author: 'Alex Rivera (Sales Rep)',
        text: `Submitted revised counter-offer: ${counterDiscount}% discount with ${counterPaymentTerms} payment terms.`
      });

      const fresh = await api.getNegotiation(id);
      if (fresh.success) setNegotiation(fresh.data);
    }
    setSubmittingCounter(false);
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="spin flex-center"><MS icon="sync" size={24} /></div>
        <p style={{ marginTop: 8 }}>Loading Customer Negotiation Workspace...</p>
      </div>
    );
  }

  if (!negotiation) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <MS icon="error" size={36} />
        <p style={{ marginTop: 12, fontWeight: 600 }}>Quotation not found</p>
        <p style={{ fontSize: 13 }}>The requested quote could not be loaded. Please use a valid quotation link.</p>
        <button className="btn btn-outline btn-sm" style={{ marginTop: 16 }} onClick={() => navigate('/quotations')}>
          Back to Quotations
        </button>
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
                <span className="label-sm text-muted">Marcus Vance (VP Procurement, Apex Global)</span>
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
                <button className="btn btn-outline btn-sm" style={{ color: 'var(--success)', borderColor: 'var(--success)', background: '#fff' }} onClick={() => alert('Accept Terms API not yet implemented.')}>
                  <MS icon="check_circle" size={14} /> <span>Accept Terms</span>
                </button>
                <button className="btn btn-outline btn-sm" style={{ color: 'var(--warning)', borderColor: 'var(--warning)', background: '#fff' }} onClick={() => alert('Escalate to Manager API not yet implemented.')}>
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
            <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }} onClick={() => alert('Export PDF API not yet implemented.')}>
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
