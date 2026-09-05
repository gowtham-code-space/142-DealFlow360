import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { formatCurrency, formatPercent, formatDate } from '../../utils/formatters';
import StatusBadge from '../../components/common/StatusBadge';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size }}>{icon}</span>
);

export default function MyDeals() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadDeals() {
      setLoading(true);
      // Derive deals from existing quotation API data.
      const res = await api.getQuotations();
      if (res.success) setDeals(res.data);
      setLoading(false);
    }
    loadDeals();
  }, []);

  const filteredDeals = deals.filter(d => 
    d.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-col gap-4">
      {/* Header Bar */}
      <div className="flex-between">
        <div>
          <h1 className="headline-lg" style={{ margin: 0 }}>My Deals Overview</h1>
          <p className="body-md text-secondary" style={{ margin: 0 }}>Comprehensive view of all your quotes and deals in the pipeline</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/quotations/new')}>
          <MS icon="add_circle" size={16} />
          <span>New Deal / Quote</span>
        </button>
      </div>

      <div className="card card-body flex-between">
        <div style={{ position: 'relative', width: '320px' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <MS icon="search" size={16} />
          </span>
          <input
            type="text"
            placeholder="Search deals by ID or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '32px', height: '36px' }}
          />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="spin flex-center"><MS icon="sync" size={24} /></div>
            <p style={{ marginTop: 8 }}>Loading deals pipeline...</p>
          </div>
        ) : filteredDeals.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span style={{ opacity: 0.5, marginBottom: 8, display: 'inline-block' }}><MS icon="monetization_on" size={48} /></span>
            <h3 className="headline-md text-primary">No Deals Found</h3>
            <p className="body-md">Your active pipeline is currently empty or no deals match your search.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Deal / Quote ID</th>
                  <th>Customer</th>
                  <th>Total Value</th>
                  <th>Discount</th>
                  <th>Margin</th>
                  <th>Stage / Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.map(deal => (
                  <tr key={deal.id}>
                    <td className="data-mono font-semibold text-primary-color">{deal.id}</td>
                    <td>
                      <div className="font-semibold">{deal.customerName}</div>
                      <div className="label-sm text-muted">Tier: {deal.tier}</div>
                    </td>
                    <td className="data-mono font-bold">{formatCurrency(deal.totalValue)}</td>
                    <td className="data-mono">{formatPercent(deal.discountPercent)}</td>
                    <td className={`data-mono font-semibold ${deal.marginPercent >= 35 ? 'text-emerald' : 'text-amber'}`}>
                      {formatPercent(deal.marginPercent)}
                    </td>
                    <td>
                      <StatusBadge status={deal.status} />
                    </td>
                    <td className="body-sm text-secondary">{formatDate(deal.createdDate)}</td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => navigate(`/quotations/${deal.id}`)}>
                        <MS icon="open_in_new" size={14} /> View Details
                      </button>
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
