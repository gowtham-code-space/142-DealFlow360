import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

const INITIAL_RULES = [
  { id: 'POL-STD-DISC', domain: 'Discount Limit', scope: 'Standard Tier', threshold: 'Max 10.0% Discount', action: 'Requires Manager Approval if >10%', risk: 'LOW RISK', status: 'ACTIVE' },
  { id: 'POL-GLD-DISC', domain: 'Discount Limit', scope: 'Gold Tier', threshold: 'Max 20.0% Discount', action: 'Requires Manager Approval if >20%', risk: 'LOW RISK', status: 'ACTIVE' },
  { id: 'POL-PLT-DISC', domain: 'Discount Limit', scope: 'Platinum Tier', threshold: 'Max 30.0% Discount', action: 'Requires Manager Approval if >30%', risk: 'MEDIUM RISK', status: 'ACTIVE' },
  { id: 'POL-EXEC-DUAL', domain: 'Approval Escalation', scope: 'All Customer Tiers', threshold: 'Discount >30% OR Contract >₹2.0 Cr', action: 'Triggers Dual VP Finance Approval', risk: 'HIGH RISK', status: 'ACTIVE' },
  { id: 'POL-HARD-CEILING', domain: 'Hard Policy Floor', scope: 'System-Wide', threshold: 'Discount >45.0%', action: 'Automated System Rejection', risk: 'CRITICAL', status: 'ENFORCED' },
  { id: 'POL-MARGIN-FLOOR', domain: 'Margin Lock', scope: 'Hardware & Software', threshold: 'Gross Margin <22.0%', action: 'Automated Deal Block / Margin Floor Alert', risk: 'CRITICAL', status: 'ENFORCED' }
];

