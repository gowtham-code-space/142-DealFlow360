import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MetricCard from '../../components/common/MetricCard';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Truck, CheckCircle, Package, ShieldCheck, Download, CreditCard } from 'lucide-react';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

export default function CustomerOrders() {
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState('ORD-2026-0041');

  const orders = [
    {
      id: 'ORD-2026-0041',
      quoteId: 'Q-2026-004',
      date: '2026-09-03',
      description: 'Enterprise Server Fleet X1 & High-Density Switches',
      totalValue: 7680000,
      status: 'FULFILLED',
      subStatus: 'IN TRANSIT',
      eta: 'Oct 12, 2026',
      carrier: 'FedEx Freight Priority',
      trackingNo: 'FX-99821-NEX',
      origin: 'Midwest Hub (IL)',
      destination: 'Nexus Data Center (CA)',
      items: [
        { name: 'Enterprise Cloud Server X1', sku: 'PRD-101', qty: 6, price: 1000000 },
        { name: '24/7 Mission Critical Support SLA', sku: 'PRD-202', qty: 1, price: 1800000 }
      ]
    },
    {
      id: 'ORD-2026-0038',
      quoteId: 'Q-2026-003',
      date: '2026-08-30',
      description: 'High-Density Switch 48-Port & SaaS Licenses',
      totalValue: 2272000,
      status: 'FULFILLED',
      subStatus: 'DELIVERED',
      eta: 'Delivered Sep 02',
      carrier: 'DHL Express Corporate',
      trackingNo: 'DHL-4401-NEX',
      origin: 'East Coast Distribution (NJ)',
      destination: 'Nexus Data Center (CA)',
      items: [
        { name: 'High-Density Switch 48-Port', sku: 'PRD-102', qty: 5, price: 250000 },
        { name: 'DealFlow Platform SaaS License', sku: 'PRD-201', qty: 35, price: 35000 }
      ]
    },
    {
      id: 'ORD-2026-0024',
      quoteId: 'Q-2026-001',
      date: '2026-08-15',
      description: 'Optical Fiber SFP+ Transceiver Pack (40x)',
      totalValue: 1280000,
      status: 'FULFILLED',
      subStatus: 'DELIVERED',
      eta: 'Delivered Aug 18',
      carrier: 'UPS Supply Chain',
      trackingNo: 'UPS-1002-NEX',
      origin: 'West Coast Logistics (CA)',
      destination: 'Nexus Tech Lab (CA)',
      items: [
        { name: 'Optical Fiber SFP+ Transceiver Pack', sku: 'PRD-301', qty: 40, price: 40000 }
      ]
    }
  ];

  const activeOrder = orders.find(o => o.id === selectedOrder) || orders[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Bar */}
      <div className="card" style={{ padding: '20px', background: '#fff', borderLeft: '4px solid #059669' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 className="page-title" style={{ margin: 0, fontSize: '1.4rem' }}>
                My Orders & Fulfillment Tracking
              </h1>
              <span className="badge badge-approved" style={{ background: 'rgba(5, 150, 105, 0.1)', color: '#059669' }}>
                3 Enterprise Orders
              </span>
            </div>
            <p className="page-subtitle" style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>
              Track active hardware shipments, inspect serial breakdown, and view historical invoices with verified delivery proof.
            </p>
          </div>

          <button className="btn btn-primary" onClick={() => navigate('/portal/invoices')} style={{ background: '#059669', borderColor: '#059669', gap: 6 }}>
            <MS icon="receipt_long" size={18} />
            <span>View Verified Invoices</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid-metrics">
        <MetricCard
          title="Total Orders Executed"
          value="3"
          change="All Completed/Fulfilling"
          isPositive={true}
          icon={Package}
          color="#059669"
        />
        <MetricCard
          title="Fulfillment On-Time Rate"
          value="100%"
          change="SLA Guarantee Met"
          isPositive={true}
          icon={CheckCircle}
          color="#10b981"
        />
        <MetricCard
          title="Orders In Transit"
          value="1"
          change="ETA Oct 12, 2026"
          isPositive={true}
          icon={Truck}
          color="var(--primary)"
        />
        <MetricCard
          title="Delivered Hardware"
          value="2 Orders"
          change="Verified Receipt"
          isPositive={true}
          icon={ShieldCheck}
          color="#7c3aed"
        />
      </div>

      {/* Active Order Tracking Timeline Card */}
      <div className="card" style={{ padding: '24px', background: '#fff', borderTop: '4px solid #059669' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--on-surface)' }}>
                Active Order Tracking — {activeOrder.id}
              </h2>
              <span className="badge badge-fulfilled">{activeOrder.subStatus}</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
              Configuration: <strong>{activeOrder.description}</strong> • Total Value: <strong>{formatCurrency(activeOrder.totalValue)}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--outline)' }}>Tracking:</span>
            <span className="font-mono" style={{ fontWeight: 700, color: '#059669', background: 'rgba(5,150,105,0.08)', padding: '2px 8px', borderRadius: 4 }}>
              {activeOrder.trackingNo}
            </span>
          </div>
        </div>

        {/* Multi-Stage Tracker Stepper */}
        <div style={{ padding: '16px 0 24px 0', borderBottom: '1px solid rgba(209,195,202,0.3)', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            <div style={{
              position: 'absolute', top: 16, left: 30, right: 30, height: 3,
              background: '#059669', zIndex: 0
            }} />

            {[
              { label: 'Order Placed', time: 'Sep 03, 09:00 AM', done: true },
              { label: 'Processing', time: 'Sep 03, 10:15 AM', done: true },
              { label: 'Stock Allocated', time: 'Sep 03, 11:00 AM', done: true },
              { label: 'In Transit', time: 'Sep 04, 02:00 PM', done: true, current: activeOrder.subStatus === 'IN TRANSIT' },
              { label: 'Out for Delivery', time: 'Pending', done: activeOrder.subStatus === 'DELIVERED' },
              { label: 'Delivered', time: activeOrder.subStatus === 'DELIVERED' ? activeOrder.eta : 'Pending', done: activeOrder.subStatus === 'DELIVERED' }
            ].map((st, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, background: '#fff', padding: '0 6px' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: st.done ? '#059669' : 'var(--surface-container-high)',
                  color: st.done ? '#fff' : 'var(--outline)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700
                }}>
                  {st.done ? '✓' : idx + 1}
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: st.current ? 700 : 600, color: 'var(--on-surface)', marginTop: 6 }}>
                  {st.label}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--outline)' }}>{st.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Logistics Detail Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 16, fontSize: '0.82rem' }}>
          <div style={{ padding: 12, borderRadius: 8, background: 'var(--surface-container-low)', border: '1px solid rgba(209,195,202,0.3)' }}>
            <div style={{ color: 'var(--outline)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Dispatch Depot</div>
            <div style={{ fontWeight: 700, color: 'var(--on-surface)', marginTop: 4 }}>{activeOrder.origin}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', marginTop: 2 }}>Midwest Hub Distribution Facility</div>
          </div>

          <div style={{ padding: 12, borderRadius: 8, background: 'var(--surface-container-low)', border: '1px solid rgba(209,195,202,0.3)' }}>
            <div style={{ color: 'var(--outline)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Destination Address</div>
            <div style={{ fontWeight: 700, color: 'var(--on-surface)', marginTop: 4 }}>{activeOrder.destination}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', marginTop: 2 }}>Nexus HyperScale Bay Area Facility</div>
          </div>

          <div style={{ padding: 12, borderRadius: 8, background: 'var(--surface-container-low)', border: '1px solid rgba(209,195,202,0.3)' }}>
            <div style={{ color: 'var(--outline)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Carrier & ETA</div>
            <div style={{ fontWeight: 700, color: '#059669', marginTop: 4 }}>{activeOrder.carrier}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', marginTop: 2 }}>Estimated Arrival: <strong>{activeOrder.eta}</strong></div>
          </div>
        </div>
      </div>

      {/* Main Layout: Order History Table (Left 2fr) vs Billing & Subscriptions (Right 1fr) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '20px' }}>
        
        {/* Left: Order History Table */}
        <div className="card" style={{ padding: '20px', background: '#fff' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 14px 0', color: 'var(--on-surface)' }}>
            Order History & Historical Deliveries
          </h3>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Order Date</th>
                  <th>Hardware / Services</th>
                  <th>Contract Value</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr
                    key={o.id}
                    style={{ cursor: 'pointer', background: selectedOrder === o.id ? 'rgba(5,150,105,0.04)' : 'transparent' }}
                    onClick={() => setSelectedOrder(o.id)}
                  >
                    <td style={{ fontWeight: 700, color: '#059669' }}>{o.id}</td>
                    <td style={{ fontSize: '0.82rem' }}>{o.date}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{o.description}</div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--outline)' }}>Carrier: {o.carrier}</span>
                    </td>
                    <td style={{ fontWeight: 700, fontFeatureSettings: "'tnum'" }}>{formatCurrency(o.totalValue)}</td>
                    <td>
                      <StatusBadge status={o.status} text={o.subStatus} />
                    </td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={(e) => { e.stopPropagation(); setSelectedOrder(o.id); }}
                        style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Billing & Verified Invoices + Active Subscriptions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Card 1: Verified Invoices */}
          <div className="card" style={{ padding: '20px', background: '#fff', borderTop: '4px solid #059669' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--on-surface)' }}>
              Billing & Verified Invoices
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{
                padding: '12px', borderRadius: 8, background: 'var(--surface-container-low)',
                border: '1px solid rgba(209,195,202,0.3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>INV-2026-089</span>
                  <span className="badge badge-pending" style={{ fontSize: '0.68rem' }}>DUE OCT 30</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--on-surface)', marginTop: 4, fontWeight: 600 }}>
                  Amount: {formatCurrency(7680000)}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--outline)', marginTop: 2 }}>Ref: Order ORD-2026-0041</div>

                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button className="btn btn-outline btn-sm" style={{ padding: '3px 8px', fontSize: '0.72rem', gap: 4 }}>
                    <Download size={13} />
                    <span>PDF</span>
                  </button>
                  <button className="btn btn-primary btn-sm" style={{ background: '#059669', borderColor: '#059669', padding: '3px 8px', fontSize: '0.72rem', gap: 4 }}>
                    <CreditCard size={13} />
                    <span>Pay via Wire</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Active Corporate Subscription */}
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--on-surface)' }}>
              Active Subscription
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--secondary-text)' }}>Plan:</span>
                <strong style={{ color: 'var(--primary)' }}>DealFlow SaaS + Support SLA</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--secondary-text)' }}>Next Renewal:</span>
                <strong style={{ color: 'var(--on-surface)' }}>Dec 31, 2026</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--secondary-text)' }}>Monthly Rate:</span>
                <strong style={{ color: '#059669' }}>{formatCurrency(150000)}/mo</strong>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
