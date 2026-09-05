import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle, AlertCircle, ArrowLeftRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function Negotiation() {
  const [messages, setMessages] = useState([
    {
      sender: 'Marcus Vance (Customer Procurement)',
      role: 'Customer',
      time: '10:14 AM',
      text: 'We are prepared to sign Quote #Q-2026-002 today if we can get a 22% discount on the Enterprise Cloud Servers instead of 18%.'
    },
    {
      sender: 'Sarah Jenkins (Sales Rep)',
      role: 'Sales Rep',
      time: '10:45 AM',
      text: 'Thank you Marcus! We submitted a 22% discount exception for Manager Approval. The VP of Sales approved it with 1-year prepaid terms. Revised quotation updated in your portal!'
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setMessages([
      ...messages,
      {
        sender: 'Sarah Jenkins (Sales Rep)',
        role: 'Sales Rep',
        time: 'Just now',
        text: inputMsg
      }
    ]);
    setInputMsg('');
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Deal Redlining & Negotiation Hub</h1>
          <p className="page-subtitle">Real-time collaborative counter-proposals, line-item feedback, and audit history with buyers.</p>
        </div>
      </div>

      <div className="grid-3" style={{ alignItems: 'start' }}>
        <div className="card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', height: '600px' }}>
          <div className="flex-between" style={{ borderBottom: 'var(--glass-border)', paddingBottom: '12px', marginBottom: '16px' }}>
            <div className="flex-gap-2">
              <MessageSquare size={18} color="var(--primary)" />
              <h3 className="section-title" style={{ margin: 0 }}>Quote #Q-2026-002 Negotiation Thread</h3>
            </div>
            <span className="badge badge-negotiating">Live Negotiation</span>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', paddingRight: '8px' }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  background: m.role === 'Customer' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                  border: `1px solid ${m.role === 'Customer' ? 'rgba(6, 182, 212, 0.25)' : 'rgba(99, 102, 241, 0.25)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px'
                }}
              >
                <div className="flex-between" style={{ marginBottom: '6px' }}>
                  <strong style={{ fontSize: '0.85rem', color: m.role === 'Customer' ? '#06b6d4' : 'var(--primary)' }}>
                    {m.sender}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.time}</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#fff', lineHeight: 1.5 }}>{m.text}</p>
              </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Type counter proposal, note or discount clarification..."
              className="input-field"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              <Send size={16} />
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* Counter Summary */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 className="section-title">Active Terms</h3>
          <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: 'var(--radius-md)', border: 'var(--glass-border)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Deal Target:</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>$142,000</div>
            <div style={{ fontSize: '0.85rem', color: '#10b981', marginTop: '6px' }}>Agreed Discount: 22%</div>
          </div>
          <button className="btn btn-success" onClick={() => alert('Counter proposal accepted! Quotation status updated to CUSTOMER_ACCEPTED.')}>
            <CheckCircle size={16} />
            <span>Accept Current Counter Terms</span>
          </button>
        </div>
      </div>
    </div>
  );
}
