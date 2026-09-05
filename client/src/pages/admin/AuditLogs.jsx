import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

const INITIAL_LOGS = [
  { id: 'AUD-8921', time: '2026-09-05 14:22:04', actor: 'Victoria Stone (Admin)', event: 'Authenticated into Admin Console', target: 'SESSION-901', risk: 'INFO', status: 'VERIFIED' },
  { id: 'AUD-8920', time: '2026-09-04 14:32:15', actor: 'Marcus Vance (Customer)', event: 'Submitted counter-offer (25% disc, Net 60)', target: 'Q-2026-002', risk: 'MEDIUM', status: 'VERIFIED' },
  { id: 'AUD-8919', time: '2026-09-02 11:15:40', actor: 'Sarah Jenkins (Rep)', event: 'Created quote exceeding Gold Tier limit (22% vs 20%)', target: 'Q-2026-001', risk: 'MEDIUM', status: 'VERIFIED' },
  { id: 'AUD-8918', time: '2026-08-30 09:44:12', actor: 'David Keller (Manager)', event: 'Approved quotation override (15% disc)', target: 'Q-2026-003', risk: 'LOW', status: 'VERIFIED' },
  { id: 'AUD-8917', time: '2026-08-25 16:50:33', actor: 'Discount Evaluator', event: 'Evaluated quote against Gold Tier policy', target: 'Q-2026-004', risk: 'LOW', status: 'VERIFIED' },
  { id: 'AUD-8916', time: '2026-08-20 10:12:00', actor: 'System Evaluator', event: 'Hard ceiling discount check passed', target: 'POL-HARD-CEILING', risk: 'INFO', status: 'VERIFIED' }
];

export default function AuditLogs() {
  const [logs] = useState(INITIAL_LOGS);
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleInspectLog = (log) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  const handleExport = () => {
    showToast('Audit stream exported to CSV format.');
  };

  const filteredLogs = logs.filter(log => {
    const matchesRisk = filterRisk === 'ALL' || log.risk === filterRisk;
    const matchesQuery = log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRisk && matchesQuery;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

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
                System Audit & Compliance Log Stream
              </h1>
              <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                Activity Stream & Compliance Inspection History
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={handleExport} className="btn btn-primary btn-sm">
            <MS icon="download" size={16} /> Export Audit Stream
          </button>
        </div>
      </div>

      {/* Telemetry Ribbon */}
      <div className="grid-metrics">
        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Total Audit Logs</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>{logs.length} Events</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>System Audit Stream</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Compliance Standard</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>SOX / SOC2 Type II</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Audit Trail Compliant</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Critical Flags</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>0 Security Events</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Normal Operation</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Stream Status</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>Live</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Event Logging Active</span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="card">
        <div className="card-header flex-between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 className="headline-sm" style={{ color: 'var(--primary)' }}>System Activity Audit Stream</h3>
            <p className="body-sm" style={{ color: 'var(--outline)' }}>Event ID, timestamp, actor, and risk classification</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search audit events..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-field"
              style={{
                width: 200,
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--outline-variant)',
                fontSize: 13
              }}
            />
            <select
              value={filterRisk}
              onChange={e => setFilterRisk(e.target.value)}
              className="select-field"
              style={{
                width: 140,
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--outline-variant)',
                fontSize: 13,
                background: '#fff'
              }}
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
                <th>Actor Persona</th>
                <th>Action Description</th>
                <th>Target Entity</th>
                <th>Risk Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 30, color: 'var(--outline)' }}>
                    No audit events match your search query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="font-mono font-semibold">{log.id}</td>
                    <td className="font-mono text-sm">{log.time}</td>
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
                      <button onClick={() => handleInspectLog(log)} className="btn btn-outline btn-sm">
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Audit Event Details — ${selectedLog?.id || ''}`}
      >
        {selectedLog && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'var(--surface-container-low)', padding: 14, borderRadius: 8 }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Log ID</span>
                <strong className="font-mono" style={{ fontSize: 14 }}>{selectedLog.id}</strong>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Timestamp</span>
                <span className="font-mono" style={{ fontSize: 13 }}>{selectedLog.time}</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Actor</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{selectedLog.actor}</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Target Entity</span>
                <strong className="font-mono" style={{ fontSize: 14 }}>{selectedLog.target}</strong>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Risk Rating</span>
                <span className={`badge ${selectedLog.risk === 'INFO' ? 'badge-surface' : selectedLog.risk === 'LOW' ? 'badge-success' : selectedLog.risk === 'MEDIUM' ? 'badge-amber' : 'badge-error'}`}>
                  {selectedLog.risk}
                </span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Status</span>
                <span className="badge badge-success">&check; {selectedLog.status}</span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block', marginBottom: 4 }}>Action Description</span>
              <div style={{ padding: 12, background: '#fff', borderRadius: 6, border: '1px solid var(--outline-variant)', fontSize: 13, color: 'var(--on-surface)' }}>
                {selectedLog.event}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button onClick={() => setIsDetailModalOpen(false)} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

