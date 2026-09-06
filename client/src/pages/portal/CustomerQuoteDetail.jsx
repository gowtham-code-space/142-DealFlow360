import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
<<<<<<< Updated upstream
import { api } from '../../services/api';
=======
import { useAuth } from '../../context/AuthContext';
import { api, API_BASE_URL } from '../../services/api';
>>>>>>> Stashed changes
import { MOCK_QUOTATIONS, ROLES } from '../../utils/constants';
import { formatCurrency, formatPercent, formatDate } from '../../utils/formatters';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useNotifications } from '../../context/NotificationContext';
import { ShieldCheck, CheckCircle, Send, ArrowLeft } from 'lucide-react';
import { io } from 'socket.io-client';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

export default function CustomerQuoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
<<<<<<< Updated upstream
  const quoteId = id || 'Q-2026-002';
=======
  const { user } = useAuth();
  const quoteId = id;
>>>>>>> Stashed changes

  const [quote, setQuote] = useState(null);
  const [negotiation, setNegotiation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Counter Offer Form State
  const [counterDiscount, setCounterDiscount] = useState('25');
  const [counterTerms, setCounterTerms] = useState('Net 60');
  const [counterNote, setCounterNote] = useState('');
  const [submittingCounter, setSubmittingCounter] = useState(false);

  // Live Chat State
  const [chatInput, setChatInput] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [socket, setSocket] = useState(null);

  // Order Placement Modal State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [poNumber, setPoNumber] = useState('PO-NEXUS-2026-88');
  const [paymentMethod, setPaymentMethod] = useState('ACH');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    async function loadQuoteData() {
      setLoading(true);
      const res = await api.getQuotationById(quoteId);
      if (res.success && res.data) {
        setQuote(res.data);
      } else {
        // Don't fallback to mock data — show the real error
        console.error('Failed to load quotation:', res.error, 'quoteId:', quoteId);
        setQuote(null);
      }

      // Load negotiation / chat thread
      const negRes = await api.getNegotiation(quoteId);
      if (negRes.success && negRes.data) {
        setNegotiation({
          messages: negRes.data.map(m => ({
            id: m.id,
            sender: m.senderRole === 'CUSTOMER' ? 'customer' : 'rep',
            author: m.senderRole === 'CUSTOMER' ? 'You' : (res.data?.repName || 'Account Executive'),
            timestamp: new Date(m.createdAt).toLocaleString(),
            text: m.message
          }))
        });
      }
      setLoading(false);
    }
    loadQuoteData();
  }, [quoteId]);

  useEffect(() => {
    const token = localStorage.getItem('dealflow_token');
    const socketUrl = API_BASE_URL.replace('/api/v1', '');
    const newSocket = io(socketUrl, {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Customer portal connected to socket', newSocket.id);
      newSocket.emit('negotiation:join', { quoteId });
    });

    newSocket.on('negotiation:message:new', (newMsg) => {
      setNegotiation(prev => {
        if (!prev) return prev;
        
        // Prevent duplicate messages if already in state
        if (prev.messages?.find(m => m.id === newMsg.id)) return prev;

        const formattedMsg = {
          id: newMsg.id,
          sender: newMsg.senderRole === 'CUSTOMER' ? 'customer' : 'rep',
          author: newMsg.senderRole === 'CUSTOMER' ? 'You' : (prev.repName || 'Account Executive'),
          timestamp: new Date(newMsg.createdAt).toLocaleString(),
          text: newMsg.message
        };

        return {
          ...prev,
          messages: [...(prev.messages || []), formattedMsg]
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
  }, [quoteId]);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setSendingMsg(true);

<<<<<<< Updated upstream
    const msgPayload = {
      sender: 'customer',
      author: 'Marcus Vance (Nexus HyperScale)',
      text: chatInput.trim()
    };

    const res = await api.sendNegotiationMessage(quoteId, msgPayload);
    if (res.success) {
      const updatedNeg = await api.getNegotiation(quoteId);
      if (updatedNeg.success) setNegotiation(updatedNeg.data);
=======
    if (socket && socket.connected) {
      socket.emit('negotiation:message', {
        quoteId: quoteId,
        message: chatInput.trim()
      });
>>>>>>> Stashed changes
      setChatInput('');
    } else {
      // Fallback to REST
      const msgPayload = {
        senderRole: 'CUSTOMER',
        message: chatInput.trim()
      };
      
      const res = await api.sendNegotiationMessage(quoteId, msgPayload);
      if (res.success) {
        // Refresh chat
        const negRes = await api.getNegotiation(quoteId);
        if (negRes.success) {
          setNegotiation({
            messages: negRes.data.map(m => ({
              id: m.id,
              sender: m.senderRole === 'CUSTOMER' ? 'customer' : 'rep',
              author: m.senderRole === 'CUSTOMER' ? 'You' : (quote?.repName || 'Account Executive'),
              timestamp: new Date(m.createdAt).toLocaleString(),
              text: m.message
            }))
          });
        }
        setChatInput('');
      }
    }
    setSendingMsg(false);
  };

  // Mandatory Negotiation Declaration State
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [baseDepositAmount, setBaseDepositAmount] = useState('');

  const handleSubmitCounter = async (e) => {
    e.preventDefault();
    if (!declarationAccepted) {
      alert('You must review and accept the official negotiation declaration before submitting.');
      return;
    }
    setSubmittingCounter(true);
    const counterData = {
      requestedDiscountPct: Number(counterDiscount),
      comments: `${counterTerms ? `Terms: ${counterTerms}. ` : ''}${counterNote}`,
      declarationAccepted: true,
      basePaymentAmount: baseDepositAmount ? Number(baseDepositAmount) : null
    };

    const res = await api.negotiateQuote(quoteId, counterData);
    if (res.success) {
      setQuote(prev => ({
        ...prev,
        status: res.data?.status || 'CUSTOMER_NEGOTIATION',
        discountPercent: res.data?.newDiscountPercent || Number(counterDiscount)
      }));
      const updatedNeg = await api.getNegotiation(quoteId);
      if (updatedNeg.success) {
        setNegotiation({
          messages: updatedNeg.data.map(m => ({
            id: m.id,
            sender: m.senderRole === 'CUSTOMER' ? 'customer' : 'rep',
            author: m.senderRole === 'CUSTOMER' ? 'You' : (quote?.repName || 'Account Executive'),
            timestamp: new Date(m.createdAt).toLocaleString(),
            text: m.message
          }))
        });
      }

      // Notify Sales Rep & Manager
      addNotification({
        recipientRole: ROLES.SALES_REP,
        type: 'NEGOTIATION_REQUEST',
        priority: 'ACTION_REQUIRED',
        title: 'Customer requested changes with declaration',
        message: `Customer submitted a counter-offer for Quote ${quoteId}.`,
        relatedEntity: 'quote',
        relatedId: quoteId,
        targetUrl: `/negotiation/${quoteId}`
      });

      addNotification({
        recipientRole: ROLES.SALES_MANAGER,
        type: 'NEGOTIATION_REVIEW',
        priority: 'ACTION_REQUIRED',
        title: 'Negotiation requires review',
        message: `Customer submitted a counter-offer for Quote ${quoteId}.`,
        relatedEntity: 'quote',
        relatedId: quoteId,
        targetUrl: `/negotiation/${quoteId}`
      });
    } else {
      alert(res.error || 'Failed to submit counter-offer');
    }
    setSubmittingCounter(false);
  };

  const handleConfirmOrder = async () => {
    setPlacingOrder(true);
    
    // Call real internal payment confirmation API
    const payRes = await api.payQuoteDeposit(quoteId, {
      paymentMethod: paymentMethod || 'ACH',
      paymentReference: poNumber
    });

    if (payRes.success) {
      setQuote(prev => ({
        ...prev,
        status: 'CUSTOMER_ACCEPTED'
      }));
      setPlacingOrder(false);
      setOrderSuccess(true);

      addNotification({
        recipientRole: ROLES.SALES_REP,
        type: 'QUOTE_ACCEPTED',
        priority: 'SUCCESS',
        title: 'Quote accepted & deposit confirmed',
        message: `Customer authorized Quote ${quoteId} under PO ${poNumber}.`,
        relatedEntity: 'quote',
        relatedId: quoteId,
        targetUrl: `/quotations/${quoteId}`
      });

      addNotification({
        recipientRole: ROLES.OPERATIONS,
        type: 'ORDER_CREATED',
        priority: 'SUCCESS',
        title: 'Order created',
        message: `Order was created from Quote ${quoteId}.`,
        relatedEntity: 'order',
        relatedId: quoteId,
        targetUrl: '/inventory'
      });
    } else {
      // Fall back to confirm quote if deposit API handled via confirmation
      const confirmRes = await api.confirmQuote(quoteId);
      if (confirmRes.success) {
        setQuote(prev => ({ ...prev, status: 'CUSTOMER_ACCEPTED' }));
        setOrderSuccess(true);
      } else {
        alert(payRes.error || confirmRes.error || 'Failed to confirm order authorization');
      }
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--secondary-text)' }}>
        <span className="material-symbols-outlined spin" style={{ fontSize: 28, color: '#059669' }}>sync</span>
        <p style={{ marginTop: 8 }}>Loading customer quote detail...</p>
      </div>
    );
  }

  if (!quote) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 36, color: 'var(--error)' }}>error</span>
        <p style={{ marginTop: 12, fontWeight: 600 }}>Quote not found</p>
        <p style={{ fontSize: 13 }}>The requested quotation could not be loaded from the database.</p>
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/portal/quotes')}>
          Back to My Quotes
        </button>
      </div>
    );
  }

  const items = quote?.items || [];
  const totalVal = Number(quote?.totalValue || 11360000);
  const isAccepted = quote?.status === 'CUSTOMER_ACCEPTED' || quote?.status === 'FULFILLED';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner Navigation */}
      <div className="card" style={{ padding: '16px 20px', background: '#fff', borderLeft: '4px solid #059669' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/portal/quotes')} style={{ padding: '6px 12px' }}>
              <ArrowLeft size={14} />
              <span>Back to Quotes</span>
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 className="page-title" style={{ margin: 0, fontSize: '1.3rem' }}>
                  {quote?.id === 'Q-2026-002' ? 'Enterprise Server Fleet & AI Acceleration Architecture' : `Quotation ${quote?.id}`}
                </h1>
                <StatusBadge status={quote?.status} />
              </div>
              <p className="page-subtitle" style={{ margin: '4px 0 0 0', fontSize: '0.8rem' }}>
                Customer Portal • Quote Reference: <strong style={{ color: 'var(--primary)' }}>{quote?.id}</strong> • Created for <strong>Nexus HyperScale Ltd</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {!isAccepted && (
              <button
                className="btn btn-primary"
                onClick={() => setIsOrderModalOpen(true)}
                style={{ background: '#059669', borderColor: '#059669', gap: 6, fontWeight: 700 }}
              >
                <CheckCircle size={16} />
                <span>Confirm & Place Order</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Procurement Window Lifecycle Progress Stepper */}
      <div className="card" style={{ padding: '16px 20px', background: '#fff' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--outline)', textTransform: 'uppercase', marginBottom: 12 }}>
          Procurement Lifecycle Progress
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{
            position: 'absolute', top: 14, left: 30, right: 30, height: 3,
            background: 'var(--surface-container-highest)', zIndex: 0
          }} />

          {[
            { step: '1', title: 'Draft Created', date: 'Sep 02, 2026', done: true },
            { step: '2', title: 'Under Review', date: 'Sep 03, 2026', done: true },
            { step: '3', title: 'Approved & Sent', date: 'Sep 03, 2026', done: true },
            { step: '4', title: 'Customer Review', date: 'Active Now', current: !isAccepted, done: isAccepted },
            { step: '5', title: 'Order Placed', date: isAccepted ? 'Confirmed' : 'Pending', current: isAccepted, done: isAccepted }
          ].map((st, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, background: '#fff', padding: '0 8px' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: st.done ? '#059669' : st.current ? '#714b67' : 'var(--surface-container-high)',
                color: (st.done || st.current) ? '#fff' : 'var(--outline)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700
              }}>
                {st.done ? '✓' : st.step}
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: st.current ? 700 : 600, color: 'var(--on-surface)', marginTop: 4 }}>
                {st.title}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--outline)' }}>{st.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Detailed Workspace (2.2fr) vs Right Summary Panel (1fr) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.3fr) minmax(0, 1fr)', gap: '20px' }}>
        
        {/* Left Column: Solution Architecture Table + Counter Offer Form + Negotiation Chat */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Table: Approved Solution Architecture */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--on-surface)' }}>
                  Approved Solution Architecture & Line Items
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
                  {items.length} Component(s) included in this enterprise configuration
                </span>
              </div>
              <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>Gold Tier Approved</span>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item / Technical Spec</th>
                    <th>Billing</th>
                    <th>Qty</th>
                    <th>List Price</th>
                    <th>Net Unit Price</th>
                    <th>Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => {
                    const discount = it.discountPercent || quote?.discountPercent || 18;
                    const netUnit = it.listPrice ? (it.listPrice * (1 - discount / 100)) : (it.lineTotal / (it.quantity || 1));
                    return (
                      <tr key={idx}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--on-surface)' }}>{it.name}</div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--outline)' }}>SKU: {it.productId}</span>
                        </td>
                        <td>
                          <span className="badge badge-surface" style={{ fontSize: '0.7rem' }}>{it.billingType || 'One-Time'}</span>
                        </td>
                        <td style={{ fontWeight: 700 }}>{it.quantity}</td>
                        <td style={{ color: 'var(--outline)', textDecoration: 'line-through' }}>{formatCurrency(it.listPrice)}</td>
                        <td style={{ color: '#059669', fontWeight: 700 }}>{formatCurrency(netUnit)}</td>
                        <td style={{ fontWeight: 700, fontFeatureSettings: "'tnum'" }}>{formatCurrency(it.lineTotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Financial Totals Breakdown */}
            <div style={{
              display: 'flex', justifyContent: 'flex-end', marginTop: 16, paddingTop: 16,
              borderTop: '1px solid rgba(209,195,202,0.3)'
            }}>
              <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--secondary-text)' }}>
                  <span>Hardware Subtotal:</span>
                  <strong>{formatCurrency(totalVal * 0.7)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--secondary-text)' }}>
                  <span>Software & Support SLA:</span>
                  <strong>{formatCurrency(totalVal * 0.3)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--secondary-text)' }}>
                  <span>Est. Freight & Insurance:</span>
                  <span style={{ color: '#059669', fontWeight: 600 }}>INCLUDED</span>
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700,
                  color: 'var(--primary)', paddingTop: 8, borderTop: '2px solid var(--primary)'
                }}>
                  <span>Total Contract Value:</span>
                  <span>{formatCurrency(totalVal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form: Submit Counter-Offer or Requested Scope Adjustments */}
          {!isAccepted && (
            <div className="card" style={{ padding: '20px', background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <MS icon="handshake" size={20} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--on-surface)' }}>
                  Submit Counter-Offer or Requested Scope Adjustments
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', marginTop: 0, marginBottom: 16 }}>
                Request custom pricing, extended payment terms (Net 60), or line item modifications for sales management review.
              </p>

              <form onSubmit={handleSubmitCounter} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label className="input-label" style={{ fontWeight: 600, fontSize: '0.78rem' }}>
                    Requested Target Discount %
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    value={counterDiscount}
                    onChange={e => setCounterDiscount(e.target.value)}
                    placeholder="25"
                  />
                </div>

                <div>
                  <label className="input-label" style={{ fontWeight: 600, fontSize: '0.78rem' }}>
                    Requested Payment Terms
                  </label>
                  <select
                    className="select-field"
                    value={counterTerms}
                    onChange={e => setCounterTerms(e.target.value)}
                  >
                    <option value="Net 30">Net 30 Days (Standard)</option>
                    <option value="Net 60">Net 60 Days (Extended)</option>
                    <option value="Net 90">Net 90 Days (Enterprise)</option>
                  </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label" style={{ fontWeight: 600, fontSize: '0.78rem' }}>
                    Procurement Rationale / Note to Sales Representative
                  </label>
                  <textarea
                    rows="2"
                    className="textarea-field"
                    placeholder="E.g., We are ready to sign this fiscal quarter if discount is adjusted to 25% and terms extended to Net 60."
                    value={counterNote}
                    onChange={e => setCounterNote(e.target.value)}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label" style={{ fontWeight: 600, fontSize: '0.78rem' }}>
                    Optional Priority Deposit Payment (Base Amount)
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="Enter deposit amount to hold resource priority during negotiation (Optional)"
                    value={baseDepositAmount}
                    onChange={e => setBaseDepositAmount(e.target.value)}
                  />
                </div>

                <div style={{
                  gridColumn: '1 / -1', padding: '12px', borderRadius: 8,
                  background: 'rgba(5, 150, 105, 0.06)', border: '1px solid rgba(5, 150, 105, 0.25)',
                  display: 'flex', alignItems: 'flex-start', gap: 10
                }}>
                  <input
                    type="checkbox"
                    id="negotiationDeclaration"
                    checked={declarationAccepted}
                    onChange={e => setDeclarationAccepted(e.target.checked)}
                    style={{ marginTop: 3, width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <label htmlFor="negotiationDeclaration" style={{ fontSize: '0.78rem', color: 'var(--on-surface)', lineHeight: 1.4, cursor: 'pointer' }}>
                    <strong>Mandatory Negotiation Declaration:</strong> I hereby declare that this counter-offer request is submitted for official team review. I understand that final quote approval and resource allocation are subject to inventory re-verification upon review.
                  </label>
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    className="btn btn-outline"
                    disabled={submittingCounter || !declarationAccepted}
                    style={{ borderColor: declarationAccepted ? 'var(--primary)' : 'var(--outline)', color: declarationAccepted ? 'var(--primary)' : 'var(--outline)', gap: 6 }}
                  >
                    <MS icon="send" size={16} />
                    <span>{submittingCounter ? 'Submitting Counter-Offer...' : 'Submit Counter-Offer to Rep'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Customer & Rep Direct Conversation Thread */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <MS icon="forum" size={20} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--on-surface)' }}>
                Account Representative Communication Log
              </h3>
            </div>

            <div style={{
              display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '280px', overflowY: 'auto',
              padding: '12px', background: 'var(--surface-container-low)', borderRadius: 8,
              border: '1px solid rgba(209,195,202,0.3)', marginBottom: 14
            }}>
              {negotiation?.messages && negotiation.messages.length > 0 ? (
                negotiation.messages.map((msg, idx) => {
                  const isCust = msg.sender === 'customer';
                  return (
                    <div
                      key={idx}
                      style={{
                        alignSelf: isCust ? 'flex-end' : 'flex-start',
                        maxWidth: '82%',
                        background: isCust ? '#059669' : '#ffffff',
                        color: isCust ? '#ffffff' : 'var(--on-surface)',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: isCust ? 'none' : '1px solid rgba(209,195,202,0.4)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: '0.72rem', opacity: 0.85, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700 }}>{msg.author}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', lineHeight: 1.4 }}>{msg.text}</div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '16px', color: 'var(--secondary-text)', fontSize: '0.8rem' }}>
                  No messages exchanged yet. Use the message field below to communicate with Alex Rivera.
                </div>
              )}
            </div>

            <form onSubmit={handleSendChat} style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                className="input-field"
                placeholder="Type a message to your Account Executive (Alex Rivera)..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={sendingMsg || !chatInput.trim()}
                style={{ background: '#57344f', borderColor: '#57344f', gap: 4 }}
              >
                <Send size={15} />
                <span>Send</span>
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Investment Summary + Confirm Order + Account Team */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Card 1: Investment Summary */}
          <div className="card" style={{ padding: '20px', background: '#fff', borderTop: '4px solid #059669' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 14px 0', color: 'var(--on-surface)' }}>
              Investment Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--secondary-text)' }}>Hardware Subtotal:</span>
                <strong style={{ color: 'var(--on-surface)' }}>{formatCurrency(totalVal * 0.7)}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--secondary-text)' }}>Software & SLA:</span>
                <strong style={{ color: 'var(--on-surface)' }}>{formatCurrency(totalVal * 0.3)}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--secondary-text)' }}>Gold Tier Discount (18%):</span>
                <strong style={{ color: '#059669' }}>Included</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--secondary-text)' }}>Regional Freight & Tax:</span>
                <strong style={{ color: '#059669' }}>Included</strong>
              </div>

              <div style={{
                marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(209,195,202,0.3)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span style={{ fontWeight: 700, color: 'var(--on-surface)' }}>Total Contract:</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669' }}>
                  {formatCurrency(totalVal)}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Confirm & Place Order */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 10px 0', color: 'var(--on-surface)' }}>
              Confirm & Place Order
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--secondary-text)', marginTop: 0, marginBottom: 14 }}>
              Authorize this quote under DealFlow360 Executive Guild rules for immediate warehouse allocation.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="input-label" style={{ fontWeight: 600, fontSize: '0.75rem' }}>
                  Payment Method
                </label>
                <select
                  className="select-field"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  disabled={isAccepted}
                >
                  <option value="ACH">Direct ACH Corporate Wire</option>
                  <option value="NET30">Net 30 Corporate Invoicing</option>
                </select>
              </div>

              <div>
                <label className="input-label" style={{ fontWeight: 600, fontSize: '0.75rem' }}>
                  Customer PO Reference Number
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={poNumber}
                  onChange={e => setPoNumber(e.target.value)}
                  disabled={isAccepted}
                />
              </div>

              {!isAccepted ? (
                <button
                  className="btn btn-primary"
                  onClick={handleConfirmOrder}
                  disabled={placingOrder}
                  style={{
                    width: '100%', background: '#059669', borderColor: '#059669',
                    padding: '10px', fontSize: '0.85rem', fontWeight: 700, marginTop: 4
                  }}
                >
                  {placingOrder ? 'Processing Order Authorization...' : 'Confirm Quote & Place Order'}
                </button>
              ) : (
                <div style={{
                  padding: '12px', borderRadius: 8, background: 'rgba(16,185,129,0.1)',
                  border: '1px solid #10b981', color: '#047857', textAlign: 'center',
                  fontWeight: 700, fontSize: '0.85rem'
                }}>
                  ✅ Order Confirmed & Submitted to Fulfillment!
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Dedicated Account Team */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--on-surface)' }}>
              Dedicated Account Team
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
                }}>
                  AR
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--on-surface)' }}>Alex Rivera</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>Senior Account Executive</div>
                  <div style={{ fontSize: '0.72rem', color: '#059669' }}>alex.rivera@dealflow360.internal</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: '#0284c7',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
                }}>
                  SJ
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--on-surface)' }}>Sarah Jenkins</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>Fulfillment & Operations Lead</div>
                  <div style={{ fontSize: '0.72rem', color: '#0284c7' }}>sarah.jenkins@dealflow360.internal</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Support & SLA Status */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <ShieldCheck size={18} color="#059669" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--on-surface)' }}>
                SLA & Service Guarantee
              </h3>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--secondary-text)', lineHeight: 1.4 }}>
              Includes <strong>24/7 Mission Critical SLA Support</strong> with guaranteed 15-minute response for high-density cluster deployments.
            </div>
          </div>

        </div>
      </div>

      {/* Order Confirmation Modal */}
      <Modal
        isOpen={orderSuccess}
        onClose={() => setOrderSuccess(false)}
        title="Order Authorization Successful!"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'center', padding: '10px 0' }}>
          <div style={{
            width: 50, height: 50, borderRadius: '50%', background: 'rgba(16,185,129,0.15)',
            color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto'
          }}>
            <MS icon="check_circle" size={32} />
          </div>
          <h3 style={{ margin: 0, color: 'var(--on-surface)', fontSize: '1.1rem' }}>Order Placed & Warehouse Reserved</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', margin: 0 }}>
            Quotation <strong>{quote?.id}</strong> has been authorized for <strong>Nexus HyperScale Ltd</strong> under PO Reference <strong>{poNumber}</strong>.
          </p>
          <div style={{
            padding: 12, borderRadius: 8, background: 'var(--surface-container-low)',
            fontSize: '0.8rem', color: 'var(--on-surface-variant)', textAlign: 'left'
          }}>
            <div>• Warehouse Stock Allocation: <strong>Triggered (East Coast Hub)</strong></div>
            <div>• Billing Schedule: <strong>Net 30 Invoicing Generated</strong></div>
            <div>• Delivery ETA: <strong>October 2026</strong></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 8 }}>
            <button className="btn btn-primary" onClick={() => { setOrderSuccess(false); navigate('/portal/orders'); }}>
              View Orders & Tracking
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
