import React, { useState } from 'react';
import Modal from '../../components/common/Modal';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

export default function SystemSettings() {
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '' });
  const [activeSubTab, setActiveSubTab] = useState('registry');
  const [searchQuery, setSearchQuery] = useState('Apex');
  const [selectedPod, setSelectedPod] = useState('TNT-901');

  // Inspector form states
  const [dbStrategy, setDbStrategy] = useState('Dedicated RDS Aurora Cluster (Isolated Physical Pod)');
  const [idpUrl, setIdpUrl] = useState('https://auth.apexlogistics.com/sso/saml');
  const [spEntityId, setSpEntityId] = useState('urn:dealflow360:sp:apex-enterprise-prod');
  const [jitEnabled, setJitEnabled] = useState(true);
  const [strictSso, setStrictSso] = useState(true);
  const [sessionTimeout] = useState('15 Minutes');

  const handleBlockedAction = (actionTitle) => {
    setModalConfig({
      isOpen: true,
      title: `Backend API Not Connected — ${actionTitle}`,
      message: `Tenant configuration modification for "${actionTitle}" is operating in Read-Only Mode. Sovereign boundary rules and KMS isolation settings are maintained locally.`
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Banner & Action Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16,
        padding: '18px 22px', borderRadius: 'var(--radius-xl)',
        background: 'linear-gradient(135deg, var(--surface-container-lowest) 0%, var(--surface-container-low) 100%)',
        border: '1px solid rgba(209,195,202,0.5)', boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            System & Security Infrastructure &bull; System Settings & Tenant Isolation
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 className="headline-lg" style={{ color: 'var(--on-surface)', fontWeight: 700 }}>
              Tenant Isolation Architecture & Boundary Policy
            </h1>
            <span className="badge" style={{ background: 'rgba(0,105,110,0.15)', color: 'var(--secondary)', padding: '4px 10px', fontSize: 11 }}>
              Strict Isolation Mode: Active &bull; FIPS 140-3 Level 4 &bull; Enforced v4.20-SEC
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => handleBlockedAction('Verify Cryptography')} className="btn btn-outline btn-sm">
            <MS icon="verified_user" size={16} /> Verify Cryptography
          </button>
          <button onClick={() => handleBlockedAction('Export Manifest JSON')} className="btn btn-outline btn-sm">
            <MS icon="download" size={16} /> Export Manifest
          </button>
          <button onClick={() => handleBlockedAction('Provision Isolated Pod')} className="btn btn-primary btn-sm">
            <MS icon="add_moderator" size={16} /> + Provision Isolated Pod
          </button>
        </div>
      </div>

      {/* Executive Telemetry Ribbon (5 KPI Cards) */}
      <div className="grid-metrics" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="card card-body" style={{ borderBottom: '3px solid var(--secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Active Tenant Pods</span>
            <MS icon="cloud_done" size={18} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-surface)', marginTop: 4 }}>128 Enclaves</div>
          <span style={{ fontSize: 11, color: 'var(--secondary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <MS icon="shield_lock" size={14} /> 100% Zero-Leakage Tested (90d)
          </span>
        </div>

        <div className="card card-body" style={{ borderBottom: '3px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Partition Model</span>
            <MS icon="hub" size={18} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--on-surface)', marginTop: 4 }}>Cell-Based Sharding</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <MS icon="lock" size={14} /> Dedicated VPC & KMS / Org
          </span>
        </div>

        <div className="card card-body" style={{ borderBottom: '3px solid var(--secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Cross-Tenant Leakage</span>
            <MS icon="security" size={18} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-surface)', marginTop: 4 }}>0 Events</div>
          <span style={{ fontSize: 11, color: 'var(--secondary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <MS icon="pulse_alert" size={14} /> Real-time eBPF Probe Active
          </span>
        </div>

        <div className="card card-body" style={{ borderBottom: '3px solid var(--outline-variant)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Gateway Burst Meter</span>
            <MS icon="speed" size={18} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-surface)', marginTop: 4 }}>4.8M / 10M r/m</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 4 }}>48% Cap &bull; Shielded</span>
        </div>

        <div className="card card-body" style={{ borderBottom: '3px solid #78350f' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Cryptographic Guardrail</span>
            <MS icon="key" size={18} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--on-surface)', marginTop: 4 }}>AES-256-GCM</div>
          <span style={{ fontSize: 11, color: '#78350f', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <MS icon="vpn_key" size={14} /> 100% BYOK HW Enclave
          </span>
        </div>
      </div>

      {/* Main 2-Column Split Architecture */}
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 20 }}>
        {/* Left Column: Registry & Sovereignty */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Sub-tab Navigation Bar */}
          <div className="tab-bar">
            <button
              onClick={() => setActiveSubTab('registry')}
              className={`tab-btn ${activeSubTab === 'registry' ? 'active' : ''}`}
            >
              <MS icon="domain" size={16} /> Tenant Enclave Registry (128)
            </button>
            <button
              onClick={() => setActiveSubTab('saml')}
              className={`tab-btn ${activeSubTab === 'saml' ? 'active' : ''}`}
            >
              <MS icon="badge" size={16} /> Identity Federation & SAML
            </button>
            <button
              onClick={() => setActiveSubTab('gateway')}
              className={`tab-btn ${activeSubTab === 'gateway' ? 'active' : ''}`}
            >
              <MS icon="alt_route" size={16} /> API Gateway
            </button>
            <button
              onClick={() => setActiveSubTab('kms')}
              className={`tab-btn ${activeSubTab === 'kms' ? 'active' : ''}`}
            >
              <MS icon="shield" size={16} /> Sovereignty & KMS
            </button>
          </div>

          {/* Search & Filter Ribbon */}
          <div className="card card-body flex-between" style={{ gap: 12 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'var(--outline)' }}>search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter by domain, pod Enclave ID (#TNT), or AWS/Azure region..."
                className="input-field"
                style={{ paddingLeft: 30, height: 32 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span className="badge badge-surface">Tier: Dedicated Pod</span>
              <span className="badge badge-secondary">KMS: Customer BYOK</span>
              <span className="badge badge-surface">Zone: All Regions (4)</span>
            </div>
          </div>

          {/* Partitioned Enclave Directory Table */}
          <div className="card">
            <div className="card-header flex-between">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MS icon="table_chart" size={18} />
                <h3 className="headline-sm" style={{ color: 'var(--on-surface)' }}>Partitioned Enclave Directory</h3>
                <span style={{ fontSize: 11, background: 'var(--surface-container)', padding: '2px 6px', borderRadius: 4 }}>5 of 128 Showing</span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <MS icon="sync" size={14} /> Sub-second synchronization
              </span>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tenant & Domain</th>
                    <th>Org & Isolation Tier</th>
                    <th>KMS Key Architecture</th>
                    <th>Quota / Burst</th>
                    <th>Status & Verification</th>
                    <th>Ops</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    onClick={() => setSelectedPod('TNT-901')}
                    style={{ background: selectedPod === 'TNT-901' ? 'rgba(87,52,79,0.08)' : 'transparent', cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ color: 'var(--on-surface)' }}>Apex Global Logistics</strong>
                        <span style={{ fontSize: 11, color: 'var(--outline)', fontFamily: 'monospace' }}>apexlogistics.com</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="font-mono font-semibold">#TNT-901</span>
                        <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 600 }}>Tier 1 Physical Pod &bull; AWS us-east-1</span>
                      </div>
                    </td>
                    <td>
                      <span className="font-mono text-xs" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MS icon="key" size={14} /> Customer BYOK (HSM-v2)
                      </span>
                    </td>
                    <td className="font-mono text-xs">150k / 300k r/m</td>
                    <td><span className="badge badge-secondary">Air-Gapped: 100% Verified</span></td>
                    <td>
                      <button onClick={() => setSelectedPod('TNT-901')} className="btn btn-primary btn-sm">Config</button>
                    </td>
                  </tr>

                  <tr
                    onClick={() => setSelectedPod('TNT-844')}
                    style={{ background: selectedPod === 'TNT-844' ? 'rgba(87,52,79,0.08)' : 'transparent', cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ color: 'var(--on-surface)' }}>NexaCorp Industries</strong>
                        <span style={{ fontSize: 11, color: 'var(--outline)', fontFamily: 'monospace' }}>nexacorp.io</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="font-mono font-semibold">#TNT-844</span>
                        <span style={{ fontSize: 10, color: 'var(--outline)' }}>VPC PrivateLink Enclave</span>
                      </div>
                    </td>
                    <td>
                      <span className="font-mono text-xs" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MS icon="shield" size={14} /> DealFlow Managed KMS
                      </span>
                    </td>
                    <td className="font-mono text-xs">80k / 120k r/m</td>
                    <td><span className="badge badge-surface">Enclave Active</span></td>
                    <td>
                      <button onClick={() => setSelectedPod('TNT-844')} className="btn btn-outline btn-sm">Config</button>
                    </td>
                  </tr>

                  <tr
                    onClick={() => setSelectedPod('TNT-712')}
                    style={{ background: selectedPod === 'TNT-712' ? 'rgba(87,52,79,0.08)' : 'transparent', cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ color: 'var(--on-surface)' }}>FinTech Sovereign Capital</strong>
                        <span style={{ fontSize: 11, color: 'var(--outline)', fontFamily: 'monospace' }}>sovereignfin.ch</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="font-mono font-semibold">#TNT-712</span>
                        <span style={{ fontSize: 10, color: '#78350f', fontWeight: 600 }}>Swiss Cell (EU-Zurich)</span>
                      </div>
                    </td>
                    <td>
                      <span className="font-mono text-xs" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MS icon="lock" size={14} /> Hardware HSM Tier 4
                      </span>
                    </td>
                    <td className="font-mono text-xs">200k / 400k r/m</td>
                    <td><span className="badge badge-amber">Strict Sovereign Lock</span></td>
                    <td>
                      <button onClick={() => setSelectedPod('TNT-712')} className="btn btn-outline btn-sm">Config</button>
                    </td>
                  </tr>

                  <tr
                    onClick={() => setSelectedPod('TNT-605')}
                    style={{ background: selectedPod === 'TNT-605' ? 'rgba(87,52,79,0.08)' : 'transparent', cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ color: 'var(--on-surface)' }}>OmniRetail Global</strong>
                        <span style={{ fontSize: 11, color: 'var(--outline)', fontFamily: 'monospace' }}>omniretail.com</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="font-mono font-semibold">#TNT-605</span>
                        <span style={{ fontSize: 10, color: 'var(--outline)' }}>Virtual Silo (gVisor)</span>
                      </div>
                    </td>
                    <td>
                      <span className="font-mono text-xs" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MS icon="lock_open" size={14} /> Envelope AES-GCM
                      </span>
                    </td>
                    <td className="font-mono text-xs">50k / 80k r/m</td>
                    <td><span className="badge badge-surface">Active</span></td>
                    <td>
                      <button onClick={() => setSelectedPod('TNT-605')} className="btn btn-outline btn-sm">Config</button>
                    </td>
                  </tr>

                  <tr
                    onClick={() => setSelectedPod('TNT-512')}
                    style={{ background: selectedPod === 'TNT-512' ? 'rgba(87,52,79,0.08)' : 'transparent', cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ color: 'var(--on-surface)' }}>HyperScale Media</strong>
                        <span style={{ fontSize: 11, color: 'var(--outline)', fontFamily: 'monospace' }}>hyperscalemedia.com</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="font-mono font-semibold">#TNT-512</span>
                        <span style={{ fontSize: 10, color: 'var(--outline)' }}>Shared DB Schema Pool</span>
                      </div>
                    </td>
                    <td>
                      <span className="font-mono text-xs" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MS icon="key" size={14} /> Standard KMS
                      </span>
                    </td>
                    <td className="font-mono text-xs text-error font-semibold">25k / 30k r/m</td>
                    <td><span className="badge badge-error">Noisy-Neighbor Throttled</span></td>
                    <td>
                      <button onClick={() => setSelectedPod('TNT-512')} className="btn btn-outline btn-sm">Config</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Sovereign Data Residency & Geofence Matrix */}
          <div className="card card-body" style={{ background: 'var(--surface-container-low)', border: '1px solid rgba(209,195,202,0.3)' }}>
            <div className="flex-between" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MS icon="public" size={18} />
                <h3 className="headline-sm" style={{ color: 'var(--on-surface)' }}>Sovereign Data Residency & Geofence Matrix</h3>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)' }}>Zero Cross-Border Exfiltration Guaranteed</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              <div style={{ background: '#fff', padding: 10, borderRadius: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700 }}>
                  <span>NA Zone</span>
                  <span className="badge badge-surface" style={{ fontSize: 9 }}>FedRAMP High</span>
                </div>
                <p style={{ fontSize: 10, color: 'var(--outline)', marginTop: 4 }}>US-East (N. Virginia), US-West (Oregon)</p>
                <div style={{ fontSize: 10, marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Enclaves: <strong>82 Pods</strong></span>
                  <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>Airgap Enforced</span>
                </div>
              </div>

              <div style={{ background: '#fff', padding: 10, borderRadius: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700 }}>
                  <span>EU & Swiss</span>
                  <span className="badge badge-amber" style={{ fontSize: 9 }}>FINMA / GDPR</span>
                </div>
                <p style={{ fontSize: 10, color: 'var(--outline)', marginTop: 4 }}>Frankfurt (eu-central-1), Zurich</p>
                <div style={{ fontSize: 10, marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Enclaves: <strong>31 Pods</strong></span>
                  <span style={{ color: '#78350f', fontWeight: 600 }}>Strict Art 28</span>
                </div>
              </div>

              <div style={{ background: '#fff', padding: 10, borderRadius: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700 }}>
                  <span>APAC Zone</span>
                  <span className="badge badge-surface" style={{ fontSize: 9 }}>MAS TRM</span>
                </div>
                <p style={{ fontSize: 10, color: 'var(--outline)', marginTop: 4 }}>Singapore, Tokyo</p>
                <div style={{ fontSize: 10, marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Enclaves: <strong>11 Pods</strong></span>
                  <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>Direct Peering</span>
                </div>
              </div>

              <div style={{ background: '#fff', padding: 10, borderRadius: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700 }}>
                  <span>LATAM Zone</span>
                  <span className="badge badge-surface" style={{ fontSize: 9 }}>LGPD Master</span>
                </div>
                <p style={{ fontSize: 10, color: 'var(--outline)', marginTop: 4 }}>São Paulo (sa-east-1 Cluster)</p>
                <div style={{ fontSize: 10, marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Enclaves: <strong>4 Pods</strong></span>
                  <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>National Geofence</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Inspector & Configurator Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Inspector Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--outline-variant)', paddingBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MS icon="tune" size={20} />
                <h3 className="headline-md" style={{ color: 'var(--on-surface)', fontWeight: 700 }}>Tenant Partition Configurator</h3>
              </div>
              <span className="badge badge-primary font-mono">#{selectedPod}</span>
            </div>

            <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Active Scope:</span>
              <span className="badge badge-secondary" style={{ fontSize: 10 }}>Tier 1 Sovereign &bull; Air-Gapped</span>
            </div>

            {/* Section 1: Tenant Enclave Boundaries */}
            <div style={{ background: 'var(--surface-container-low)', padding: 12, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontWeight: 700, fontSize: 12 }}>
                <MS icon="storage" size={16} />
                <span>1. Tenant Enclave Boundaries</span>
              </div>

              <div className="input-group">
                <label className="input-label">Database Isolation Strategy</label>
                <select
                  value={dbStrategy}
                  onChange={e => setDbStrategy(e.target.value)}
                  className="select-field"
                  style={{ height: 32, fontSize: 12 }}
                >
                  <option>Dedicated RDS Aurora Cluster (Isolated Physical Pod)</option>
                  <option>Schematized Multi-tenant Container (Shared VPC)</option>
                  <option>Ephemeral Sandboxed MicroVM</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
                <div style={{ background: '#fff', padding: 8, borderRadius: 4 }}>
                  <span style={{ fontSize: 10, color: 'var(--outline)', display: 'block' }}>Compute Isolation</span>
                  <span style={{ fontSize: 11, fontWeight: 600 }}>gVisor + Firecracker</span>
                </div>
                <div style={{ background: '#fff', padding: 8, borderRadius: 4 }}>
                  <span style={{ fontSize: 10, color: 'var(--outline)', display: 'block' }}>Network Routing</span>
                  <span style={{ fontSize: 11, fontWeight: 600 }}>AWS PrivateLink (mTLS)</span>
                </div>
              </div>
            </div>

            {/* Section 2: Identity Federation & SSO */}
            <div style={{ background: 'var(--surface-container-low)', padding: 12, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontWeight: 700, fontSize: 12 }}>
                <MS icon="fingerprint" size={16} />
                <span>2. Identity Federation & SSO (SAML 2.0 / OIDC)</span>
              </div>

              <div className="input-group">
                <label className="input-label">Issuer Authority URL (IdP)</label>
                <input
                  type="text"
                  value={idpUrl}
                  onChange={e => setIdpUrl(e.target.value)}
                  className="input-field"
                  style={{ height: 32, fontSize: 11, fontFamily: 'monospace' }}
                />
              </div>

              <div className="input-group">
                <label className="input-label">SP Entity ID</label>
                <input
                  type="text"
                  value={spEntityId}
                  onChange={e => setSpEntityId(e.target.value)}
                  className="input-field"
                  style={{ height: 32, fontSize: 11, fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <span>Just-In-Time (JIT) Provisioning</span>
                  <input
                    type="checkbox"
                    checked={jitEnabled}
                    onChange={e => setJitEnabled(e.target.checked)}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <span>Enforce Strict SSO (No Passwords)</span>
                  <input
                    type="checkbox"
                    checked={strictSso}
                    onChange={e => setStrictSso(e.target.checked)}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, marginTop: 2 }}>
                  <span style={{ color: 'var(--outline)' }}>Session Inactivity Lockout:</span>
                  <span className="font-mono font-semibold">{sessionTimeout}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
              <button
                onClick={() => handleBlockedAction(`Save Settings for ${selectedPod}`)}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                Save Enclave Configuration
              </button>
              <button
                onClick={() => handleBlockedAction(`Re-evaluate Security for ${selectedPod}`)}
                className="btn btn-outline"
                style={{ width: '100%' }}
              >
                Re-evaluate Boundary Security
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Read-Only Action Modal */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        title={modalConfig.title}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            padding: 12, borderRadius: 'var(--radius-md)',
            background: 'var(--error-container)', color: 'var(--on-error-container)',
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 12
          }}>
            <MS icon="lock" size={20} />
            <span><strong>Read-Only Governance Protection:</strong> Tenant enclave reconfiguration is disabled in backend-disconnected state.</span>
          </div>
          <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>
            {modalConfig.message}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button onClick={() => setModalConfig({ ...modalConfig, isOpen: false })} className="btn btn-primary">
              Acknowledge & Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
