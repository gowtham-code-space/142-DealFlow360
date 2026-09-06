import React, { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import MetricCard from '../../components/common/MetricCard';
import Modal from '../../components/common/Modal';
import { api } from '../../services/api';
import { Calendar, CreditCard, Download, CheckCircle2, RefreshCw, Plus, DollarSign } from 'lucide-react';

export default function Billing() {
  const [invoices, setInvoices] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState('');
  const [genSubmitting, setGenSubmitting] = useState(false);
  const [genError, setGenError] = useState(null);

  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [invRes, subRes, payRes, qRes] = await Promise.all([
        api.listInvoices({ pageSize: 100 }),
        api.listSubscriptions({ pageSize: 100 }),
        api.listPayments({ pageSize: 100 }),
        api.getQuotations({ pageSize: 100 })
      ]);

      if (invRes.success && Array.isArray(invRes.data)) setInvoices(invRes.data);
      if (subRes.success && Array.isArray(subRes.data)) setSubscriptions(subRes.data);
      if (payRes.success && Array.isArray(payRes.data)) setPayments(payRes.data);
      if (qRes.success && Array.isArray(qRes.data)) setQuotations(qRes.data);
    } catch (e) {
      console.error('[Billing] Failed to load live data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateInvoice = async () => {
    if (!selectedQuoteId) return;
    setGenSubmitting(true);
    setGenError(null);

    const res = await api.generateBilling(selectedQuoteId);
    if (res.success) {
      setIsGenModalOpen(false);
      setSelectedQuoteId('');
      await loadData();
    } else {
      setGenError(res.error || 'Failed to generate invoice for quote');
    }
    setGenSubmitting(false);
  };

  const handleRecordPayment = async () => {
    if (!selectedInvoiceForPayment || !paymentAmount) return;
    setPaymentSubmitting(true);
    setPaymentError(null);

    const res = await api.recordPayment(selectedInvoiceForPayment.id, {
      amount: Number(paymentAmount),
      method: paymentMethod,
      reference: paymentRef || `PAY-${Date.now().toString().slice(-6)}`
    });

    if (res.success) {
      setSelectedInvoiceForPayment(null);
      setPaymentAmount('');
      setPaymentRef('');
      await loadData();
    } else {
      setPaymentError(res.error || 'Failed to record payment');
    }
    setPaymentSubmitting(false);
  };

  const totalInvoiced = invoices.reduce((acc, i) => acc + Number(i.amount || i.amountDue || 0), 0);
  const totalARR = subscriptions.reduce((acc, s) => acc + Number(s.amountPerCycle || 0), 0);
  const pendingCollection = invoices
    .filter(i => i.status !== 'PAID' && i.status !== 'CANCELLED')
    .reduce((acc, i) => acc + Number(i.amountDue || i.amount || 0), 0);

  // Eligible quotes for billing generation
  const eligibleQuotes = quotations.filter(q => 
    ['APPROVED', 'CONFIRMED', 'FULFILLING', 'FULFILLED'].includes(q.status)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Header Bar */}
      <div className="card" style={{ padding: '20px', background: '#fff', borderLeft: '4px solid #7c3aed' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 className="page-title" style={{ margin: 0, fontSize: '1.4rem' }}>
                Hybrid Billing, Invoices & Subscriptions Engine
              </h1>
              <span className="badge" style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed', border: '1px solid rgba(124, 58, 237, 0.25)' }}>
                Order-to-Cash Console
              </span>
            </div>
            <p className="page-subtitle" style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>
              Unified management of one-time hardware purchases, recurring SaaS subscriptions, and hybrid contract billing schedules.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                setIsGenModalOpen(true);
                setGenError(null);
                setSelectedQuoteId(eligibleQuotes[0]?.id || '');
              }}
              style={{ gap: 6 }}
            >
              <Plus size={16} />
              <span>Generate Customer Invoice</span>
            </button>
            <button
              className="btn btn-outline"
              onClick={() => loadData()}
              style={{ gap: 6 }}
            >
              <RefreshCw size={16} />
              <span>Refresh Billing Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Billing KPI Metrics Ribbon */}
      <div className="grid-metrics">
        <MetricCard
          title="Total Contract Invoiced"
          value={formatCurrency(totalInvoiced)}
          change="Combined Invoiced Volume"
          isPositive={true}
          icon={CreditCard}
          color="#7c3aed"
        />
        <MetricCard
          title="Annual Recurring Revenue (ARR)"
          value={formatCurrency(totalARR)}
          change="Active Subscription Base"
          isPositive={true}
          icon={RefreshCw}
          color="#0284c7"
        />
        <MetricCard
          title="Pending Invoice Collection"
          value={formatCurrency(pendingCollection)}
          change="Outstanding Receivables"
          isPositive={false}
          icon={Calendar}
          color="#f59e0b"
        />
        <MetricCard
          title="Active SaaS Subscriptions"
          value={`${subscriptions.length} Accounts`}
          change="Active Recurring Contracts"
          isPositive={true}
          icon={CheckCircle2}
          color="#059669"
        />
      </div>

      {/* Main Content Grid: Invoices & Subscriptions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.3fr) minmax(0, 1fr)', gap: '20px' }}>
        
        {/* Left Column: Customer Invoices Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--on-surface)' }}>
                  Generated Customer Invoices
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
                  Invoices generated from approved quotations and active recurring contracts
                </span>
              </div>
              <span className="badge badge-approved">{invoices.length} Invoices Issued</span>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--secondary-text)' }}>
                <span className="material-symbols-outlined spin" style={{ fontSize: 24, color: '#7c3aed' }}>sync</span>
                <p style={{ marginTop: 8 }}>Loading billing invoices from database...</p>
              </div>
            ) : invoices.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--secondary-text)' }}>
                No invoices generated yet. Click "Generate Customer Invoice" to process billing.
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Quote Ref</th>
                      <th>Customer</th>
                      <th>Billing Type</th>
                      <th>Total Amount</th>
                      <th>Amount Due</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(inv => {
                      const invNumber = inv.invoiceNumber || inv.id;
                      const quoteNum = inv.quotation?.quotationNumber || inv.quotationId;
                      const customerName = inv.customer?.name || '—';
                      const amount = Number(inv.amount || 0);
                      const amountDue = Number(inv.amountDue || 0);

                      return (
                        <tr key={inv.id}>
                          <td style={{ fontWeight: 700, color: '#7c3aed' }}>{invNumber}</td>
                          <td style={{ fontSize: '0.85rem' }}>{quoteNum}</td>
                          <td style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{customerName}</td>
                          <td>
                            <span style={{
                              fontSize: '0.75rem', padding: '2px 8px', borderRadius: 99, fontWeight: 700,
                              background: inv.type === 'RECURRING' ? 'rgba(124, 58, 237, 0.12)' : 'rgba(2, 132, 199, 0.12)',
                              color: inv.type === 'RECURRING' ? '#7c3aed' : '#0284c7'
                            }}>
                              {inv.type}
                            </span>
                          </td>
                          <td style={{ fontWeight: 700, fontFeatureSettings: "'tnum'" }}>
                            {formatCurrency(amount)}
                          </td>
                          <td style={{ fontFeatureSettings: "'tnum'", color: amountDue > 0 ? '#b91c1c' : '#047857', fontWeight: 600 }}>
                            {formatCurrency(amountDue)}
                          </td>
                          <td style={{ fontSize: '0.8rem' }}>{formatDate(inv.dueDate || inv.createdAt)}</td>
                          <td>
                            <span style={{
                              fontSize: '0.75rem', padding: '3px 8px', borderRadius: 99, fontWeight: 700,
                              background: inv.status === 'PAID' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                              color: inv.status === 'PAID' ? '#047857' : '#a16207'
                            }}>
                              {inv.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              {inv.status !== 'PAID' && (
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => {
                                    setSelectedInvoiceForPayment(inv);
                                    setPaymentAmount(String(amountDue || amount));
                                    setPaymentError(null);
                                  }}
                                  style={{ padding: '3px 8px', fontSize: '0.75rem', gap: 2 }}
                                >
                                  <DollarSign size={13} />
                                  <span>Pay</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Active Subscriptions Breakdown */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 14px 0', color: 'var(--on-surface)' }}>
              Active Recurring Subscriptions & ARR Contracts
            </h3>

            {subscriptions.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--secondary-text)' }}>
                No active recurring subscriptions found in database.
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Sub ID</th>
                      <th>Customer</th>
                      <th>Plan</th>
                      <th>Recurring Amount</th>
                      <th>Cycle</th>
                      <th>Next Renewal</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map(sub => (
                      <tr key={sub.id}>
                        <td style={{ fontWeight: 700, color: '#0284c7' }}>{sub.id.slice(0, 8)}</td>
                        <td style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{sub.customer?.name || '—'}</td>
                        <td style={{ fontSize: '0.85rem' }}>{sub.plan?.name || 'SaaS Support SLA'}</td>
                        <td style={{ fontWeight: 700, fontFeatureSettings: "'tnum'" }}>{formatCurrency(sub.amountPerCycle)}</td>
                        <td style={{ fontSize: '0.8rem' }}>{sub.billingPeriod}</td>
                        <td style={{ fontSize: '0.8rem' }}>{formatDate(sub.nextBillingDate || sub.createdAt)}</td>
                        <td>
                          <span className="badge badge-approved" style={{ fontSize: '0.7rem' }}>{sub.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Billing Controls & Customer Billing Types */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Customer Billing Type Matrix */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--on-surface)' }}>
              Supported Order Billing Types
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.78rem' }}>
              <div style={{ padding: '8px 10px', borderRadius: 6, background: 'var(--surface-container-low)' }}>
                <div style={{ fontWeight: 700, color: 'var(--on-surface)' }}>ONE_TIME</div>
                <div style={{ color: 'var(--secondary-text)', marginTop: 2 }}>Single transaction hardware purchases (e.g. Cloud Server X1).</div>
              </div>

              <div style={{ padding: '8px 10px', borderRadius: 6, background: 'var(--surface-container-low)' }}>
                <div style={{ fontWeight: 700, color: 'var(--on-surface)' }}>RECURRING</div>
                <div style={{ color: 'var(--secondary-text)', marginTop: 2 }}>Annual/Monthly SaaS platform & support SLA recurring contracts.</div>
              </div>
            </div>
          </div>

          {/* Billing Engine Status */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 10px 0', color: 'var(--on-surface)' }}>
              Automated Proration & Invoicing
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--secondary-text)', margin: 0, lineHeight: 1.4 }}>
              Prorated subscription additions and Net 30 payment term schedules are calculated automatically upon quotation fulfillment.
            </p>
          </div>

        </div>

      </div>

      {/* Generate Invoice Modal */}
      <Modal
        isOpen={isGenModalOpen}
        onClose={() => setIsGenModalOpen(false)}
        title="Generate Customer Invoice"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {genError && (
            <div style={{ padding: '10px', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', color: '#b91c1c', fontSize: '0.85rem' }}>
              {genError}
            </div>
          )}

          <div className="input-group">
            <label className="input-label" style={{ fontWeight: 600 }}>Select Approved / Fulfilling Quotation</label>
            {eligibleQuotes.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--secondary-text)' }}>No eligible quotes found for invoice generation.</p>
            ) : (
              <select
                className="select-field"
                value={selectedQuoteId}
                onChange={(e) => setSelectedQuoteId(e.target.value)}
              >
                {eligibleQuotes.map(q => (
                  <option key={q.id} value={q.id}>
                    {q.quotationNumber || q.id} — {q.customer?.name || 'Customer'} ({formatCurrency(q.estimatedNetTotal || q.subtotal)})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
            <button className="btn btn-outline" onClick={() => setIsGenModalOpen(false)}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={handleGenerateInvoice}
              disabled={genSubmitting || !selectedQuoteId}
            >
              {genSubmitting ? 'Generating...' : 'Generate & Issue Invoice'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={Boolean(selectedInvoiceForPayment)}
        onClose={() => setSelectedInvoiceForPayment(null)}
        title={`Record Payment for Invoice: ${selectedInvoiceForPayment?.invoiceNumber || selectedInvoiceForPayment?.id}`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {paymentError && (
            <div style={{ padding: '10px', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', color: '#b91c1c', fontSize: '0.85rem' }}>
              {paymentError}
            </div>
          )}

          <div className="input-group">
            <label className="input-label" style={{ fontWeight: 600 }}>Payment Amount</label>
            <input
              type="number"
              className="input-field"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>

          <div className="input-group">
            <label className="input-label" style={{ fontWeight: 600 }}>Payment Method</label>
            <select
              className="select-field"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="BANK_TRANSFER">Bank Wire Transfer</option>
              <option value="CHECK">Check</option>
              <option value="ACH">ACH Direct Deposit</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label" style={{ fontWeight: 600 }}>Reference / Txn Hash (Optional)</label>
            <input
              type="text"
              className="input-field"
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              placeholder="E.g., WIRE-8849201"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
            <button className="btn btn-outline" onClick={() => setSelectedInvoiceForPayment(null)}>Cancel</button>
            <button
              className="btn btn-success"
              onClick={handleRecordPayment}
              disabled={paymentSubmitting || !paymentAmount}
              style={{ background: '#047857', borderColor: '#047857' }}
            >
              {paymentSubmitting ? 'Recording...' : 'Confirm & Save Payment'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
