import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { Download, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function CustomerInvoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([
    { id: 'INV-2026-089', orderId: 'ORD-2026-0041', date: '2026-09-03', dueDate: '2026-10-30', amount: 7680000, status: 'PENDING_PAYMENT' },
    { id: 'INV-2026-074', orderId: 'ORD-2026-0038', date: '2026-08-30', dueDate: '2026-09-30', amount: 2272000, status: 'PAID' },
    { id: 'INV-2026-051', orderId: 'ORD-2026-0024', date: '2026-08-15', dueDate: '2026-09-15', amount: 1280000, status: 'PAID' }
  ]);

  const [paySuccess, setPaySuccess] = useState(null);

  const handlePay = (invId) => {
    setInvoices(invoices.map(inv => inv.id === invId ? { ...inv, status: 'PAID' } : inv));
    setPaySuccess(invId);
    setTimeout(() => setPaySuccess(null), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card" style={{ padding: '20px', background: '#fff', borderLeft: '4px solid #059669' }}>
        <h1 className="page-title" style={{ margin: 0, fontSize: '1.4rem' }}>
          Billing, Invoices & Payment Gateway
        </h1>
        <p className="page-subtitle" style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>
          Verified tax invoices, ACH wire instructions, and corporate payment ledger for {user?.name?.includes('(') ? user.name.split('(')[1].replace(')', '') : 'your organization'}.
        </p>
      </div>

      {paySuccess && (
        <div style={{ padding: 12, borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', color: '#047857', fontWeight: 700 }}>
          ✅ Payment wire processed successfully for invoice {paySuccess}!
        </div>
      )}

      <div className="card" style={{ padding: '20px', background: '#fff' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 14px 0', color: 'var(--on-surface)' }}>
          Verified Tax Invoices & Statements
        </h3>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice Ref</th>
                <th>Order Ref</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Total Amount</th>
                <th>Payment Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 700, color: '#059669' }}>{inv.id}</td>
                  <td style={{ fontSize: '0.85rem' }}>{inv.orderId}</td>
                  <td>{inv.date}</td>
                  <td style={{ color: inv.status === 'PENDING_PAYMENT' ? '#b91c1c' : 'inherit', fontWeight: 600 }}>{inv.dueDate}</td>
                  <td style={{ fontWeight: 700, fontFeatureSettings: "'tnum'" }}>{formatCurrency(inv.amount)}</td>
                  <td>
                    <span className={`badge ${inv.status === 'PAID' ? 'badge-approved' : 'badge-pending'}`}>
                      {inv.status === 'PAID' ? 'PAID' : 'DUE OCT 30'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-outline btn-sm" style={{ padding: '3px 8px', fontSize: '0.72rem', gap: 4 }}>
                        <Download size={13} />
                        <span>PDF</span>
                      </button>
                      {inv.status === 'PENDING_PAYMENT' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handlePay(inv.id)}
                          style={{ background: '#059669', borderColor: '#059669', padding: '3px 8px', fontSize: '0.72rem', gap: 4 }}
                        >
                          <CreditCard size={13} />
                          <span>Pay ACH Wire</span>
                        </button>
                      )}
                    </div>
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
