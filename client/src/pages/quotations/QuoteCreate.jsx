import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_CUSTOMERS, MOCK_PRODUCTS, CUSTOMER_TIERS } from '../../utils/constants';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { Plus, Trash2, Sparkles, ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react';

export default function QuoteCreate() {
  const navigate = useNavigate();
  const [selectedCustomerId, setSelectedCustomerId] = useState(MOCK_CUSTOMERS[1].id); // Nexus HyperScale (Gold)
  const [items, setItems] = useState([
    {
      productId: MOCK_PRODUCTS[0].id,
      name: MOCK_PRODUCTS[0].name,
      quantity: 4,
      unitListPrice: MOCK_PRODUCTS[0].listPrice,
      unitCostPrice: MOCK_PRODUCTS[0].costPrice,
      discountPercent: 22 // High discount triggering manager approval scenario
    },
    {
      productId: MOCK_PRODUCTS[2].id,
      name: MOCK_PRODUCTS[2].name,
      quantity: 10,
      unitListPrice: MOCK_PRODUCTS[2].listPrice,
      unitCostPrice: MOCK_PRODUCTS[2].costPrice,
      discountPercent: 10
    }
  ]);

  const selectedCustomer = MOCK_CUSTOMERS.find(c => c.id === selectedCustomerId) || MOCK_CUSTOMERS[0];
  const tierConfig = CUSTOMER_TIERS[selectedCustomer.tier] || CUSTOMER_TIERS.STANDARD;

  // Real-time calculations
  const totalListPrice = items.reduce((acc, item) => acc + (item.quantity * item.unitListPrice), 0);
  const totalFinalPrice = items.reduce((acc, item) => {
    const itemTotal = item.quantity * item.unitListPrice;
    const discountAmount = itemTotal * (item.discountPercent / 100);
    return acc + (itemTotal - discountAmount);
  }, 0);
  const totalCost = items.reduce((acc, item) => acc + (item.quantity * item.unitCostPrice), 0);
  const totalDiscountAmount = totalListPrice - totalFinalPrice;
  const overallDiscountPercent = totalListPrice > 0 ? (totalDiscountAmount / totalListPrice) * 100 : 0;
  const grossProfit = totalFinalPrice - totalCost;
  const grossMarginPercent = totalFinalPrice > 0 ? (grossProfit / totalFinalPrice) * 100 : 0;

  // Automated approval detection logic (Specified in PS)
  const requiresApproval = items.some(item => item.discountPercent > tierConfig.maxDiscount) || overallDiscountPercent > tierConfig.maxDiscount;

  const handleAddItem = (product) => {
    setItems([
      ...items,
      {
        productId: product.id,
        name: product.name,
        quantity: 1,
        unitListPrice: product.listPrice,
        unitCostPrice: product.costPrice,
        discountPercent: 5
      }
    ]);
  };

  const handleUpdateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = Number(value);
    setItems(updated);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAddUpsell = (upsellProduct) => {
    handleAddItem(upsellProduct);
  };

  const handleSubmitQuote = (e) => {
    e.preventDefault();
    alert(`Quotation created! ${requiresApproval ? 'Flagged for Sales Manager Approval.' : 'Ready for Customer Presentation.'}`);
    navigate('/quotations');
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">CPQ Engine — Create Quotation</h1>
          <p className="page-subtitle">Configure complex product packages, dynamic discount limits, and real-time margin simulations.</p>
        </div>
      </div>

      <form onSubmit={handleSubmitQuote}>
        <div className="grid-3" style={{ alignItems: 'start' }}>
          {/* Main Line Items Column (2 spans) */}
          <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Customer Information Card */}
            <div className="card">
              <h3 className="section-title">1. Customer Selection & Tier Rule</h3>
              <div className="grid-2">
                <div className="input-group">
                  <label className="input-label">Select Customer</label>
                  <select
                    className="select-field"
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                  >
                    {MOCK_CUSTOMERS.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.tier} Tier)
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ background: 'var(--bg-input)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: 'var(--glass-border)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div className="flex-between">
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Customer Tier:</span>
                    <span className={`badge badge-${selectedCustomer.tier.toLowerCase()}`}>{selectedCustomer.tier}</span>
                  </div>
                  <div className="flex-between" style={{ marginTop: '6px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Policy Max Allowed Discount:</span>
                    <strong style={{ color: 'var(--primary)' }}>{tierConfig.maxDiscount}% Max</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="card">
              <div className="flex-between" style={{ marginBottom: '14px' }}>
                <h3 className="section-title" style={{ margin: 0 }}>2. Quotation Line Items</h3>
                <div className="flex-gap-2">
                  <select
                    className="select-field"
                    style={{ width: 'auto', padding: '6px 12px', fontSize: '0.825rem' }}
                    onChange={(e) => {
                      const p = MOCK_PRODUCTS.find(prod => prod.id === e.target.value);
                      if (p) handleAddItem(p);
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>+ Add Catalog Product...</option>
                    {MOCK_PRODUCTS.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.listPrice)})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product / Service</th>
                      <th style={{ width: '80px' }}>Qty</th>
                      <th>List Price</th>
                      <th style={{ width: '100px' }}>Discount %</th>
                      <th>Net Total</th>
                      <th>Unit Margin</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      const lineTotal = item.quantity * item.unitListPrice * (1 - item.discountPercent / 100);
                      const unitCost = item.unitCostPrice;
                      const lineCost = item.quantity * unitCost;
                      const lineMargin = ((lineTotal - lineCost) / lineTotal) * 100;
                      const isOverDiscount = item.discountPercent > tierConfig.maxDiscount;

                      return (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600 }}>{item.name}</td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdateItem(idx, 'quantity', e.target.value)}
                              className="input-field"
                              style={{ padding: '6px 8px', textAlign: 'center' }}
                            />
                          </td>
                          <td>{formatCurrency(item.unitListPrice)}</td>
                          <td>
                            <div style={{ position: 'relative' }}>
                              <input
                                type="number"
                                min="0"
                                max="90"
                                value={item.discountPercent}
                                onChange={(e) => handleUpdateItem(idx, 'discountPercent', e.target.value)}
                                className="input-field"
                                style={{
                                  padding: '6px 8px',
                                  color: isOverDiscount ? '#ef4444' : '#fff',
                                  borderColor: isOverDiscount ? '#ef4444' : undefined,
                                  fontWeight: isOverDiscount ? 700 : 400
                                }}
                              />
                            </div>
                          </td>
                          <td style={{ fontWeight: 700 }}>{formatCurrency(lineTotal)}</td>
                          <td style={{ color: lineMargin > 30 ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                            {formatPercent(lineMargin)}
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Smart Upsell Recommendations (Specified in PS) */}
            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
              <div className="flex-between">
                <div className="flex-gap-3">
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>AI Upsell Suggestion</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Adding <strong>Optical Fiber SFP+ Tranceiver Pack</strong> increases overall deal margin by +2.4%.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddUpsell(MOCK_PRODUCTS[4])}
                  className="btn btn-secondary btn-sm"
                >
                  <Plus size={14} />
                  <span>Add Upsell Item</span>
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Summary & Approval Card (1 span) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={{ position: 'sticky', top: '84px' }}>
              <h3 className="section-title">Quotation Summary</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div className="flex-between" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <span>Gross List Price:</span>
                  <span>{formatCurrency(totalListPrice)}</span>
                </div>
                <div className="flex-between" style={{ fontSize: '0.875rem', color: '#ef4444' }}>
                  <span>Total Discount:</span>
                  <span>- {formatCurrency(totalDiscountAmount)} ({formatPercent(overallDiscountPercent)})</span>
                </div>
                <div className="flex-between" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <span>Cost of Goods (COGS):</span>
                  <span>{formatCurrency(totalCost)}</span>
                </div>
                <div className="flex-between" style={{ fontSize: '1rem', fontWeight: 700, borderTop: 'var(--glass-border)', paddingTop: '12px' }}>
                  <span>Final Deal Value:</span>
                  <span style={{ color: 'var(--primary)' }}>{formatCurrency(totalFinalPrice)}</span>
                </div>
                <div className="flex-between" style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                  <span>Simulated Gross Margin:</span>
                  <span style={{ color: grossMarginPercent > 35 ? '#10b981' : '#f59e0b' }}>{formatPercent(grossMarginPercent)}</span>
                </div>
              </div>

              {/* Automated Approval Notification Trigger */}
              {requiresApproval ? (
                <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '20px' }}>
                  <div className="flex-gap-2" style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.85rem' }}>
                    <ShieldAlert size={18} />
                    <span>Manager Approval Required</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#fca5a5', marginTop: '6px' }}>
                    One or more line discounts exceed the Gold Tier maximum allowed cap ({tierConfig.maxDiscount}%). System will auto-route to the Sales Manager approval queue.
                  </p>
                </div>
              ) : (
                <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '20px' }}>
                  <div className="flex-gap-2" style={{ color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>
                    <CheckCircle size={18} />
                    <span>Auto-Approved Policy Match</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#86efac', marginTop: '6px' }}>
                    All discounts are strictly within the {selectedCustomer.tier} Tier limit ({tierConfig.maxDiscount}%). Can be sent directly to customer.
                  </p>
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <span>{requiresApproval ? 'Submit for Manager Approval' : 'Create & Dispatch Quote'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
