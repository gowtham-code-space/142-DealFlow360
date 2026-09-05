import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size }}>{icon}</span>
);

export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadCustomers() {
      setLoading(true);
      const res = await api.getCustomers();
      if (res.success) setCustomers(res.data);
      setLoading(false);
    }
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-col gap-4">
      {/* Header Bar */}
      <div className="flex-between">
        <div>
          <h1 className="headline-lg" style={{ margin: 0 }}>Customer Directory</h1>
          <p className="body-md text-secondary" style={{ margin: 0 }}>Manage accounts, view tier policies, and monitor credit risk</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/quotations/new')}>
          <MS icon="add_circle" size={16} />
          <span>New Quote</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="card card-body flex-between">
        <div style={{ position: 'relative', width: '320px' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <MS icon="search" size={16} />
          </span>
          <input
            type="text"
            placeholder="Search by customer name or ID..."
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
            <p style={{ marginTop: 8 }}>Loading customer accounts...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span style={{ opacity: 0.5, marginBottom: 8, display: 'inline-block' }}><MS icon="domain_disabled" size={32} /></span>
            <p className="body-md font-semibold text-primary">No customers found.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Account Name</th>
                  <th>Customer ID</th>
                  <th>Tier Policy</th>
                  <th>Credit Limit</th>
                  <th>Risk Score</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(c => (
                  <tr key={c.id}>
                    <td className="font-semibold text-primary-color">{c.name}</td>
                    <td className="data-mono text-secondary">{c.id}</td>
                    <td>
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: c.tier === 'PLATINUM' ? '#6b21a8' : c.tier === 'GOLD' ? '#854d0e' : '#475569' }}>
                        {c.tier}
                      </span>
                    </td>
                    <td className="data-mono">{formatCurrency(c.creditLimit)}</td>
                    <td>
                      <span className={`badge ${c.riskScore < 30 ? 'badge-approved' : c.riskScore < 60 ? 'badge-pending' : 'badge-danger'}`}>
                        {c.riskScore < 30 ? 'Low' : c.riskScore < 60 ? 'Medium' : 'High'} ({c.riskScore})
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-fulfilled">Active</span>
                    </td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => navigate('/quotations/new')}>
                        <MS icon="request_quote" size={14} /> Create Quote
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
