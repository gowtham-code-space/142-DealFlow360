import React, { useState } from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Receipt, Calendar, CreditCard, Download, CheckCircle, RefreshCw } from 'lucide-react';

export default function Billing() {
  const [invoices] = useState([
    {
      id: 'INV-2026-089',
      quoteId: 'Q-2026-004',
      customer: 'Quantum Cloud Logistics',
      type: 'Mixed (One-Time + Subscription)',
      oneTimeAmount: 90000,
      recurringAmount: 6000,
      billingCycle: 'Annual',
      dueDate: '2026-09-30',
      status: 'PAID'
    },
    {
      id: 'INV-2026-090',
      quoteId: 'Q-2026-003',
      customer: 'Vanguard Retail Systems',
      type: 'One-Time Hardware',
      oneTimeAmount: 28400,
      recurringAmount: 0,
      billingCycle: 'N/A',
      dueDate: '2026-10-15',
      status: 'PENDING'
    }
  ]);

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Billing, Invoicing & Proration Engine</h1>
          <p className="page-subtitle">Unified management of mixed one-time hardware, recurring subscriptions, and mid-cycle prorations.</p>
        </div>
      </div>

      <div className="grid-metrics">
        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Invoiced (Q3)</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>$348,400</div>
          <span style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>↑ 22% vs Q2</span>
        </div>
        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Annual Recurring Revenue (ARR)</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>$174,000</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Active SaaS Contracts</span>
        </div>
        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Upcoming Prorated Renewals</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#06b6d4', marginTop: '4px' }}>6 Accounts</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Next 30 Days</span>
        </div>
      </div>

      <div className="card">
        <div className="flex-between" style={{ marginBottom: '16px' }}>
          <h3 className="section-title" style={{ margin: 0 }}>Generated Customer Invoices</h3>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Quote Ref</th>
                <th>Customer</th>
                <th>Contract Type</th>
                <th>One-Time Total</th>
                <th>Recurring Schedule</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{inv.id}</td>
                  <td>{inv.quoteId}</td>
                  <td style={{ fontWeight: 600 }}>{inv.customer}</td>
                  <td><span className="badge badge-draft">{inv.type}</span></td>
                  <td>{formatCurrency(inv.oneTimeAmount)}</td>
                  <td>{inv.recurringAmount > 0 ? `${formatCurrency(inv.recurringAmount)} / ${inv.billingCycle}` : '—'}</td>
                  <td>{formatDate(inv.dueDate)}</td>
                  <td>
                    <span className={`badge ${inv.status === 'PAID' ? 'badge-approved' : 'badge-pending'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => alert(`Downloading PDF for ${inv.id}`)}>
                      <Download size={14} />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
