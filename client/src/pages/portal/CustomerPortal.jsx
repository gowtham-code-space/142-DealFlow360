import React, { useState } from 'react';
import PortalLayout from '../../layouts/PortalLayout';
import StatusBadge from '../../components/common/StatusBadge';
import { MOCK_QUOTATIONS } from '../../utils/constants';
import { formatCurrency, formatPercent, formatDate } from '../../utils/formatters';
import { CheckCircle2, MessageSquare, Download, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CustomerPortal() {
  const [quotes] = useState(MOCK_QUOTATIONS.filter(q => q.customerId === 'CUST-002'));
  const activeQuote = quotes[0] || MOCK_QUOTATIONS[0];

  return (
    <PortalLayout>
      <div style={{ marginBottom: '28px' }}>
        <div className="flex-between">
          <div>
            <h1 className="page-title">Welcome, Nexus HyperScale Procurement</h1>
            <p className="page-subtitle">Review, comment on line items, propose adjustments, or digitally accept your customized quotations.</p>
          </div>
          <span className="badge badge-gold">Gold Customer Tier</span>
        </div>
      </div>

      {/* Main Quote Showcase */}
      <div className="card" style={{ marginBottom: '28px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
        <div className="flex-between" style={{ borderBottom: 'var(--glass-border)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
            <div className="flex-gap-2">
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>Quotation #{activeQuote.id}</h2>
              <StatusBadge status={activeQuote.status} />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Created on {formatDate(activeQuote.createdDate)} by {activeQuote.repName}</span>
          </div>

          <div className="flex-gap-2">
            <Link to="/negotiation" className="btn btn-secondary btn-sm">
              <MessageSquare size={16} />
              <span>Request Changes / Counter</span>
            </Link>
            <button
              className="btn btn-success btn-sm"
              onClick={() => alert(`Quotation #${activeQuote.id} successfully accepted by Buyer! Order transitioning to Warehouse Fulfillment.`)}
            >
              <CheckCircle2 size={16} />
              <span>Accept & Sign Quotation</span>
            </button>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="grid-3" style={{ marginBottom: '20px' }}>
          <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: 'var(--radius-md)', border: 'var(--glass-border)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Proposal Amount</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>{formatCurrency(activeQuote.totalValue)}</div>
          </div>
          <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: 'var(--radius-md)', border: 'var(--glass-border)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Special Customer Discount</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>{formatPercent(activeQuote.discountPercent)} OFF</div>
          </div>
          <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: 'var(--radius-md)', border: 'var(--glass-border)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Payment & SLA Terms</span>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginTop: '8px' }}>Net-30 / SLA Tier 1</div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Qty</th>
                <th>Unit List Price</th>
                <th>Applied Discount</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>Enterprise Cloud Server X1 (Hardware)</td>
                <td>4</td>
                <td>{formatCurrency(12500)}</td>
                <td style={{ color: '#10b981' }}>22%</td>
                <td style={{ fontWeight: 700 }}>{formatCurrency(39000)}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>DealFlow SaaS Platform License (Annual)</td>
                <td>10</td>
                <td>{formatCurrency(450)}</td>
                <td style={{ color: '#10b981' }}>10%</td>
                <td style={{ fontWeight: 700 }}>{formatCurrency(4050)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </PortalLayout>
  );
}
