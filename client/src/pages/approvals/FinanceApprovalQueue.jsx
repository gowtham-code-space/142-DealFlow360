import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import { api } from '../../services/api';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import {
  ShieldAlert, CheckCircle, XCircle, CreditCard,
  Building2, Lock, RefreshCw, Search, ChevronDown,
  AlertTriangle, TrendingUp, Users,
} from 'lucide-react';

/* ── Inline KPI Card (avoids MetricCard's white-on-white value bug) ── */
function KpiCard({ title, value, sub, icon: Icon, accent, isWarning }) {
  return (
    <div style={{
      background    : '#fff',
      border        : '1px solid #e5e7eb',
      borderRadius  : 12,
      padding       : '20px 22px',
      display       : 'flex',
      flexDirection : 'column',
      gap           : 10,
      boxShadow     : '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{
          fontSize      : '0.72rem', fontWeight: 600, color: '#6b7280',
          letterSpacing : '0.04em', textTransform: 'uppercase',
        }}>
          {title}
        </span>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `${accent}18`, color: accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={18} />
        </div>
      </div>
      <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{
          fontSize: '0.73rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
          color: isWarning ? '#d97706' : '#10b981',
        }}>
          {sub}
        </div>
      )}
    </div>
  );
}

/* ── Status pill ── */
function StatusPill({ status }) {
  const map = {
    PENDING_CLEARANCE : { bg: 'rgba(234,179,8,0.12)',  color: '#a16207', label: 'Pending Clearance' },
    CREDIT_HOLD       : { bg: 'rgba(239,68,68,0.12)',  color: '#b91c1c', label: 'Credit Hold'       },
    CLEARED           : { bg: 'rgba(16,185,129,0.12)', color: '#047857', label: 'Cleared'            },
  };
  const cfg = map[status] || { bg: '#f3f4f6', color: '#6b7280', label: status };
  return (
    <span style={{
      fontSize: '0.7rem', padding: '3px 9px', borderRadius: 99,
      fontWeight: 700, background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  );
}

export default function FinanceApprovalQueue() {
  const [quotes,    setQuotes]    = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading,   setLoading]   = useState(true);

  const [searchTerm,     setSearchTerm]     = useState('');
  const [statusFilter,   setStatusFilter]   = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const [selectedQuote, setSelectedQuote] = useState(null);
  const [modalType,     setModalType]     = useState(null);
  const [financeNote,   setFinanceNote]   = useState('');
  const [actionError,   setActionError]   = useState(null);
  const [submitting,    setSubmitting]    = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [qRes, aRes, cRes] = await Promise.all([
        api.getQuotations({ pageSize: 100 }),
        api.getApprovals({ pageSize: 100 }),
        api.getCustomers(),
      ]);
      if (qRes.success && Array.isArray(qRes.data)) setQuotes(qRes.data);
      if (aRes.success && Array.isArray(aRes.data)) setApprovals(aRes.data);
      if (cRes.success && Array.isArray(cRes.data)) setCustomers(cRes.data);
    } catch (e) {
      console.error('[FinanceApprovalQueue] load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openModal = (e, quote, type) => {
    e.stopPropagation();
    setSelectedQuote(quote); setModalType(type); setFinanceNote(''); setActionError(null);
  };

  const submitDecision = async () => {
    if (!selectedQuote) return;
    setSubmitting(true); setActionError(null);
    const approval = approvals.find(a => a.quotationId === selectedQuote.id || a.quotation?.id === selectedQuote.id);
    try {
      if (!approval) { setActionError('No pending approval record found for this quote.'); setSubmitting(false); return; }
      let res;
      if (modalType === 'clear')     res = await api.approveQuote(approval.id, financeNote);
      else if (modalType === 'hold') res = await api.rejectQuote(approval.id, financeNote);
      else                           res = await api.returnQuote(approval.id, financeNote);
      if (res?.success === false) { setActionError(res.error || 'Action failed.'); return; }
      setSelectedQuote(null); setModalType(null); setFinanceNote('');
      await loadData();
    } catch (err) { setActionError(err.message); }
    finally { setSubmitting(false); }
  };

  const getStatus   = q => q.financeClearanceStatus || (q.discountPercent > 18 ? 'PENDING_CLEARANCE' : 'CLEARED');
  const getPriority = q => (q.discountPercent > 20 || Number(q.estimatedNetTotal || q.totalValue || 0) > 8_000_000) ? 'HIGH' : 'MEDIUM';

  const queueItems = quotes.filter(q => {
    const s = getStatus(q), p = getPriority(q), term = searchTerm.toLowerCase();
    return (
      (!searchTerm || q.id.toLowerCase().includes(term) ||
        (q.customerName && q.customerName.toLowerCase().includes(term)) ||
        (q.customer?.name && q.customer.name.toLowerCase().includes(term))) &&
      (statusFilter === 'ALL' || s === statusFilter) &&
      (priorityFilter === 'ALL' || p === priorityFilter)
    );
  });

  const pendingCount  = quotes.filter(q => getStatus(q) === 'PENDING_CLEARANCE').length;
  const totalExposure = quotes.reduce((acc, q) => acc + Number(q.estimatedNetTotal || q.totalValue || 0), 0);
  const clearedCount  = quotes.length - pendingCount;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Page Header */}
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderLeft: '4px solid #00696e',
        borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#111827' }}>
                Finance &amp; Operations — Clearance Queue
              </h1>
              <span style={{
                fontSize: '0.68rem', fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                background: 'rgba(0,105,110,0.1)', color: '#00696e',
                border: '1px solid rgba(0,105,110,0.2)', letterSpacing: '0.04em',
              }}>FINANCIAL CLEARANCE CONSOLE</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#6b7280' }}>
              Review credit risk, payment terms, revenue recognition limits, and issue operational financial clearance.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={loadData} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8,
              fontSize: '0.8rem', fontWeight: 600, border: '1px solid #d1d5db',
              background: '#fff', color: '#374151', cursor: 'pointer',
            }}><RefreshCw size={13} /> Refresh</button>
            <span style={{
              display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 600,
              padding: '7px 14px', borderRadius: 8, background: '#f9fafb',
              border: '1px solid #e5e7eb', color: '#374151',
            }}><Lock size={13} color="#00696e" /> Credit Ceiling Lock: Active</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KpiCard title="Pending Clearance"       value={pendingCount}              sub={<><AlertTriangle size={11} /> Requires Credit Audit</>}  icon={ShieldAlert} accent="#f59e0b" isWarning />
        <KpiCard title="Total Contract Exposure"  value={formatCurrency(totalExposure)} sub={<><TrendingUp size={11} /> Combined Deal Volume</>}      icon={CreditCard}  accent="#7c3aed" />
        <KpiCard title="Avg Credit Risk Score"    value="24.2 / 100"                sub={<><CheckCircle size={11} /> Low Risk Portfolio</>}        icon={Building2}   accent="#059669" />
        <KpiCard title="Cleared for Fulfillment" value={clearedCount}              sub={<><CheckCircle size={11} /> Order-to-Cash Ready</>}       icon={Users}       accent="#0284c7" />
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.4fr) minmax(0, 1fr)', gap: 20, alignItems: 'start' }}>

        {/* Left – Table */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>

          {/* Toolbar */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.93rem', fontWeight: 700, color: '#111827' }}>Financial &amp; Credit Clearance Queue</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>Quotations requiring credit checks, payment term review, or financial authorization</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ position: 'relative' }}>
                <Search size={12} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input type="text" placeholder="Quote, customer…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  style={{ padding: '6px 10px 6px 27px', borderRadius: 7, border: '1px solid #e5e7eb', fontSize: '0.77rem', outline: 'none', width: 175, color: '#374151' }} />
              </div>
              <div style={{ position: 'relative' }}>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  style={{ appearance: 'none', padding: '6px 24px 6px 10px', borderRadius: 7, border: '1px solid #e5e7eb', fontSize: '0.77rem', background: '#fff', color: '#374151', cursor: 'pointer', outline: 'none' }}>
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING_CLEARANCE">Pending Clearance</option>
                  <option value="CLEARED">Cleared</option>
                  <option value="CREDIT_HOLD">Credit Hold</option>
                </select>
                <ChevronDown size={11} style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
              </div>
              <div style={{ position: 'relative' }}>
                <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
                  style={{ appearance: 'none', padding: '6px 24px 6px 10px', borderRadius: 7, border: '1px solid #e5e7eb', fontSize: '0.77rem', background: '#fff', color: '#374151', cursor: 'pointer', outline: 'none' }}>
                  <option value="ALL">All Priorities</option>
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                </select>
                <ChevronDown size={11} style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#9ca3af' }}>
              <RefreshCw size={22} color="#00696e" />
              <p style={{ marginTop: 10, fontSize: '0.84rem' }}>Loading finance clearance queue…</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                    {['Quote Ref', 'Customer & Tier', 'Contract Value', 'Discount', 'Gross Margin', 'Credit Risk', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.69rem', fontWeight: 700, color: '#6b7280', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {queueItems.length === 0 ? (
                    <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>No financial clearance records match your current filters.</td></tr>
                  ) : queueItems.map((q, idx) => {
                    const status      = getStatus(q);
                    const priority    = getPriority(q);
                    const customerObj = customers.find(c => c.name === (q.customer?.name || q.customerName) || c.id === q.customerId) || null;
                    const value       = Number(q.estimatedNetTotal || q.totalValue || 0);
                    return (
                      <tr key={q.id}
                        style={{ borderBottom: '1px solid #f3f4f6', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
                        onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#fafafa'}
                      >
                        <td style={{ padding: '11px 14px', fontWeight: 700, color: '#00696e', whiteSpace: 'nowrap' }}>{q.quotationNumber || q.id}</td>
                        <td style={{ padding: '11px 14px' }}>
                          <div style={{ fontWeight: 600, color: '#111827', marginBottom: 3 }}>{q.customer?.name || q.customerName || '—'}</div>
                          {q.tier && <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(245,158,11,0.1)', color: '#92400e', letterSpacing: '0.04em' }}>{q.tier}</span>}
                        </td>
                        <td style={{ padding: '11px 14px', fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(value)}</td>
                        <td style={{ padding: '11px 14px', color: '#374151', fontVariantNumeric: 'tabular-nums' }}>{q.discountPercent != null ? formatPercent(q.discountPercent) : '—'}</td>
                        <td style={{ padding: '11px 14px', fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: q.marginPercent >= 35 ? '#047857' : '#d97706' }}>
                          {q.marginPercent != null ? formatPercent(q.marginPercent) : '—'}
                        </td>
                        <td style={{ padding: '11px 14px' }}>
                          {customerObj ? (
                            <><div style={{ fontSize: '0.73rem', fontWeight: 700, marginBottom: 2, color: customerObj.riskScore > 30 ? '#d97706' : '#047857' }}>{customerObj.riskScore} / 100</div>
                            <div style={{ fontSize: '0.68rem', color: '#9ca3af' }}>{formatCurrency(customerObj.creditLimit)} limit</div></>
                          ) : <span style={{ color: '#d1d5db', fontSize: '0.75rem' }}>—</span>}
                        </td>
                        <td style={{ padding: '11px 14px' }}>
                          <StatusPill status={status} />
                          {priority === 'HIGH' && <div style={{ marginTop: 4, fontSize: '0.62rem', fontWeight: 700, color: '#b91c1c', letterSpacing: '0.04em' }}>● HIGH PRIORITY</div>}
                        </td>
                        <td style={{ padding: '11px 14px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={e => openModal(e, q, 'clear')} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700, border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#047857', cursor: 'pointer' }}>
                              <CheckCircle size={12} /> Clear
                            </button>
                            <button onClick={e => openModal(e, q, 'hold')} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700, border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c', cursor: 'pointer' }}>
                              <XCircle size={12} /> Hold
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          {!loading && (
            <div style={{ padding: '9px 20px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', background: '#fafafa' }}>
              <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Showing {queueItems.length} of {quotes.length} quotations</span>
              <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{pendingCount} pending · {clearedCount} cleared</span>
            </div>
          )}
        </div>

        {/* Right – Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Guidelines */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '0.86rem', fontWeight: 700, color: '#111827' }}>Finance Clearance Guidelines</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { accent: '#059669', label: 'Auto-Clearance',      desc: 'Deals below ₹50L with margin ≥35% and risk score <30 auto-pass.' },
                { accent: '#d97706', label: 'Credit Limit Warning', desc: 'Contracts exceeding 80% of credit limit require Net-30 collateral.' },
                { accent: '#b91c1c', label: 'Hard Credit Hold',     desc: 'Unpaid invoices >60 days trigger mandatory freeze on new quotes.' },
              ].map(g => (
                <div key={g.label} style={{ padding: '10px 12px', borderRadius: 8, background: '#f9fafb', borderLeft: `3px solid ${g.accent}`, fontSize: '0.74rem', color: '#6b7280', lineHeight: 1.5 }}>
                  <strong style={{ color: '#111827', display: 'block', marginBottom: 2 }}>{g.label}</strong>
                  {g.desc}
                </div>
              ))}
            </div>
          </div>

          {/* Credit Exposure */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '0.86rem', fontWeight: 700, color: '#111827' }}>Customer Credit Exposure</h3>
            {customers.length === 0 ? (
              <div style={{ padding: '16px 0', textAlign: 'center', fontSize: '0.8rem', color: '#9ca3af' }}>Loading credit data…</div>
            ) : customers.slice(0, 8).map(c => {
              const pct = Math.min(100, Number(c.riskScore) * 2), isRisky = Number(c.riskScore) > 35;
              return (
                <div key={c.id} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: '0.77rem', fontWeight: 600, color: '#111827' }}>{c.name}</span>
                    <span style={{ fontSize: '0.68rem', color: '#9ca3af' }}>{formatCurrency(c.creditLimit)}</span>
                  </div>
                  <div style={{ height: 5, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: isRisky ? 'linear-gradient(90deg,#f59e0b,#d97706)' : 'linear-gradient(90deg,#34d399,#059669)', transition: 'width 0.4s' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                    <span style={{ fontSize: '0.65rem', color: isRisky ? '#d97706' : '#059669', fontWeight: 600 }}>Risk: {c.riskScore}/100</span>
                    <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>{c.paymentTerms || 'Net-30'}</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Decision Modal */}
      <Modal
        isOpen={Boolean(selectedQuote)}
        onClose={() => setSelectedQuote(null)}
        title={modalType === 'clear' ? `Financial Clearance — ${selectedQuote?.quotationNumber || selectedQuote?.id}` : `Flag Credit Hold — ${selectedQuote?.quotationNumber || selectedQuote?.id}`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#f9fafb', padding: '14px 16px', borderRadius: 10, border: '1px solid #e5e7eb', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
            {[['Customer', selectedQuote?.customer?.name || selectedQuote?.customerName || '—'],
              ['Contract Value', formatCurrency(selectedQuote?.estimatedNetTotal || selectedQuote?.totalValue)],
              ['Discount', `${selectedQuote?.discountPercent ?? '—'}%`],
              ['Gross Margin', `${selectedQuote?.marginPercent ?? '—'}%`],
            ].map(([label, val]) => (
              <div key={label}>
                <div style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 600, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>{val}</div>
              </div>
            ))}
          </div>

          {actionError && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.82rem', fontWeight: 600 }}>
              {actionError}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.77rem', fontWeight: 700, color: '#374151', marginBottom: 6 }}>Finance Rationale / Audit Memorandum</label>
            <textarea rows={3}
              placeholder={modalType === 'clear' ? 'E.g., Credit line verified. Approved Net-30 payment terms and financial release.' : 'E.g., Credit limit exceeded. Pending bank guarantee or upfront payment.'}
              value={financeNote} onChange={e => setFinanceNote(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.82rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box', color: '#374151' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 2 }}>
            <button onClick={() => setSelectedQuote(null)} style={{ padding: '8px 18px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, border: '1px solid #d1d5db', background: '#fff', color: '#374151', cursor: 'pointer' }}>Cancel</button>
            <button onClick={submitDecision} disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, background: modalType === 'clear' ? 'linear-gradient(135deg,#059669,#047857)' : 'linear-gradient(135deg,#ef4444,#b91c1c)', color: '#fff' }}>
              {submitting ? <><RefreshCw size={13} /> Processing…</> : modalType === 'clear' ? <><CheckCircle size={13} /> Confirm Financial Clearance</> : <><XCircle size={13} /> Confirm Credit Hold</>}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
      
