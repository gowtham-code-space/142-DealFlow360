import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { MOCK_QUOTATIONS } from '../../utils/constants';
import { formatCurrency, formatPercent } from '../../utils/formatters';
// lucide icons removed if not used

export default function CustomerQuoteList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await api.getQuotations();
      if (res.success && Array.isArray(res.data)) {
        setQuotes(res.data);
      } else {
        setQuotes(MOCK_QUOTATIONS);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredQuotes = quotes.filter(q =>
    !searchTerm ||
    q.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.customerName && q.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Bar */}
      <div className="card" style={{ padding: '20px', background: '#fff', borderLeft: '4px solid #059669' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="page-title" style={{ margin: 0, fontSize: '1.4rem' }}>
              My Quotations & Proposals
            </h1>
            <p className="page-subtitle" style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>
              Review commercial quotes, inspect component pricing, and place corporate orders for {user?.name?.includes('(') ? user.name.split('(')[1].replace(')', '') : 'your organization'}.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="text"
              placeholder="Filter quote reference..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                padding: '6px 12px', borderRadius: 6,
                border: '1px solid rgba(209,195,202,0.4)', fontSize: '0.8rem', outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Quotes Table */}
      <div className="card" style={{ padding: '20px', background: '#fff' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--secondary-text)' }}>
            <span className="material-symbols-outlined spin" style={{ fontSize: 24, color: '#059669' }}>sync</span>
            <p style={{ marginTop: 8 }}>Loading customer quotes...</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Quote Ref</th>
                  <th>Configuration Title</th>
                  <th>Sales Executive</th>
                  <th>Contract Value</th>
                  <th>Corporate Discount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotes.map(q => (
                  <tr key={q.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/portal/quotes/${q.id}`)}>
                    <td style={{ fontWeight: 700, color: '#059669' }}>{q.id}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>
                        {q.quotationNumber || q.id}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--outline)' }}>Created: {q.createdAt || q.createdDate}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{q.repName || 'Alex Rivera'}</td>
                    <td style={{ fontWeight: 700, fontFeatureSettings: "'tnum'" }}>{formatCurrency(q.totalValue)}</td>
                    <td style={{ color: '#059669', fontWeight: 700 }}>{formatPercent(q.discountPercent)}</td>
                    <td>
                      <StatusBadge status={q.status} />
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={(e) => { e.stopPropagation(); navigate(`/portal/quotes/${q.id}`); }}
                        style={{ background: '#059669', borderColor: '#059669', padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        Inspect & Order
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
