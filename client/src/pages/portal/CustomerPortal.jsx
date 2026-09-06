import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MetricCard from '../../components/common/MetricCard';
import StatusBadge from '../../components/common/StatusBadge';
import { api } from '../../services/api';
import { MOCK_QUOTATIONS } from '../../utils/constants';
import { formatCurrency, formatPercent } from '../../utils/formatters';
<<<<<<< Updated upstream
import { ShieldCheck, Truck, FileSpreadsheet, Award, CheckCircle, Clock } from 'lucide-react';
=======
import { ShieldCheck, Truck, FileSpreadsheet, Award, CheckCircle, Clock, ShoppingCart, Timer, ArrowRight, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
>>>>>>> Stashed changes

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

export default function CustomerPortal() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [resources, setResources] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Hold & Quote generation state
  const [activeHold, setActiveHold] = useState(null);
  const [holdTimer, setHoldTimer] = useState(0);
  const [isReserving, setIsReserving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadPortalData() {
      setLoading(true);
      const res = await api.getQuotations();
      if (res.success && Array.isArray(res.data)) {
<<<<<<< Updated upstream
        // Filter quotes for Nexus HyperScale (CUST-002 / Nexus)
        const nexusQuotes = res.data.filter(q =>
          q.customerId === 'CUST-002' || (q.customerName && q.customerName.includes('Nexus'))
=======
        const companyName = user?.name?.includes('(') ? user.name.split('(')[1].replace(')', '') : 'Corporate Account';
        const userQuotes = res.data.filter(q =>
          q.customerId === 'CUST-002' || (q.customerName && q.customerName.includes(companyName))
>>>>>>> Stashed changes
        );
        setQuotes(nexusQuotes.length > 0 ? nexusQuotes : res.data);
      } else {
        setQuotes(MOCK_QUOTATIONS);
      }

      const recRes = await api.getRecommendations('CUST-002');
      if (recRes.success && Array.isArray(recRes.data)) {
        setRecommendations(recRes.data);
      }

      const resList = await api.getPortalResources();
      if (resList.success && Array.isArray(resList.data)) {
        setResources(resList.data);
        const initQty = {};
        resList.data.forEach(r => { initQty[r.id] = 0; });
        setQuantities(initQty);
      }

      setLoading(false);
    }
    loadPortalData();
  }, [user]);

  // Countdown timer for active hold
  useEffect(() => {
    if (!activeHold?.expiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(activeHold.expiresAt) - new Date()) / 1000));
      setHoldTimer(remaining);
      if (remaining === 0) {
        setActiveHold(prev => (prev ? { ...prev, isExpired: true } : null));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeHold]);

  const handleQtyChange = (productId, qty) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, parseInt(qty, 10) || 0)
    }));
  };

  const handleReserveStock = async () => {
    setErrorMessage('');
    const selectedItems = Object.entries(quantities)
      .filter(([_, q]) => q > 0)
      .map(([productId, quantity]) => ({ productId, quantity }));

    if (selectedItems.length === 0) {
      setErrorMessage('Please select at least 1 product quantity to reserve stock.');
      return;
    }

    setIsReserving(true);
    const res = await api.createProductHolds(selectedItems);
    setIsReserving(false);

    if (res.success && res.data) {
      setActiveHold({
        ticketId: res.data.ticketId,
        items: res.data.items,
        expiresAt: res.data.expiresAt,
        isExpired: false
      });
      setHoldTimer(15 * 60);
    } else {
      setErrorMessage(res.error || res.message || 'Failed to place stock reservation.');
    }
  };

  const handleGenerateQuote = async () => {
    if (!activeHold?.ticketId) return;
    setIsGenerating(true);
    const res = await api.generateQuote({ ticketId: activeHold.ticketId });
    setIsGenerating(false);

    if (res.success && res.data?.id) {
      navigate(`/portal/quotes/${res.data.id}`);
    } else {
      setErrorMessage(res.error || res.message || 'Failed to generate quotation from hold.');
    }
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const activeQuotesCount = quotes.filter(q => q.status === 'PENDING_APPROVAL' || q.status === 'CUSTOMER_NEGOTIATION' || q.status === 'APPROVED').length;
  const totalVolume = quotes.reduce((acc, q) => acc + Number(q.totalValue || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Executive Welcome Header */}
      <div className="card" style={{ padding: '20px', background: '#fff', borderLeft: '4px solid #059669' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 className="page-title" style={{ margin: 0, fontSize: '1.4rem' }}>
                Welcome back, Marcus Vance
              </h1>
              <span className="badge badge-gold" style={{ background: 'rgba(5, 150, 105, 0.1)', color: '#059669', border: '1px solid rgba(5, 150, 105, 0.25)' }}>
                Nexus HyperScale Ltd • Gold Corporate Account
              </span>
            </div>
            <p className="page-subtitle" style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>
              Customer Procurement Command Center • Reserve inventory, request quotes, track orders & SLA.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="btn btn-outline" onClick={() => navigate('/portal/quotes')} style={{ gap: 6 }}>
              <MS icon="request_quote" size={18} />
              <span>View All Quotes ({quotes.length})</span>
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/portal/orders')} style={{ background: '#059669', borderColor: '#059669', gap: 6 }}>
              <MS icon="local_shipping" size={18} />
              <span>Track Orders & Fulfillment</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Procurement Metric Cards */}
      <div className="grid-metrics">
        <MetricCard
          title="Active Proposals & Quotes"
          value={activeQuotesCount}
          change="Ready for Review"
          isPositive={true}
          icon={FileSpreadsheet}
          color="#059669"
        />
        <MetricCard
          title="Active Orders In Progress"
          value="3"
          change="1 In Transit"
          isPositive={true}
          icon={Truck}
          color="var(--primary)"
        />
        <MetricCard
          title="Total Contract Value"
          value={formatCurrency(totalVolume || 18120000)}
          change="Gold Tier Rate Applied"
          isPositive={true}
          icon={Award}
          color="#7c3aed"
        />
        <MetricCard
          title="Outstanding Payable"
          value="₹0.00"
          change="All Payments Current"
          isPositive={true}
          icon={ShieldCheck}
          color="#10b981"
        />
      </div>

      {/* Active Stock Reservation Banner if Active */}
      {activeHold && (
        <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Timer color="#047857" size={24} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#065f46', fontWeight: 700 }}>
                  Active 15-Min Stock Reservation
                </h3>
                <span className="badge" style={{ background: '#047857', color: '#fff', fontSize: '0.75rem' }}>
                  {activeHold.isExpired ? 'EXPIRED' : 'ACTIVE HOLD'}
                </span>
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: '#047857' }}>
                Hold Ticket ID: <strong>{activeHold.ticketId}</strong> • Products are locked exclusively for your account.
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
                {activeHold.items?.map(h => (
                  <div key={h.holdId} style={{ background: '#fff', padding: '4px 10px', borderRadius: 6, fontSize: '0.8rem', border: '1px solid #a7f3d0' }}>
                    <strong>{h.productName || h.productId}</strong> × <strong>{h.quantityHeld}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {!activeHold.isExpired && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>RESERVED FOR</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#065f46', fontFamily: 'monospace' }}>
                    {formatTimer(holdTimer)}
                  </div>
                </div>
              )}
              <button
                className="btn btn-primary"
                onClick={handleGenerateQuote}
                disabled={isGenerating || activeHold.isExpired}
                style={{ background: '#047857', borderColor: '#047857', padding: '10px 20px', fontWeight: 700, gap: 8 }}
              >
                {isGenerating ? 'Generating Quote...' : 'Generate Quotation Now'}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Left Workspace (2.3fr) vs Right Panel (1fr) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.3fr) minmax(0, 1fr)', gap: '20px' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Catalog & Multi-Product Reservation Section */}
          <div className="card" style={{ padding: '20px', background: '#fff', borderTop: '4px solid #0284c7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShoppingCart color="#0284c7" size={20} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--on-surface)' }}>
                    Browse Catalog & Reserve Stock (Multi-Product Hold)
                  </h3>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
                  Select required product quantities for atomic inventory reservation
                </span>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleReserveStock}
                disabled={isReserving}
                style={{ background: '#0284c7', borderColor: '#0284c7', gap: 8, fontSize: '0.85rem' }}
              >
                <Timer size={16} />
                <span>{isReserving ? 'Reserving...' : '15 min Hold / Reserve'}</span>
              </button>
            </div>

            {errorMessage && (
              <div style={{ padding: '10px 14px', borderRadius: 6, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: '0.82rem', marginBottom: 14 }}>
                {errorMessage}
              </div>
            )}

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product Code</th>
                    <th>Resource Name</th>
                    <th>Unit List Price</th>
                    <th>Available Stock</th>
                    <th>Select Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 700, color: '#0284c7' }}>{r.sku || r.id}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{r.name}</div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--outline)' }}>{r.category} • {r.productType}</span>
                      </td>
                      <td style={{ fontWeight: 700 }}>{formatCurrency(r.listPrice)}</td>
                      <td>
                        <span className={`badge ${r.availableStock > 5 ? 'badge-fulfilled' : r.availableStock > 0 ? 'badge-pending' : 'badge-danger'}`}>
                          {r.availableStock} in stock
                        </span>
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max={r.availableStock}
                          value={quantities[r.id] || 0}
                          onChange={e => handleQtyChange(r.id, e.target.value)}
                          style={{
                            width: '70px',
                            padding: '4px 8px',
                            borderRadius: 6,
                            border: '1px solid rgba(209,195,202,0.6)',
                            fontWeight: 700,
                            textAlign: 'center'
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Proposals & Quotes */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--on-surface)' }}>
                  Active Proposals & Quotations
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
                  Review line items, submit counter-offers, or authorize quotes directly
                </span>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/portal/quotes')}>
                View All ({quotes.length})
              </button>
            </div>

            {loading ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--secondary-text)' }}>
                <span className="material-symbols-outlined spin" style={{ fontSize: 24, color: '#059669' }}>sync</span>
                <p style={{ marginTop: 6 }}>Loading quotations...</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Quote Ref</th>
                      <th>Configuration / Description</th>
                      <th>Contract Value</th>
                      <th>Discount</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.map(q => (
                      <tr key={q.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/portal/quotes/${q.id}`)}>
                        <td style={{ fontWeight: 700, color: '#059669' }}>{q.id}</td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>
                            {q.quotationNumber || q.id}
                          </div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--outline)' }}>Created: {q.createdAt || q.createdDate}</span>
                        </td>
                        <td style={{ fontWeight: 700, fontFeatureSettings: "'tnum'" }}>{formatCurrency(q.estimatedNetTotal || q.totalValue)}</td>
                        <td style={{ fontWeight: 700, color: '#059669' }}>{formatPercent(q.discountPercent || 0)}</td>
                        <td>
                          <StatusBadge status={q.status} />
                        </td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={(e) => { e.stopPropagation(); navigate(`/portal/quotes/${q.id}`); }}
                            style={{ background: '#059669', borderColor: '#059669', padding: '4px 10px', fontSize: '0.75rem' }}
                          >
                            Review & Order
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

<<<<<<< Updated upstream
          {/* Hardware Fulfillment & Active Deliveries */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MS icon="local_shipping" size={20} />
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: 'var(--on-surface)' }}>
                  Hardware Fulfillment & Active Deliveries
                </h3>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/portal/orders')}>
                Track All Orders
              </button>
            </div>

            <div style={{
              padding: '16px', borderRadius: 8, background: 'var(--surface-container-low)',
              border: '1px solid rgba(209,195,202,0.3)', display: 'flex', flexDirection: 'column', gap: 12
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>Order # ORD-2026-0041</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--outline)', marginLeft: 8 }}>(Ref: Q-2026-004)</span>
                </div>
                <span className="badge badge-fulfilled">IN TRANSIT — ETA OCT 12</span>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>
                6x Enterprise Cloud Server X1 • 1x 24/7 Mission Critical Support SLA
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--outline)' }}>
                <span>Dispatched: Midwest Hub (IL)</span>
                <span>Destination: Nexus Data Center (CA)</span>
                <span>Carrier: FedEx Freight Priority</span>
              </div>
            </div>
          </div>

          {/* Recommended Add-ons for Infrastructure */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <MS icon="auto_awesome" size={20} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--on-surface)' }}>
                Recommended Add-ons for your Infrastructure
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {recommendations.map(rec => (
                <div key={rec.id} style={{
                  padding: '14px', borderRadius: 8, background: '#fff',
                  border: '1px solid rgba(209,195,202,0.4)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className="badge badge-surface" style={{ fontSize: '0.65rem' }}>{rec.category}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#059669' }}>{rec.confidence}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--on-surface)', marginTop: 6 }}>
                      {rec.name}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', margin: '4px 0 8px 0', lineHeight: 1.3 }}>
                      {rec.reason}
                    </p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(209,195,202,0.2)' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--outline)', textDecoration: 'line-through', marginRight: 4 }}>{formatCurrency(rec.listPrice)}</span>
                      <strong style={{ fontSize: '0.88rem', color: '#059669' }}>{formatCurrency(rec.recommendedPrice)}</strong>
                    </div>
                    <button className="btn btn-outline btn-sm" onClick={() => navigate('/portal/quotes')} style={{ padding: '2px 8px', fontSize: '0.72rem' }}>
                      + Add to Quote
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

=======
>>>>>>> Stashed changes
        </div>

        {/* Right Column: Account Team + Support & SLA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Panel 1: Dedicated Account Team */}
          <div className="card" style={{ padding: '20px', background: '#fff', borderTop: '4px solid #059669' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--on-surface)' }}>
              Dedicated Account Team
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', background: 'var(--primary)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
                }}>
                  AR
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--on-surface)' }}>Alex Rivera</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>Account Executive</div>
                  <div style={{ fontSize: '0.72rem', color: '#059669' }}>alex.rivera@dealflow360.internal</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', background: '#0284c7',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
                }}>
                  SJ
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--on-surface)' }}>Sarah Jenkins</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>Fulfillment Lead</div>
                  <div style={{ fontSize: '0.72rem', color: '#0284c7' }}>sarah.jenkins@dealflow360.internal</div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 2: Support & SLA Status */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--on-surface)' }}>
              Support & SLA Status
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--secondary-text)' }}>Emergency Incident SLA:</span>
                <strong style={{ color: '#059669' }}>15 Min Response</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--secondary-text)' }}>System Uptime Guarantee:</span>
                <strong style={{ color: '#059669' }}>99.99% Operational</strong>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
