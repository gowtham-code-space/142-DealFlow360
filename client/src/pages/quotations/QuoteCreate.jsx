import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import StatusBadge, { VerdictBadge } from '../../components/common/StatusBadge';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size }}>{icon}</span>
);

export default function QuoteCreate() {
  const navigate = useNavigate();

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

  // Backend Evaluation State
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [evaluationError, setEvaluationError] = useState(null);

  // Recommendations State
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    async function loadMasterData() {
      setLoading(true);
      const [cRes, pRes] = await Promise.all([
        api.getCustomers(),
        api.getProducts()
      ]);

      if (cRes.success && cRes.data.length > 0) {
        setCustomers(cRes.data);
        setSelectedCustomerId(cRes.data[1].id);
        setSelectedCustomer(cRes.data[1]);
      }

      if (pRes.success && pRes.data.length > 0) {
        setProducts(pRes.data);
        setLineItems([
          {
            id: 'item-1',
            productId: pRes.data[0].id,
            productName: pRes.data[0].name,
            sku: pRes.data[0].id,
            listPrice: pRes.data[0].listPrice,
            quantity: 4,
            discountPercent: 15,
            billingType: pRes.data[0].billingType
          },
          {
            id: 'item-2',
            productId: pRes.data[2].id,
            productName: pRes.data[2].name,
            sku: pRes.data[2].id,
            listPrice: pRes.data[2].listPrice,
            quantity: 50,
            discountPercent: 10,
            billingType: pRes.data[2].billingType
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
    setEvaluationResult(null);
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
    setEvaluationResult(null);
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
    setEvaluationResult(null);
  };

  const removeLineItem = (id) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter(item => item.id !== id));
    setEvaluationResult(null);
  };

  const cloneLineItem = (itemToClone) => {
    const cloned = {
      ...itemToClone,
      id: `item-${Date.now()}`
    };
    setLineItems([...lineItems, cloned]);
    setEvaluationResult(null);
  };

  const subtotal = lineItems.reduce((acc, item) => acc + item.listPrice * item.quantity, 0);
  const totalDiscountAmount = lineItems.reduce((acc, item) => {
    const itemSubtotal = item.listPrice * item.quantity;
    return acc + (itemSubtotal * (item.discountPercent / 100));
  }, 0);
  const netTotal = subtotal - totalDiscountAmount;
  const averageDiscountPercent = subtotal > 0 ? ((totalDiscountAmount / subtotal) * 100).toFixed(1) : 0;

  const handleEvaluateQuote = async () => {
    setEvaluating(true);
    setEvaluationError(null);
    const payload = {
      customerId: selectedCustomer?.id,
      tier: selectedCustomer?.tier,
      totalValue: netTotal,
      discountPercent: averageDiscountPercent,
      lineItems
    };

    const res = await api.evaluateDiscount(payload);
    if (res.success) {
      setEvaluationResult(res.data);
    } else {
      setEvaluationError(res.error || 'Discount Evaluation API unavailable');
      setEvaluationResult(null);
    }

    const recRes = await api.getRecommendations(selectedCustomer?.id, lineItems);
    if (recRes.success) {
      setRecommendations(recRes.data);
    }
    setEvaluating(false);
  };

  const handleAddRecommendation = (rec) => {
    const newItem = {
      id: `item-${Date.now()}`,
      productId: rec.productId,
      productName: rec.name,
      sku: rec.productId,
      listPrice: rec.recommendedPrice,
      quantity: 1,
      discountPercent: 5,
      billingType: 'ONE_TIME'
    };
    setLineItems([...lineItems, newItem]);
    setEvaluationResult(null);
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="spin" style={{ display: 'inline-block', marginBottom: 8 }}><MS icon="sync" size={24} /></div>
        <p>Loading Quote Builder & Discount Engine...</p>
      </div>
    );
  }

  return (
    <div className="flex-col gap-4">
      {/* Sticky Workspace Header */}
      <div className="card card-body flex-between">
        <div>
          <div className="flex-gap-2 items-center">
            <h1 className="headline-lg" style={{ margin: 0 }}>Create Quote & Discount Engine Workspace</h1>
            <span className="badge badge-primary">Sales Rep CPQ</span>
          </div>
          <p className="body-sm text-muted" style={{ marginTop: 2, marginBottom: 0 }}>
            Configure SKUs, request discounts, and evaluate real-time backend governance rules
          </p>
        </div>
        <div className="flex-gap-2">
          <button className="btn btn-outline" onClick={() => navigate('/quotations')}>Cancel</button>
          <button className="btn btn-primary" onClick={handleEvaluateQuote} disabled={evaluating}>
            {evaluating ? <div className="spin flex"><MS icon="sync" size={16} /></div> : <MS icon="policy" size={16} />}
            <span>Validate Policy & Discount</span>
          </button>
        </div>
      </div>

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
              Credit Limit: <strong>{formatCurrency(selectedCustomer?.creditLimit || 150000)}</strong> | Risk: <strong className="text-emerald">Low ({selectedCustomer?.riskScore || 20})</strong>
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
                        SKU: {item.sku} | Stock: <strong className="text-emerald">Available (East Depot)</strong>
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

      {/* Backend Policy Engine Result */}
      {evaluationError && (
        <div className="card card-body" style={{ borderLeft: '4px solid var(--error)', background: 'var(--surface-container-low)' }}>
          <div className="flex-gap-2 text-error" style={{ marginBottom: 8, alignItems: 'center' }}>
            <MS icon="warning" size={24} />
            <h3 className="headline-md" style={{ margin: 0 }}>Backend Engine Error</h3>
          </div>
          <p className="body-md" style={{ margin: 0, color: 'var(--text-secondary)' }}>{evaluationError}</p>
        </div>
      )}

      {evaluationResult && (
        <div className="card card-body" style={{ borderLeft: '4px solid var(--primary)', background: 'var(--surface-container-low)' }}>
          <div className="flex-between" style={{ marginBottom: 16 }}>
            <div className="flex-gap-2">
              <span className="text-primary-color"><MS icon="policy" size={20} /></span>
              <h3 className="headline-md" style={{ margin: 0 }}>3. Backend Policy Engine Verdict</h3>
            </div>
            <VerdictBadge verdict={evaluationResult.verdict} />
          </div>

          <div className="grid-3 gap-3">
            <div className="card card-body" style={{ background: '#fff' }}>
              <div className="label-sm text-muted">Backend Verdict</div>
              <div className="headline-sm text-primary-color" style={{ marginTop: 4 }}>{evaluationResult.verdict.replace(/_/g, ' ')}</div>
              {evaluationResult.requiresApprovalReason && (
                <div className="body-sm font-semibold text-amber" style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MS icon="warning" size={14} /> {evaluationResult.requiresApprovalReason}
                </div>
              )}
            </div>

            <div className="card card-body" style={{ background: '#fff' }}>
              <div className="label-sm text-muted" style={{ marginBottom: 6 }}>Approval Workflow Path</div>
              <div className="flex-col gap-1">
                {evaluationResult.approvalPath.map((step, idx) => (
                  <div key={idx} className="body-sm flex-gap-2">
                    <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{idx + 1}</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card card-body" style={{ background: '#fff' }}>
              <div className="label-sm text-muted">Gross Margin & Risk Score</div>
              <div className={`headline-lg ${evaluationResult.calculatedMarginPercent >= 35 ? 'text-emerald' : 'text-amber'}`} style={{ marginTop: 4 }}>
                {formatPercent(evaluationResult.calculatedMarginPercent)} Margin
              </div>
              <div className="body-sm text-secondary" style={{ marginTop: 4 }}>
                Risk Score: <strong>{evaluationResult.riskScore} ({evaluationResult.riskLevel})</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Layout: AI Recommendations and Summary Toolbar */}
      <div className="grid-quote-bottom">
        {/* Recommendations */}
        {recommendations.length > 0 ? (
          <div className="card card-body">
            <div className="flex-gap-2" style={{ marginBottom: 12 }}>
              <span className="text-secondary-color"><MS icon="auto_awesome" size={18} /></span>
              <h3 className="headline-sm" style={{ margin: 0 }}>Recommended Cross-Sells (Backend AI)</h3>
            </div>
            <div className="flex-col gap-2">
              {recommendations.map(rec => (
                <div key={rec.id} className="compact-row" style={{ padding: '8px 12px', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', opacity: 1, border: '1px solid var(--border-color)' }}>
                  <div>
                    <div className="body-sm font-semibold">{rec.name}</div>
                    <div className="label-sm text-muted" style={{ marginTop: 2 }}>{rec.reason}</div>
                    <div className="data-mono-sm flex-gap-2" style={{ marginTop: 4 }}>
                      <span className="text-secondary-color font-bold">{rec.marginImpact}</span>
                      <span className="text-muted">|</span>
                      <span>Price: <strong>{formatCurrency(rec.recommendedPrice)}</strong></span>
                    </div>
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={() => handleAddRecommendation(rec)}>
                    <MS icon="add" size={14} /> Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : <div />}

        {/* Financial Summary & Actions Toolbar */}
        <div className="card flex-col justify-between" style={{ background: 'var(--surface-container-low)' }}>
          <div className="card-body">
            <h3 className="headline-sm" style={{ marginBottom: 16 }}>Financial Summary</h3>
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
              <button className="btn btn-primary" style={{ width: '100%', padding: '12px' }} onClick={async () => {
                const payload = {
                  customerId: selectedCustomer?.id,
                  customerName: selectedCustomer?.name,
                  tier: selectedCustomer?.tier,
                  totalValue: netTotal,
                  discountPercent: averageDiscountPercent,
                  lineItems
                };
                const res = await api.createQuotation(payload);
                if (res.success) {
                  navigate(`/quotations/${res.data.id}`);
                } else {
                  alert(res.error || 'Failed to submit quote. Backend endpoint may be unavailable.');
                }
              }}>
                <MS icon="send" size={18} /> <span>Submit Quote</span>
              </button>
              
              <div className="grid-2">
                <button className="btn btn-outline" onClick={() => { alert('Save Draft API not yet implemented.'); }}>
                  <MS icon="save" size={16} /> <span>Save Draft</span>
                </button>
                <button className="btn btn-secondary-teal" onClick={() => { alert('Request Negotiation API not yet implemented for new quotes.'); }}>
                  <MS icon="forum" size={16} /> <span>Request Negotiation</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
