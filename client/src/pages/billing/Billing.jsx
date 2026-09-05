import React, { useState } from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import MetricCard from '../../components/common/MetricCard';
import { Calendar, CreditCard, Download, CheckCircle2, RefreshCw, Plus } from 'lucide-react';

export default function Billing() {
  const [invoices] = useState([
    {
      id: 'INV-2026-089',
      quoteId: 'Q-2026-004',
      customer: 'Quantum Cloud Logistics',
      billingType: 'HYBRID',
      oneTimeAmount: 5280000,
      recurringAmount: 1800000,
      billingCycle: 'Annual',
      dueDate: '2026-09-30',
      status: 'PAID'
    },
    {
      id: 'INV-2026-090',
      quoteId: 'Q-2026-003',
      customer: 'Vanguard Retail Systems',
      billingType: 'ONE_TIME',
      oneTimeAmount: 2272000,
      recurringAmount: 0,
      billingCycle: 'N/A',
      dueDate: '2026-10-15',
      status: 'PENDING'
    },
    {
      id: 'INV-2026-091',
      quoteId: 'Q-2026-002',
      customer: 'Apex Global Technologies',
      billingType: 'HYBRID',
      oneTimeAmount: 6560000,
      recurringAmount: 3400000,
      billingCycle: 'Annual',
      dueDate: '2026-10-01',
      status: 'PENDING'
    }
  ]);

  const [subscriptions] = useState([
    {
      id: 'SUB-101',
      customer: 'Quantum Cloud Logistics',
      planName: '24/7 Mission Critical Support SLA',
      billingType: 'RECURRING_PREMIUM',
      recurringAmount: 1800000,
      billingCycle: 'Annual',
      nextRenewal: '2027-08-25',
      status: 'ACTIVE'
    },
    {
      id: 'SUB-102',
      customer: 'Nexus HyperScale Ltd',
      planName: 'DealFlow Platform SaaS License (50 Seats)',
      billingType: 'RECURRING_PREMIUM',
      recurringAmount: 1575000,
      billingCycle: 'Monthly',
      nextRenewal: '2026-10-02',
      status: 'ACTIVE'
    }
  ]);

  const handleUnavailableAction = (actionName) => {
    alert(`${actionName} action is read-only in dev mode. Backend billing API endpoint not connected.`);
  };

  const totalInvoiced = invoices.reduce((acc, i) => acc + i.oneTimeAmount + i.recurringAmount, 0);
  const totalARR = subscriptions.reduce((acc, s) => acc + s.recurringAmount, 0);

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
              onClick={() => handleUnavailableAction('Generate Invoice')}
              style={{ gap: 6 }}
            >
              <Plus size={16} />
              <span>Generate Customer Invoice</span>
            </button>
            <button
              className="btn btn-outline"
              onClick={() => handleUnavailableAction('Process Billing Cycle')}
              style={{ gap: 6 }}
            >
              <RefreshCw size={16} />
              <span>Run Billing Cycle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Billing KPI Metrics Ribbon */}
      <div className="grid-metrics">
        <MetricCard
          title="Total Contract Invoiced"
          value={formatCurrency(totalInvoiced)}
          change="Q3 Combined Invoiced Volume"
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
          value={formatCurrency(2272000)}
          change="Net-30 Due in 15 Days"
          isPositive={false}
          icon={Calendar}
          color="#f59e0b"
        />
        <MetricCard
          title="Active SaaS Subscriptions"
          value={`${subscriptions.length} Accounts`}
          change="100% On-time Billing"
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

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Quote Ref</th>
                    <th>Customer</th>
                    <th>Billing Type</th>
                    <th>Total Contract Amount</th>
                    <th>Schedule</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 700, color: '#7c3aed' }}>{inv.id}</td>
                      <td style={{ fontSize: '0.85rem' }}>{inv.quoteId}</td>
                      <td style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{inv.customer}</td>
                      <td>
                        <span style={{
                          fontSize: '0.75rem', padding: '2px 8px', borderRadius: 99, fontWeight: 700,
                          background: inv.billingType === 'HYBRID' ? 'rgba(124, 58, 237, 0.12)' : 'rgba(2, 132, 199, 0.12)',
                          color: inv.billingType === 'HYBRID' ? '#7c3aed' : '#0284c7'
                        }}>
                          {inv.billingType === 'HYBRID' ? 'HYBRID (ONE-TIME + RECURRING)' : 'ONE-TIME HARDWARE'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, fontFeatureSettings: "'tnum'" }}>
                        {formatCurrency(inv.oneTimeAmount + inv.recurringAmount)}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
                        {inv.recurringAmount > 0 ? `${formatCurrency(inv.recurringAmount)} / ${inv.billingCycle}` : 'One-Time'}
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>{formatDate(inv.dueDate)}</td>
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
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => alert(`Downloading PDF invoice for ${inv.id}`)}
                          style={{ padding: '4px 8px', fontSize: '0.75rem', gap: 4 }}
                        >
                          <Download size={13} />
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Subscriptions Breakdown */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 14px 0', color: 'var(--on-surface)' }}>
              Active Recurring Subscriptions & ARR Contracts
            </h3>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Sub ID</th>
                    <th>Customer</th>
                    <th>Subscription Plan</th>
                    <th>Billing Plan Type</th>
                    <th>Recurring Amount</th>
                    <th>Cycle</th>
                    <th>Next Renewal</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map(sub => (
                    <tr key={sub.id}>
                      <td style={{ fontWeight: 700, color: '#0284c7' }}>{sub.id}</td>
                      <td style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{sub.customer}</td>
                      <td style={{ fontSize: '0.85rem' }}>{sub.planName}</td>
                      <td>
                        <span className="badge" style={{ background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', fontSize: '0.7rem' }}>
                          {sub.billingType}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, fontFeatureSettings: "'tnum'" }}>{formatCurrency(sub.recurringAmount)}</td>
                      <td style={{ fontSize: '0.8rem' }}>{sub.billingCycle}</td>
                      <td style={{ fontSize: '0.8rem' }}>{formatDate(sub.nextRenewal)}</td>
                      <td>
                        <span className="badge badge-approved" style={{ fontSize: '0.7rem' }}>{sub.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                <div style={{ fontWeight: 700, color: 'var(--on-surface)' }}>BULK_ONE_TIME</div>
                <div style={{ color: 'var(--secondary-text)', marginTop: 2 }}>Bulk infrastructure orders with milestone billing.</div>
              </div>

              <div style={{ padding: '8px 10px', borderRadius: 6, background: 'var(--surface-container-low)' }}>
                <div style={{ fontWeight: 700, color: 'var(--on-surface)' }}>RECURRING_PREMIUM</div>
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

    </div>
  );
}
