import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { formatCurrency, formatPercent, formatDate } from '../../utils/formatters';
import StatusBadge from '../../components/common/StatusBadge';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size }}>{icon}</span>
);

export default function QuoteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    async function loadQuote() {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.getQuotationById(id);
      if (res.success) {
        setQuote(res.data);
      } else {
        setErrorMsg(res.error || 'Failed to fetch quotation details');
      }
      setLoading(false);
    }
    loadQuote();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="spin flex-center"><MS icon="sync" size={24} /></div>
        <p style={{ marginTop: 8 }}>Loading quotation details...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="card card-body flex-center flex-col" style={{ borderLeft: '4px solid var(--danger)', minHeight: 300 }}>
        <span className="text-error"><MS icon="warning" size={32} /></span>
        <h2 className="headline-md text-error" style={{ margin: '8px 0 4px' }}>API Error</h2>
        <p className="body-sm text-secondary">{errorMsg}</p>
        <button className="btn btn-outline" style={{ marginTop: 16 }} onClick={() => navigate('/quotations')}>
          Back to Quotations Pipeline
        </button>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="card card-body flex-center flex-col" style={{ minHeight: 300 }}>
        <h2 className="headline-md">Quote Not Found</h2>
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/quotations')}>
          Back to Quotes List
        </button>
      </div>
    );
  }

  const items = quote.items || quote.lineItems || [];

  return (
    <div className="flex-col gap-4">
      {/* Header Bar */}
      <div className="flex-between">
        <div className="flex-gap-3">
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/quotations')}>
            <MS icon="arrow_back" size={16} /> <span>Back</span>
          </button>
          <div>
            <div className="flex-gap-2 items-center">
              <h1 className="headline-lg" style={{ margin: 0 }}>Quote: {quote.id}</h1>
              <StatusBadge status={quote.status} />
            </div>
            <p className="body-sm text-secondary" style={{ margin: 0, marginTop: 4 }}>
              Created on {formatDate(quote.createdAt || quote.createdDate)} for {quote.customer?.name || quote.customerName}
            </p>
          </div>
        </div>

        {quote.status === 'CUSTOMER_NEGOTIATION' && (
          <button className="btn btn-secondary-teal" onClick={() => navigate(`/negotiation/${quote.id}`)}>
            <MS icon="forum" size={16} /> <span>Open Negotiation Hub</span>
          </button>
        )}
      </div>

      {/* Main Details Grid */}
      <div className="grid-3">
        {/* Left Column (2 spans): Customer & Line Items */}
        <div className="flex-col gap-4" style={{ gridColumn: 'span 2' }}>
          
          <div className="card card-body">
            <h3 className="headline-sm" style={{ marginBottom: 12 }}>Customer & Tier Intelligence</h3>
            <div className="grid-2">
              <div>
                <div className="label-sm text-muted">Customer Account</div>
                <div className="body-md font-bold">{quote.customer?.name || quote.customerName}</div>
                <div className="body-sm text-secondary">ID: {quote.customer?.id || quote.customerId || 'CUST-002'}</div>
              </div>
              <div>
                <div className="label-sm text-muted">Customer Tier Policy</div>
                <div className="body-md font-bold" style={{ color: (quote.customer?.tier || quote.tier) === 'PLATINUM' ? '#6b21a8' : 'var(--primary)' }}>
                  {quote.customer?.tier || quote.tier || 'GOLD'} TIER
                </div>
                <div className="body-sm text-secondary">
                  Max Policy Ceiling: {(quote.customer?.tier || quote.tier) === 'PLATINUM' ? '30%' : (quote.customer?.tier || quote.tier) === 'GOLD' ? '20%' : '10%'}
                </div>
              </div>
            </div>
          </div>

          <div className="card card-body">
            <h3 className="headline-sm" style={{ marginBottom: 12 }}>Quoted Line Items</h3>
            {items.length === 0 ? (
              <div className="flex-center flex-col" style={{ padding: 24, color: 'var(--text-muted)' }}>
                <span style={{ opacity: 0.5, marginBottom: 6 }}><MS icon="description" size={24} /></span>
                <p className="body-sm">No line items attached to this quotation record.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product / Service</th>
                      <th>Billing</th>
                      <th>Qty</th>
                      <th>List Price</th>
                      <th>Discount</th>
                      <th>Total Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      const qty = item.quantity || item.qty || 1;
                      const listPrice = item.unitListPrice || item.listPrice || item.price || 0;
                      const discount = item.cumulativeDiscountPct || item.discountPercent || item.discount || 0;
                      const lineTotal = item.netTotal || item.lineTotal || item.total || (listPrice * qty * (1 - discount / 100));

                      return (
                        <tr key={item.id || idx}>
                          <td>
                            <div className="font-semibold">{item.product?.name || item.productName || item.name || 'Custom Product'}</div>
                            <div className="label-sm text-muted">SKU: {item.product?.id || item.sku || item.productId || 'PRD-100'}</div>
                          </td>
                          <td className="body-sm text-secondary">{item.product?.productType || item.billingType || 'One-Time'}</td>
                          <td className="data-mono">{qty}</td>
                          <td className="data-mono">{formatCurrency(listPrice)}</td>
                          <td className="data-mono">{formatPercent(discount)}</td>
                          <td className="data-mono font-bold text-primary-color">{formatCurrency(lineTotal)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 span): Backend Verdict & Margins */}
        <div className="flex-col gap-4">
          <div className="card card-body">
            <h3 className="headline-sm" style={{ marginBottom: 12 }}>Backend Verdict & Policy</h3>
            
            <div style={{ marginBottom: 16 }}>
              <div className="label-sm text-muted" style={{ marginBottom: 4 }}>Discount Verdict</div>
              <StatusBadge status={quote.status} />
            </div>

            {quote.requiresApprovalReason || quote.approvalReason ? (
              <div style={{ padding: 12, background: '#fef3c7', borderRadius: 'var(--radius-sm)', color: '#92400e', marginBottom: 16, display: 'flex', gap: 6 }}>
                <MS icon="warning" size={16} />
                <span className="body-sm font-semibold">{quote.requiresApprovalReason || quote.approvalReason}</span>
              </div>
            ) : null}

            <div className="flex-col gap-2" style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
              <div className="flex-between">
                <span className="body-sm text-secondary">Contract Value:</span>
                <strong className="data-mono">{formatCurrency(quote.estimatedNetTotal || quote.totalValue)}</strong>
              </div>
              <div className="flex-between">
                <span className="body-sm text-secondary">Average Discount:</span>
                <strong className="data-mono">{formatPercent(quote.discountTotal !== undefined ? (quote.discountTotal / (quote.subtotal || 1)) * 100 : quote.discountPercent)}</strong>
              </div>
              <div className="flex-between">
                <span className="body-sm text-secondary">Backend Margin %:</span>
                <strong className={`data-mono ${(quote.marginPct || quote.marginPercent) >= 35 ? 'text-emerald' : 'text-amber'}`}>
                  {formatPercent(quote.marginPct || quote.marginPercent)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
