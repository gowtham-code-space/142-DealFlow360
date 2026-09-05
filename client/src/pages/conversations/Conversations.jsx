import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size }}>{icon}</span>
);

export default function Conversations() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConversations() {
      setLoading(true);
      // Backend does not have a dedicated conversations API yet.
      // We will derive active conversations from quotations currently in CUSTOMER_NEGOTIATION state.
      const res = await api.getQuotations();
      if (res.success) {
        const activeNegotiations = res.data.filter(q => q.status === 'CUSTOMER_NEGOTIATION');
        setConversations(activeNegotiations);
      }
      setLoading(false);
    }
    loadConversations();
  }, []);

  return (
    <div className="flex-col gap-4">
      <div className="flex-between">
        <div>
          <h1 className="headline-lg" style={{ margin: 0 }}>Active Conversations & Negotiations</h1>
          <p className="body-md text-secondary" style={{ margin: 0 }}>Direct chat threads with customers currently in negotiation</p>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="spin flex-center"><MS icon="sync" size={24} /></div>
            <p style={{ marginTop: 8 }}>Fetching conversation threads...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span style={{ opacity: 0.5, marginBottom: 8, display: 'inline-block' }}><MS icon="forum" size={48} /></span>
            <h3 className="headline-md text-primary">No Active Conversations</h3>
            <p className="body-md">There are currently no active customer negotiations or direct chat threads.</p>
            <p className="body-sm text-secondary" style={{ marginTop: 8 }}>
              Note: The backend conversation-list endpoint is under construction. Currently displaying active negotiations from the quotations API.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer Account</th>
                  <th>Reference Deal</th>
                  <th>Value</th>
                  <th>Last Update</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {conversations.map(conv => (
                  <tr key={conv.id}>
                    <td>
                      <div className="font-semibold text-primary-color">{conv.customerName}</div>
                      <div className="label-sm text-muted">Tier: {conv.tier}</div>
                    </td>
                    <td className="data-mono font-semibold text-secondary">{conv.id}</td>
                    <td className="data-mono font-bold">{formatCurrency(conv.totalValue)}</td>
                    <td className="body-sm">{formatDate(conv.createdDate)}</td>
                    <td>
                      <span className="badge badge-negotiating">Awaiting Reply</span>
                    </td>
                    <td>
                      <button className="btn btn-secondary-teal btn-sm" onClick={() => navigate(`/negotiation/${conv.id}`)}>
                        <MS icon="forum" size={14} /> Open Chat
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
