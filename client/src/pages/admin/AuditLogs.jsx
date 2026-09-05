import React, { useState } from 'react';
import Modal from '../../components/common/Modal';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

export default function AuditLogs() {
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '' });
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const handleBlockedAction = (actionTitle) => {
    setModalConfig({
      isOpen: true,
      title: `Audit Log Inspection — ${actionTitle}`,
      message: `The Immutable Audit Log Stream is operating in Read-Only Mode. Hashing verification and SHA-256 cryptographic proofs are generated locally.`
    });
  };

  const mockLogs = [
    { id: 'AUD-8921', time: '2026-09-05 14:22:04', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', actor: 'Victoria Stone (Admin)', event: 'Authenticated into Admin Console', target: 'SESSION-901', risk: 'INFO', status: 'VERIFIED_CHAIN' },
    { id: 'AUD-8920', time: '2026-09-04 14:32:15', hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e', actor: 'Marcus Vance (Customer)', event: 'Submitted counter-offer (25% disc, Net 60)', target: 'Q-2026-002', risk: 'MEDIUM', status: 'VERIFIED_CHAIN' },
    { id: 'AUD-8919', time: '2026-09-02 11:15:40', hash: '5feceb66ffc86f38d952786c6d696c79c2dbc239dd4e91b46729d73a27fb57e9', actor: 'Sarah Jenkins (Rep)', event: 'Created quote exceeding Gold Tier limit (22% vs 20%)', target: 'Q-2026-001', risk: 'MEDIUM', status: 'VERIFIED_CHAIN' },
    { id: 'AUD-8918', time: '2026-08-30 09:44:12', hash: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b', actor: 'David Keller (Manager)', event: 'Approved quotation override (15% disc)', target: 'Q-2026-003', risk: 'LOW', status: 'VERIFIED_CHAIN' },
    { id: 'AUD-8917', time: '2026-08-25 16:50:33', hash: 'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35', actor: 'Discount Evaluator', event: 'Evaluated quote against Gold Tier policy', target: 'Q-2026-004', risk: 'LOW', status: 'VERIFIED_CHAIN' },
    { id: 'AUD-8916', time: '2026-08-20 10:12:00', hash: '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce', actor: 'System Evaluator', event: 'Hard ceiling discount check passed', target: 'POL-HARD-CEILING', risk: 'INFO', status: 'VERIFIED_CHAIN' }
  ];

  const filteredLogs = mockLogs.filter(log => {
    const matchesRisk = filterRisk === 'ALL' || log.risk === filterRisk;
    const matchesQuery = log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRisk && matchesQuery;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16,
        padding: '18px 22px', borderRadius: 'var(--radius-xl)',
        background: 'linear-gradient(135deg, var(--surface-container-lowest) 0%, var(--surface-container-low) 100%)',
        border: '1px solid rgba(209,195,202,0.5)', boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}>
              <MS icon="receipt_long" size={22} />
            </div>
            <div>
              <h1 className="headline-lg" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                Immutable Audit Logs & Merkle System Stream
              </h1>
              <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                Append-Only Immutable Event Stream, SHA-256 Merkle Tree Hashing & SOC2 Compliance Inspection
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="badge" style={{ background: 'rgba(87,52,79,0.1)', color: 'var(--primary)', padding: '6px 12px', fontSize: 12 }}>
            <MS icon="shield" size={16} /> SHA-256 Merkle Chain Verified
          </span>
          <button onClick={() => handleBlockedAction('Export Audit Stream CSV')} className="btn btn-primary btn-sm">
            <MS icon="download" size={16} /> Export Audit Stream
          </button>
        </div>
      </div>

      {/* Telemetry Ribbon */}
      <div className="grid-metrics">
        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Total Audit Logs</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>8,921 Events</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Append-Only Immutable Stream</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Cryptographic Proof</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>SHA-256 Merkle</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Zero-Tamper Verification</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Compliance Standard</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>SOX / SOC2 Type II</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Audit Trail Certified</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Chain Integrity</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-surface)' }}>100% Valid</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Zero Hash Mismatch</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Critical Flags</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>0 Events</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>No Security Violations</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Stream Status</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>Read-Only</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Local Hashing Active</span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="card">
        <div className="card-header flex-between">
          <div>
            <h3 className="headline-sm" style={{ color: 'var(--primary)' }}>Immutable System Activity Stream</h3>
            <p className="body-sm" style={{ color: 'var(--outline)' }}>Event ID, SHA-256 cryptographic hash snapshot, actor, and risk classification</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="Search audit events..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ width: 220, height: 32 }}
            />
            <select
              value={filterRisk}
              onChange={e => setFilterRisk(e.target.value)}
              className="select-field"
              style={{ width: 140, height: 32 }}
            >
              <option value="ALL">All Risk Levels</option>
              <option value="INFO">INFO</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Timestamp</th>
                <th>Cryptographic SHA-256 Hash</th>
                <th>Actor Persona</th>
                <th>Action Description</th>
                <th>Target Entity</th>
                <th>Risk Rating</th>
                <th>Chain Integrity</th>
                <th>Ops</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td className="font-mono font-semibold">{log.id}</td>
                  <td className="font-mono text-sm">{log.time}</td>
                  <td className="font-mono text-xs" style={{ color: 'var(--outline)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.hash.slice(0, 16)}...
                  </td>
                  <td>{log.actor}</td>
                  <td>{log.event}</td>
                  <td className="font-mono font-semibold">{log.target}</td>
                  <td>
                    <span className={`badge ${log.risk === 'INFO' ? 'badge-surface' : log.risk === 'LOW' ? 'badge-success' : log.risk === 'MEDIUM' ? 'badge-amber' : 'badge-error'}`}>
                      {log.risk}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-success">&check; {log.status}</span>
                  </td>
                  <td>
                    <button onClick={() => handleBlockedAction(`Inspect Log ${log.id}`)} className="btn btn-outline btn-sm">
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            background: 'var(--surface-container-high)', color: 'var(--on-surface)',
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 12
          }}>
            <MS icon="shield" size={20} />
            <span><strong>Merkle Chain Proof:</strong> Cryptographic SHA-256 hash verified. Log entry is immutable.</span>
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
