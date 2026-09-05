import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/common/StatusBadge';
import { MOCK_QUOTATIONS } from '../../utils/constants';
import { formatCurrency, formatPercent, formatDate } from '../../utils/formatters';
import { Plus, Search, Filter, ArrowUpDown } from 'lucide-react';

export default function QuoteList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredQuotes = MOCK_QUOTATIONS.filter(q => {
    const matchesSearch = q.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          q.repName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Quotation Lifecycle Management</h1>
          <p className="page-subtitle">Search, filter, and track all corporate quotations from creation to invoice.</p>
        </div>
        <Link to="/quotations/new" className="btn btn-primary">
          <Plus size={16} />
          <span>New Quote (CPQ)</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
        <div className="flex-between" style={{ gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by Quote ID, Customer Name, or Sales Rep..."
              className="input-field"
              style={{ paddingLeft: '36px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex-gap-2">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status:</span>
            <select
              className="select-field"
              style={{ width: 'auto', padding: '8px 12px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="CUSTOMER_NEGOTIATION">Customer Negotiation</option>
              <option value="FULFILLED">Fulfilled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quotation Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Quote ID</th>
                <th>Created</th>
                <th>Customer</th>
                <th>Tier</th>
                <th>Sales Rep</th>
                <th>Total Value</th>
                <th>Discount</th>
                <th>Margin</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.map(q => (
                <tr key={q.id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    <Link to={`/quotations/${q.id}`} style={{ textDecoration: 'underline' }}>{q.id}</Link>
                  </td>
                  <td>{formatDate(q.createdDate)}</td>
                  <td style={{ fontWeight: 600 }}>{q.customerName}</td>
                  <td><span className={`badge badge-${q.tier.toLowerCase()}`}>{q.tier}</span></td>
                  <td>{q.repName}</td>
                  <td style={{ fontWeight: 700 }}>{formatCurrency(q.totalValue)}</td>
                  <td style={{ color: q.discountPercent > 20 ? '#ef4444' : 'var(--text-primary)', fontWeight: 600 }}>
                    {formatPercent(q.discountPercent)}
                  </td>
                  <td style={{ color: '#10b981', fontWeight: 600 }}>{formatPercent(q.marginPercent)}</td>
                  <td><StatusBadge status={q.status} /></td>
                  <td>
                    <Link to={`/quotations/${q.id}`} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px' }}>
                      View
                    </Link>
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
