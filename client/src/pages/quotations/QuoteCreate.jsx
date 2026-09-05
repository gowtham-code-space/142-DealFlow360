import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import StatusBadge, { VerdictBadge } from '../../components/common/StatusBadge';
import { useNotifications } from '../../context/NotificationContext';
import { ROLES } from '../../utils/constants';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size }}>{icon}</span>
);

export default function QuoteCreate() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  // Master Data
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected Customer & Metadata
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [validityDays, setValidityDays] = useState(30);

  // Line Items State
  const [lineItems, setLineItems] = useState([]);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Recommendations State
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    async function loadMasterData() {
      setLoading(true);
      const [cRes, pRes] = await Promise.all([
        api.getCustomers(),
        api.getProducts()
      ]);

      if (cRes.success && cRes.data?.items?.length > 0) {
        setCustomers(cRes.data.items);
        setSelectedCustomerId(cRes.data.items[0].id);
        setSelectedCustomer(cRes.data.items[0]);
      }

      if (pRes.success && pRes.data?.items?.length > 0) {
        setProducts(pRes.data.items);
        setLineItems([
          {
            id: `item-${Date.now()}`,
            productId: pRes.data.items[0].id,
            productName: pRes.data.items[0].name,
            sku: pRes.data.items[0].id,
            listPrice: pRes.data.items[0].listPrice,
            quantity: 4,
            discountPercent: 15,
            billingType: pRes.data.items[0].billingType
          }
        ]);
      }
      setLoading(false);
    }
    loadMasterData();
  }, []);

  const handleCustomerChange = (customerId) => {
    setSelectedCustomerId(customerId);
    const found = customers.find(c => c.id === customerId);
    setSelectedCustomer(found);
  };

  const handleItemChange = (id, field, value) => {
    setLineItems(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        if (field === 'productId') {
          const selectedProd = products.find(p => p.id === value);
          return {
            ...item,
            productId: value,
            productName: selectedProd.name,
            sku: selectedProd.id,
            listPrice: selectedProd.listPrice,
            billingType: selectedProd.billingType
          };
        }
        return { ...item, [field]: Number(value) || value };
      })
    );
  };

  const addLineItem = () => {
    if (products.length === 0) return;
    const defaultProd = products[0];
    const newItem = {
      id: `item-${Date.now()}`,
      productId: defaultProd.id,
      productName: defaultProd.name,
      sku: defaultProd.id,
      listPrice: defaultProd.listPrice,
      quantity: 1,
      discountPercent: 0,
      billingType: defaultProd.billingType
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (id) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const cloneLineItem = (itemToClone) => {
    const cloned = {
      ...itemToClone,
      id: `item-${Date.now()}`
    };
    setLineItems([...lineItems, cloned]);
  };

  const subtotal = lineItems.reduce((acc, item) => acc + item.listPrice * item.quantity, 0);
  const totalDiscountAmount = lineItems.reduce((acc, item) => {
    const itemSubtotal = item.listPrice * item.quantity;
    return acc + (itemSubtotal * (item.discountPercent / 100));
  }, 0);
  const netTotal = subtotal - totalDiscountAmount;
  const averageDiscountPercent = subtotal > 0 ? ((totalDiscountAmount / subtotal) * 100).toFixed(1) : 0;

  const handleSubmitQuote = async () => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Create Draft Quote
      const quotePayload = {
        customerId: selectedCustomer?.id,
        validUntil: new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString()
      };
      
      const quoteRes = await api.createQuotation(quotePayload);
      if (!quoteRes.success) {
        throw new Error(quoteRes.error || 'Failed to create quotation');
      }
      
      const quoteId = quoteRes.quote?.id || quoteRes.data?.id;

      // 2. Add Line Items
      for (const item of lineItems) {
        const lineRes = await api.addQuoteLine(quoteId, {
          productId: item.productId,
          quantity: item.quantity,
          discountPercent: item.discountPercent
        });
        if (!lineRes.success) {
          throw new Error(`Failed to add line item ${item.productName}: ${lineRes.error}`);
        }
      }

      // 3. Submit Quote (triggers backend discount engine and risk rules)
      const submitRes = await api.submitQuotation(quoteId);
      if (!submitRes.success) {
        throw new Error(submitRes.error || 'Failed to submit quotation for approval');
      }

      const returnedQuote = submitRes.quote || submitRes.data;

      if (returnedQuote.requiresApproval) {
        addNotification({
          recipientRole: ROLES.SALES_MANAGER,
          type: 'APPROVAL_REQUIRED',
          priority: 'ACTION_REQUIRED',
          title: 'Approval required',
          message: `Quote ${returnedQuote.quotationNumber || quoteId} requires your approval. Reason: ${returnedQuote.approvalReason}`,
          relatedEntity: 'quote',
          relatedId: quoteId,
          targetUrl: `/approvals/${quoteId}`
        });

        addNotification({
          recipientRole: ROLES.SALES_REP,
          type: 'QUOTE_SUBMITTED',
          priority: 'INFO',
          title: 'Quote submitted for approval',
          message: `Quote ${returnedQuote.quotationNumber || quoteId} is awaiting Manager review.`,
          relatedEntity: 'quote',
          relatedId: quoteId,
          targetUrl: `/quotations/${quoteId}`
        });
      }

      navigate(`/quotations/${quoteId}`);

    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleValidateDiscountLimitation = () => {
    alert("Backend Limitation: The backend currently lacks a read-only endpoint for discount evaluation without submitting the quote. Please 'Submit Quote' to evaluate.");
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="spin" style={{ display: 'inline-block', marginBottom: 8 }}><MS icon="sync" size={24} /></div>
        <p>Loading Quote Builder & Database References...</p>
      </div>
    );
  }

  return (
    <div className="flex-col gap-4">
      {/* Sticky Workspace Header */}
      <div className="card card-body flex-between">
        <div>
          <div className="flex-gap-2 items-center">
            <h1 className="headline-lg" style={{ margin: 0 }}>Create Quote Workspace</h1>
            <span className="badge badge-primary">Sales Rep CPQ</span>
          </div>
          <p className="body-sm text-muted" style={{ marginTop: 2, marginBottom: 0 }}>
            Configure SKUs and enter quantities to generate a customer proposal
          </p>
        </div>
        <div className="flex-gap-2">
          <button className="btn btn-outline" onClick={() => navigate('/quotations')}>Cancel</button>
          <button className="btn btn-primary" onClick={handleValidateDiscountLimitation} title="No read-only evaluation API">
            <MS icon="policy" size={16} />
            <span>Validate Policy & Discount</span>
          </button>
        </div>
      </div>

      {submitError && (
        <div className="card card-body" style={{ borderLeft: '4px solid var(--error)', background: 'var(--surface-container-low)' }}>
          <div className="flex-gap-2 text-error" style={{ marginBottom: 8, alignItems: 'center' }}>
            <MS icon="warning" size={24} />
            <h3 className="headline-md" style={{ margin: 0 }}>Submission Error</h3>
          </div>
          <p className="body-md" style={{ margin: 0, color: 'var(--text-secondary)' }}>{submitError}</p>
        </div>
      )}

      {/* Customer Intelligence Header */}
      <div className="card card-body">
        <div className="flex-between" style={{ marginBottom: 16 }}>
          <h2 className="headline-md" style={{ margin: 0 }}>1. Customer Intelligence & Quote Metadata</h2>
          <span className="label-sm text-muted">Backend Tier Policy Profile</span>
        </div>

        <div className="grid-3">
          <div className="input-group" style={{ margin: 0 }}>
            <label className="input-label">Select Customer Account</label>
            <select className="select-field" value={selectedCustomerId} onChange={(e) => handleCustomerChange(e.target.value)}>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.tier} Tier)</option>
              ))}
            </select>
          </div>

          <div style={{ background: 'var(--surface-container-low)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div className="label-sm text-muted">Customer Tier Policy</div>
            <div className="headline-sm text-primary-color" style={{ marginTop: 4 }}>{selectedCustomer?.tier} TIER</div>
            <div className="body-sm text-secondary" style={{ marginTop: 2 }}>
              Credit Limit: <strong>{selectedCustomer?.creditLimit != null ? formatCurrency(selectedCustomer.creditLimit) : 'N/A'}</strong> | Risk: <strong className={selectedCustomer?.riskScore == null ? "text-muted" : selectedCustomer.riskScore < 30 ? "text-emerald" : selectedCustomer.riskScore < 60 ? "text-warning" : "text-error"}>{selectedCustomer?.riskScore == null ? 'Unknown' : selectedCustomer.riskScore < 30 ? 'Low' : selectedCustomer.riskScore < 60 ? 'Medium' : 'High'} ({selectedCustomer?.riskScore != null ? selectedCustomer.riskScore : 'N/A'})</strong>
            </div>
          </div>

          <div className="input-group" style={{ margin: 0 }}>
            <label className="input-label">Quote Validity Period</label>
            <select className="select-field" value={validityDays} onChange={(e) => setValidityDays(Number(e.target.value))}>
              <option value={15}>15 Days Validity</option>
              <option value={30}>30 Days Validity (Standard)</option>
              <option value={60}>60 Days Validity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quoted Products */}
      <div className="card card-body">
        <div className="flex-between" style={{ marginBottom: 16 }}>
          <div>
            <h2 className="headline-md" style={{ margin: 0 }}>2. Quoted Products & Line Discount Builder</h2>
            <p className="body-sm text-muted" style={{ margin: 0 }}>Add SKUs, enter quantities, and specify item discount rates</p>
          </div>
          <button className="btn btn-outline" onClick={addLineItem}>
            <MS icon="add_circle" size={16} /> <span>Add Line Item</span>
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '32%' }}>Product / Service</th>
                <th style={{ width: '12%' }}>List Price</th>
                <th style={{ width: '10%' }}>Qty</th>
                <th style={{ width: '12%' }}>Discount %</th>
                <th style={{ width: '14%' }}>Unit Price</th>
                <th style={{ width: '12%' }}>Line Total</th>
                <th style={{ width: '8%', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item) => {
                const itemSubtotal = item.listPrice * item.quantity;
                const unitPriceAfterDiscount = item.listPrice * (1 - item.discountPercent / 100);
                const lineTotal = itemSubtotal * (1 - item.discountPercent / 100);

                return (
                  <tr key={item.id}>
                    <td>
                      <select className="select-field" value={item.productId} onChange={(e) => handleItemChange(item.id, 'productId', e.target.value)}>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                        ))}
                      </select>
                      <div className="body-sm text-muted" style={{ marginTop: 4 }}>
                        SKU: {item.sku}
                      </div>
                    </td>
                    <td className="data-mono font-semibold">{formatCurrency(item.listPrice)}</td>
                    <td>
                      <input type="number" min="1" className="input-field" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} style={{ textAlign: 'center' }} />
                    </td>
                    <td>
                      <div className="flex-gap-2">
                        <input type="number" min="0" max="90" className="input-field" value={item.discountPercent} onChange={(e) => handleItemChange(item.id, 'discountPercent', e.target.value)} style={{ textAlign: 'center' }} />
                        <span className="body-sm text-secondary">%</span>
                      </div>
                    </td>
                    <td className="data-mono">{formatCurrency(unitPriceAfterDiscount)}</td>
                    <td className="data-mono font-bold text-primary-color">{formatCurrency(lineTotal)}</td>
                    <td>
                      <div className="action-group justify-center">
                        <button className="btn-icon" title="Clone Item" onClick={() => cloneLineItem(item)}><MS icon="content_copy" size={16} /></button>
                        <button className="btn-icon text-error" title="Remove Item" onClick={() => removeLineItem(item.id)} disabled={lineItems.length === 1}><MS icon="delete" size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Layout: Financial Summary */}
      <div className="grid-quote-bottom" style={{ gridTemplateColumns: '1fr' }}>
        <div className="card flex-col justify-between" style={{ background: 'var(--surface-container-low)' }}>
          <div className="card-body">
            <h3 className="headline-sm" style={{ marginBottom: 16 }}>Financial Summary (Estimate)</h3>
            <div className="flex-col gap-3">
              <div className="flex-between">
                <span className="body-sm text-muted">Gross Subtotal</span>
                <span className="data-mono font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex-between">
                <span className="body-sm text-muted">Total Discount</span>
                <span className="data-mono font-semibold text-error">-{formatCurrency(totalDiscountAmount)} ({averageDiscountPercent}%)</span>
              </div>
              <div className="divider" />
              <div className="flex-between">
                <span className="body-md font-bold">Net Contract Value</span>
                <span className="headline-lg text-primary-color">{formatCurrency(netTotal)}</span>
              </div>
            </div>
          </div>
          
          <div className="card-body" style={{ background: 'rgba(255,255,255,0.5)', borderTop: '1px solid var(--border-color)' }}>
            <div className="flex-col gap-2">
              <button className="btn btn-primary" style={{ width: '100%', padding: '12px' }} onClick={handleSubmitQuote} disabled={submitting}>
                {submitting ? <div className="spin flex"><MS icon="sync" size={18} /></div> : <MS icon="send" size={18} />}
                <span>Submit Quote to Backend Engine</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
