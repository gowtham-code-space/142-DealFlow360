import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { formatCurrency, formatPercent, formatDate } from '../../utils/formatters';
import StatusBadge from '../../components/common/StatusBadge';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size }}>{icon}</span>
);

export default function QuoteList() {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadQuotes() {
      setLoading(true);
      const res = await api.getQuotations();
      if (res.success) setQuotations(res.data.items || []);
      setLoading(false);
    }
    loadQuotes();
  }, []);

  const filteredQuotations = quotations.filter(q => {
    const matchesTab =
      activeTab === 'ALL' ||
      (activeTab === 'DRAFT' && q.status === 'DRAFT') ||
      (activeTab === 'PENDING' && q.status === 'PENDING_APPROVAL') ||
      (activeTab === 'APPROVED' && q.status === 'APPROVED') ||
      (activeTab === 'NEGOTIATION' && q.status === 'CUSTOMER_NEGOTIATION');

    const matchesSearch =
      (q.quotationNumber || q.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.customer?.name || q.customerName || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="flex-col gap-4">
      {/* Header Bar */}
      <div className="flex-between">
        <div>
          <h1 className="headline-lg" style={{ margin: 0 }}>Active Pipeline / My Quotes</h1>
          <p className="body-md text-secondary" style={{ margin: 0 }}>Manage customer quotes, monitor backend verdicts, and track negotiation states</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/quotations/new')}>
          <MS icon="add_circle" size={16} />
          <span>Create New Quote</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="card card-body flex-between">
        <div className="tab-bar">
          {[
            { id: 'ALL', label: 'All Quotes' },
            { id: 'PENDING', label: 'Pending Approval' },
            { id: 'NEGOTIATION', label: 'In Negotiation' },
            { id: 'APPROVED', label: 'Approved' },
            { id: 'DRAFT', label: 'Drafts' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <MS icon="search" size={16} />
          </span>
          <input
            type="text"
            placeholder="Filter by Quote ID or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '32px', height: '36px' }}
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="spin flex-center"><MS icon="sync" size={24} /></div>
            <p style={{ marginTop: 8 }}>Loading sales quotes from backend...</p>
          </div>
        ) : filteredQuotations.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span style={{ opacity: 0.5, marginBottom: 8, display: 'inline-block' }}><MS icon="description" size={32} /></span>
            <p className="body-md font-semibold text-primary">No quotes match your filter criteria.</p>
            <p className="body-sm">Try clearing your search query or switching tabs.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Quote ID</th>
                  <th>Customer Name</th>
                  <th>Tier</th>
                  <th>Total Value</th>
                  <th>Discount %</th>
                  <th>Margin %</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotations.map(q => (
                  <tr key={q.id}>
                    <td className="data-mono font-semibold text-primary-color">{q.quotationNumber || q.id}</td>
                    <td>
                      <div className="font-semibold">{q.customer?.name || q.customerName}</div>
                      <div className="label-sm text-muted">Rep: {q.rep?.name || q.repName || 'Alex Rivera'}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: (q.customer?.tier || q.tier) === 'PLATINUM' ? '#6b21a8' : (q.customer?.tier || q.tier) === 'GOLD' ? '#854d0e' : '#475569' }}>
                        {q.customer?.tier || q.tier}
                      </span>
                    </td>
                    <td className="data-mono font-bold">{formatCurrency(q.estimatedNetTotal || q.totalValue)}</td>
                    <td className="data-mono">{formatPercent(q.marginPct !== undefined ? (q.discountTotal / (q.subtotal || 1) * 100) : q.discountPercent)}</td>
                    <td className={`data-mono font-semibold ${(q.marginPct || q.marginPercent) >= 35 ? 'text-emerald' : 'text-amber'}`}>
                      {formatPercent(q.marginPct || q.marginPercent)}
                    </td>
                    <td>
                      <StatusBadge status={q.status} />
                    </td>
                    <td className="body-sm text-secondary">{formatDate(q.createdAt || q.createdDate)}</td>
                    <td>
                      <div className="action-group">
                        <button className="btn-icon" title="View Details" onClick={() => navigate(`/quotations/${q.id}`)}>
                          <MS icon="open_in_new" size={16} />
                        </button>
                        {(q.status === 'CUSTOMER_NEGOTIATION' || q.status === 'RETURNED') && (
                          <button className="btn btn-secondary-teal btn-sm" style={{ padding: '4px 8px' }} title="Open Negotiation" onClick={() => navigate(`/negotiation/${q.id}`)}>
                            <MS icon="forum" size={14} />
                            <span>Negotiate</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
