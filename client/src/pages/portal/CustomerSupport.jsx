import React from 'react';
// lucide icons removed

export default function CustomerSupport() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card" style={{ padding: '20px', background: '#fff', borderLeft: '4px solid #059669' }}>
        <h1 className="page-title" style={{ margin: 0, fontSize: '1.4rem' }}>
          Support, SLA & Account Team
        </h1>
        <p className="page-subtitle" style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>
          Dedicated account manager contacts, 24/7 mission critical SLA response, and system status guarantees.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Dedicated Account Team */}
        <div className="card" style={{ padding: '20px', background: '#fff' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 14px 0', color: 'var(--on-surface)' }}>
            Dedicated Enterprise Account Team
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: 12, borderRadius: 8, background: 'var(--surface-container-low)', display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>
                AR
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--on-surface)' }}>Alex Rivera</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--secondary-text)' }}>Senior Account Executive</div>
                <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: 2 }}>alex.rivera@dealflow360.internal</div>
              </div>
            </div>

            <div style={{ padding: 12, borderRadius: 8, background: 'var(--surface-container-low)', display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>
                SJ
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--on-surface)' }}>Sarah Jenkins</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--secondary-text)' }}>Fulfillment & Logistics Lead</div>
                <div style={{ fontSize: '0.75rem', color: '#0284c7', marginTop: 2 }}>sarah.jenkins@dealflow360.internal</div>
              </div>
            </div>
          </div>
        </div>

        {/* SLA Guarantee */}
        <div className="card" style={{ padding: '20px', background: '#fff', borderTop: '4px solid #059669' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 14px 0', color: 'var(--on-surface)' }}>
            24/7 Mission Critical SLA Guarantee
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid rgba(209,195,202,0.3)' }}>
              <span style={{ color: 'var(--secondary-text)' }}>Emergency Ticket Response:</span>
              <strong style={{ color: '#059669' }}>15 Minutes</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid rgba(209,195,202,0.3)' }}>
              <span style={{ color: 'var(--secondary-text)' }}>Hardware Replacement SLA:</span>
              <strong style={{ color: '#059669' }}>4 Hours (On-Site Depot)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid rgba(209,195,202,0.3)' }}>
              <span style={{ color: 'var(--secondary-text)' }}>Uptime Commitment:</span>
              <strong style={{ color: 'var(--primary)' }}>99.99% Monthly SLA</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