export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const [rules, setRules] = useState(INITIAL_RULES);
  const [toast, setToast] = useState(null);

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [selectedRule, setSelectedRule] = useState(null);

  const [formData, setFormData] = useState({
    id: '',
    domain: 'Discount Limit',
    scope: 'Gold Tier',
    threshold: 'Max 25.0% Discount',
    action: 'Requires Manager Approval',
    risk: 'MEDIUM RISK',
    status: 'ACTIVE'
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const setTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  const handleOpenAddModal = () => {
    setEditingRule(null);
    setFormData({
      id: `POL-RULE-${String(rules.length + 1).padStart(3, '0')}`,
      domain: 'Discount Limit',
      scope: 'Gold Tier',
      threshold: 'Max 25.0% Discount',
      action: 'Requires Manager Approval',
      risk: 'MEDIUM RISK',
      status: 'ACTIVE'
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (rule) => {
    setEditingRule(rule);
    setFormData({ ...rule });
    setIsFormModalOpen(true);
  };

  const handleOpenDetailModal = (rule) => {
    setSelectedRule(rule);
    setIsDetailModalOpen(true);
  };

  const handleSaveRule = (e) => {
    e.preventDefault();
    if (!formData.id.trim()) return;

    if (editingRule) {
      setRules(rules.map(r => r.id === editingRule.id ? formData : r));
      showToast(`Governance rule "${formData.id}" updated successfully.`);
    } else {
      setRules([...rules, formData]);
      showToast(`New governance rule "${formData.id}" created successfully.`);
    }
    setIsFormModalOpen(false);
  };

  const handleExportReport = () => {
    showToast('Governance specification report exported successfully.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Top Banner & Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16,
        padding: '18px 22px', borderRadius: 'var(--radius-xl)',
        background: 'linear-gradient(135deg, var(--surface-container-lowest) 0%, var(--surface-container-low) 100%)',
        border: '1px solid rgba(209,195,202,0.5)', boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}>
              <MS icon="admin_panel_settings" size={22} />
            </div>
            <div>
              <h1 className="headline-lg" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                DealFlow360 Enterprise Admin Console
              </h1>
              <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                System Governance, Multi-Tier Approval Rules, RBAC Control & Policy Visibility
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={handleExportReport}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <MS icon="download" size={16} /> Export Governance Spec
          </button>
        </div>
      </div>

      {/* Metric Cards Top Bar */}
      <div className="grid-metrics">
        <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Governance Policies</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>{rules.length} Active Rules</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>4 Tiers • 5 Approval Routes</span>
        </div>

        <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>RBAC System Roles</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>5 Canonical Roles</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Rep, Mgr, Ops, Admin, Buyer</span>
        </div>

        <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Hard Discount Cap</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--error)' }}>45.0% Ceiling</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Auto-Rejection Threshold</span>
        </div>

        <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Gross Margin Floor</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-surface)' }}>22.0% Minimum</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Deal Profit Lock</span>
        </div>

        <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Executive Threshold</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>&gt;30% / ₹2.0 Cr</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Dual VP Approval Required</span>
        </div>

        <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>System Status</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>Operational</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Active Policy Engine</span>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="tab-bar">
        <button
          onClick={() => setTab('overview')}
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
        >
          <MS icon="dashboard" size={16} /> Overview
        </button>
        <button
          onClick={() => setTab('policies')}
          className={`tab-btn ${activeTab === 'policies' ? 'active' : ''}`}
        >
          <MS icon="policy" size={16} /> Governance Policies
        </button>
        <button
          onClick={() => setTab('users')}
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
        >
          <MS icon="manage_accounts" size={16} /> Accounts & Users
        </button>
        <button
          onClick={() => setTab('audit')}
          className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
        >
          <MS icon="fact_check" size={16} /> Audit & Compliance
        </button>
        <button
          onClick={() => setTab('config')}
          className={`tab-btn ${activeTab === 'config' ? 'active' : ''}`}
        >
          <MS icon="settings" size={16} /> System Configuration
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Active Policy Rules Matrix */}
          <div className="card">
            <div className="card-header flex-between">
              <div>
                <h3 className="headline-sm" style={{ color: 'var(--primary)' }}>Active Governance Policy Matrix</h3>
                <p className="body-sm" style={{ color: 'var(--outline)' }}>Core discount ceilings, margin locks, and automated routing rules</p>
              </div>
              <button onClick={handleOpenAddModal} className="btn btn-primary btn-sm">
                <MS icon="add" size={16} /> Add Governance Rule
              </button>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rule Identifier</th>
                    <th>Governance Domain</th>
                    <th>Target Tier / Scope</th>
                    <th>Enforcement Threshold</th>
                    <th>System Action</th>
                    <th>Risk Classification</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule.id}>
                      <td className="font-semibold text-primary-color">{rule.id}</td>
                      <td>{rule.domain}</td>
                      <td><span className="badge badge-surface">{rule.scope}</span></td>
                      <td className="font-mono">{rule.threshold}</td>
                      <td>{rule.action}</td>
                      <td>
                        <span className={`badge ${rule.risk.includes('HIGH') || rule.risk.includes('CRITICAL') ? 'badge-error' : 'badge-amber'}`}>
                          {rule.risk}
                        </span>
                      </td>
                      <td><span className="badge badge-success">{rule.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => handleOpenDetailModal(rule)} className="btn btn-outline btn-sm">View</button>
                          <button onClick={() => handleOpenEditModal(rule)} className="btn btn-outline btn-sm">Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* System Canonical Roles Matrix */}
          <div>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="headline-sm" style={{ color: 'var(--primary)' }}>System Role Architecture (RBAC)</h3>
                <p className="body-sm" style={{ color: 'var(--outline)' }}>The 5 canonical system roles and their scope of authority</p>
              </div>
            </div>

            <div className="grid-metrics" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
              <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8, borderLeft: '4px solid var(--secondary)' }}>
                <span className="badge badge-secondary" style={{ width: 'fit-content' }}>ROLE 1</span>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--on-surface)' }}>Sales Representative</h4>
                <p style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>
                  CPQ Quote Creation, Customer Negotiation, Fast-Path Discount Requests within Tier Limits.
                </p>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--outline)', marginTop: 'auto' }}>SCOPE: Territory Accounts</div>
              </div>

              <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8, borderLeft: '4px solid var(--primary)' }}>
                <span className="badge badge-primary" style={{ width: 'fit-content' }}>ROLE 2</span>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--on-surface)' }}>Sales Manager / Approver</h4>
                <p style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>
                  Approval Queue Management, Discount Overrides, Margin Waiver, Re-approval Triggers.
                </p>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--outline)', marginTop: 'auto' }}>SCOPE: Sales Team / Queue</div>
              </div>

              <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8, borderLeft: '4px solid #075985' }}>
                <span className="badge badge-surface" style={{ width: 'fit-content' }}>ROLE 3</span>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--on-surface)' }}>Finance / Operations</h4>
                <p style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>
                  Warehouse Stock Allocation, Fulfillment Locking, Hybrid Invoicing & Billing Engine.
                </p>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--outline)', marginTop: 'auto' }}>SCOPE: Operations / ERP</div>
              </div>

              <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8, borderLeft: '4px solid var(--error)' }}>
                <span className="badge badge-error" style={{ width: 'fit-content' }}>ROLE 4</span>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--on-surface)' }}>Administrator</h4>
                <p style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>
                  System Governance, Policy Matrix Visibility, RBAC User Access, Audit Log Inspection.
                </p>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--outline)', marginTop: 'auto' }}>SCOPE: Global System Console</div>
              </div>

              <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8, borderLeft: '4px solid #78350f' }}>
                <span className="badge badge-amber" style={{ width: 'fit-content' }}>ROLE 5</span>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--on-surface)' }}>Customer Portal User</h4>
                <p style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>
                  Self-service Proposal Review, Counter-Offer Submission, 48h Stock Hold, Digital Invoice Payment.
                </p>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--outline)', marginTop: 'auto' }}>SCOPE: External Buyer Portal</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GOVERNANCE POLICIES */}
      {activeTab === 'policies' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="card-header flex-between">
              <div>
                <h3 className="headline-sm" style={{ color: 'var(--primary)' }}>Customer Tier Governance Specifications</h3>
                <p className="body-sm" style={{ color: 'var(--outline)' }}>
                  Distinction between <strong>Customer Tier</strong> (STANDARD / GOLD / PLATINUM) and <strong>Customer Purchase Type</strong> (ONE_TIME / BULK / RECURRING)
                </p>
              </div>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer Tier</th>
                    <th>Tier Max Discount</th>
                    <th>Fast-Path Discount</th>
                    <th>Credit Limit Floor</th>
                    <th>Supported Billing Types</th>
                    <th>SLA Commitment</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="badge badge-surface" style={{ fontSize: 12 }}>STANDARD</span></td>
                    <td className="font-mono font-semibold">10.0%</td>
                    <td className="font-mono text-emerald">≤ 5.0%</td>
                    <td className="font-mono">{formatCurrency(4000000)}</td>
                    <td>ONE_TIME, BULK_ONE_TIME</td>
                    <td>Standard 48-Hour Response</td>
                  </tr>
                  <tr>
                    <td><span className="badge badge-amber" style={{ fontSize: 12 }}>GOLD</span></td>
                    <td className="font-mono font-semibold text-amber">20.0%</td>
                    <td className="font-mono text-emerald">≤ 12.0%</td>
                    <td className="font-mono">{formatCurrency(12000000)}</td>
                    <td>ONE_TIME, RECURRING_FREE, RECURRING_PREMIUM</td>
                    <td>High-Priority 24-Hour SLA</td>
                  </tr>
                  <tr>
                    <td><span className="badge badge-secondary" style={{ fontSize: 12 }}>PLATINUM</span></td>
                    <td className="font-mono font-semibold text-secondary-color">30.0%</td>
                    <td className="font-mono text-emerald">≤ 20.0%</td>
                    <td className="font-mono">{formatCurrency(20000000)}</td>
                    <td>ONE_TIME, BULK_ONE_TIME, RECURRING_PREMIUM</td>
                    <td>Mission Critical 4-Hour SLA</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Rule Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingRule ? `Edit Governance Rule: ${editingRule.id}` : 'Add Governance Rule'}
      >
        <form onSubmit={handleSaveRule} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Rule Identifier *</label>
            <input
              type="text"
              className="form-control"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              placeholder="e.g. POL-CUSTOM-01"
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Governance Domain</label>
              <input
                type="text"
                className="form-control"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                placeholder="Discount Limit"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Target Tier / Scope</label>
              <input
                type="text"
                className="form-control"
                value={formData.scope}
                onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                placeholder="Gold Tier"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Enforcement Threshold</label>
            <input
              type="text"
              className="form-control"
              value={formData.threshold}
              onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
              placeholder="Max 25.0% Discount"
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>System Action</label>
            <input
              type="text"
              className="form-control"
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value })}
              placeholder="Requires Manager Approval"
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" onClick={() => setIsFormModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingRule ? 'Save Changes' : 'Create Rule'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Governance Specification — ${selectedRule?.id || ''}`}
      >
        {selectedRule && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'var(--surface-container-low)', padding: 14, borderRadius: 8 }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Rule ID</span>
                <strong className="font-mono text-primary-color" style={{ fontSize: 14 }}>{selectedRule.id}</strong>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Governance Domain</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{selectedRule.domain}</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Target Tier / Scope</span>
                <span className="badge badge-surface">{selectedRule.scope}</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Risk Rating</span>
                <span className="badge badge-amber">{selectedRule.risk}</span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block', marginBottom: 4 }}>Enforcement Threshold</span>
              <div style={{ padding: 10, background: '#fff', borderRadius: 6, border: '1px solid var(--outline-variant)', fontSize: 13, fontWeight: 600 }}>
                {selectedRule.threshold}
              </div>
            </div>

            <div>
              <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block', marginBottom: 4 }}>System Action Trigger</span>
              <div style={{ padding: 10, background: '#fff', borderRadius: 6, border: '1px solid var(--outline-variant)', fontSize: 13 }}>
                {selectedRule.action}
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

