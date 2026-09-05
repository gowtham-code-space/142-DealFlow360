import React from 'react';
import { useParams, Link } from 'react-router-dom';
import StatusBadge from '../../components/common/StatusBadge';
import { MOCK_QUOTATIONS } from '../../utils/constants';
import { formatCurrency, formatPercent, formatDate } from '../../utils/formatters';
import { ArrowLeft, CheckCircle2, MessageSquare, Boxes, Receipt, Clock, UserCheck } from 'lucide-react';

export default function QuoteDetails() {
  const { id } = useParams();
  const quote = MOCK_QUOTATIONS.find(q => q.id === id) || MOCK_QUOTATIONS[0];

  const steps = [
    { title: 'Drafted', date: 'Sep 2, 2026', done: true },
    { title: 'Manager Review', date: 'Sep 3, 2026', done: quote.status !== 'DRAFT' },
    { title: 'Customer Negotiation', date: 'In Progress', done: ['CUSTOMER_NEGOTIATION', 'APPROVED', 'FULFILLED'].includes(quote.status) },
    { title: 'Order Fulfillment', date: 'Pending', done: quote.status === 'FULFILLED' },
    { title: 'Invoiced', date: 'Pending', done: quote.status === 'INVOICED' }
  ];

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '20px' }}>
        <div className="flex-gap-3">
          <Link to="/quotations" className="btn btn-secondary btn-sm">
            <ArrowLeft size={16} />
            <span>Back to Quotations</span>
          </Link>
          <h1 className="page-title">{quote.id} — {quote.customerName}</h1>
          <StatusBadge status={quote.status} />
        </div>

        <div className="flex-gap-2">
          <Link to="/negotiation" className="btn btn-secondary btn-sm">
            <MessageSquare size={16} />
            <span>Customer Redline</span>
          </Link>
          <Link to="/inventory" className="btn btn-primary btn-sm">
            <Boxes size={16} />
            <span>Allocate Inventory</span>
          </Link>
        </div>
      </div>

      {/* Lifecycle Progress Bar */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
          {steps.map((step, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: step.done ? 'var(--primary)' : 'var(--bg-elevated)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px',
                border: '2px solid',
                borderColor: step.done ? 'var(--primary)' : 'var(--border-color)',
                zIndex: 2
              }}>
                {step.done ? <CheckCircle2 size={16} /> : idx + 1}
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: step.done ? '#fff' : 'var(--text-muted)' }}>{step.title}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{step.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quote Summary Grid */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>FINANCIAL OVERVIEW</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
            {formatCurrency(quote.totalValue)}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#10b981', marginTop: '6px', fontWeight: 600 }}>
            Gross Margin: {formatPercent(quote.marginPercent)}
          </div>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>GOVERNANCE & POLICY</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginTop: '6px' }}>
            Discount: {formatPercent(quote.discountPercent)}
          </div>
          <div style={{ fontSize: '0.8rem', color: quote.requiresApprovalReason ? '#f59e0b' : 'var(--text-muted)', marginTop: '4px' }}>
            {quote.requiresApprovalReason || 'Standard Policy Compliant'}
          </div>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACCOUNT REP & RISK</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginTop: '6px' }}>
            {quote.repName}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Risk Profile: <span style={{ color: '#10b981', fontWeight: 600 }}>{quote.riskScore}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
