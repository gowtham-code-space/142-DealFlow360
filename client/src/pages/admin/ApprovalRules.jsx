import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

const INITIAL_RULES = [
  { id: 'ARULE-101', name: 'Standard Tier Over-Discount', tier: 'STANDARD', conditions: 'Discount > 10% AND <= 20%', approver: 'Sales Manager (Single-Sig)', sla: '24 Hours', onExpire: 'Escalate to VP Sales', status: 'ACTIVE' },
  { id: 'ARULE-102', name: 'Gold Tier Over-Discount', tier: 'GOLD', conditions: 'Discount > 20% AND <= 30%', approver: 'Sales Manager (Single-Sig)', sla: '24 Hours', onExpire: 'Escalate to VP Sales', status: 'ACTIVE' },
  { id: 'ARULE-103', name: 'Platinum Tier Deep Discount', tier: 'PLATINUM', conditions: 'Discount > 30% AND <= 40%', approver: 'VP Sales & VP Finance (Dual-Sig)', sla: '12 Hours', onExpire: 'Escalate to CEO', status: 'ACTIVE' },
  { id: 'ARULE-201', name: 'Low Margin Profit Lock', tier: 'ALL', conditions: 'Gross Margin 22.0% - 29.9%', approver: 'Finance Ops Manager', sla: '18 Hours', onExpire: 'Require Cost Breakdown', status: 'ACTIVE' },
  { id: 'ARULE-301', name: 'Mega Deal Threshold Gate', tier: 'ALL', conditions: 'Total Value > ₹2,00,00,000', approver: 'VP Sales & VP Finance', sla: '8 Hours', onExpire: 'Urgent Executive Alert', status: 'ACTIVE' },
  { id: 'ARULE-999', name: 'Hard Ceiling System Floor', tier: 'ALL', conditions: 'Discount > 45% OR Margin < 22%', approver: 'System Auto-Reject', sla: 'Instant', onExpire: 'Block Deal Submission', status: 'HARD FLOOR' }
];

export default function ApprovalRules() {
  const [rules, setRules] = useState(INITIAL_RULES);
  const [filterTier, setFilterTier] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Form Modal State (Add / Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    id: '', name: '', tier: 'STANDARD', conditions: '', approver: '', sla: '24 Hours', onExpire: 'Escalate to VP Sales', status: 'ACTIVE'
  });
  const [formErrors, setFormErrors] = useState({});

  // View Detail Modal State
  const [viewRule, setViewRule] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleOpenAdd = () => {
    setEditingRule(null);
    setFormData({
      id: `ARULE-${Math.floor(100 + Math.random() * 900)}`,
      name: '', tier: 'STANDARD', conditions: '', approver: '', sla: '24 Hours', onExpire: 'Escalate to VP Sales', status: 'ACTIVE'
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (rule) => {
    setEditingRule(rule);
    setFormData({ ...rule });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Rule Name is required';
    if (!formData.conditions.trim()) errors.conditions = 'Trigger Conditions are required';
    if (!formData.approver.trim()) errors.approver = 'Assigned Approver is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingRule) {
      setRules(prev => prev.map(r => r.id === editingRule.id ? { ...formData } : r));
      showToast(`Approval rule "${formData.name}" updated successfully.`);
    } else {
      setRules(prev => [formData, ...prev]);
      showToast(`Approval rule "${formData.name}" created successfully.`);
    }
    setIsFormOpen(false);
  };

  const handleToggleStatus = (rule) => {
    if (rule.status === 'HARD FLOOR') return;
    const newStatus = rule.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    setRules(prev => prev.map(r => r.id === rule.id ? { ...r, status: newStatus } : r));
    showToast(`Rule ${rule.id} status changed to ${newStatus}.`);
  };

  const filteredRules = rules.filter(rule => {
    const matchesTier = filterTier === 'ALL' || rule.tier === filterTier || rule.tier === 'ALL';
    const matchesQuery = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rule.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rule.approver.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTier && matchesQuery;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Toast Notification */}
      <Toast message={toastMsg} onClose={() => setToastMsg('')} />

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
              <MS icon="rule" size={22} />
            </div>
            <div>
              <h1 className="headline-lg" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                Approval Rule Builder & Multi-Sig Escalation
              </h1>
              <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                Multi-Tier Approval Gates, Discount Threshold Routing, & Executive Multi-Sig Governance
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
            <MS icon="add" size={16} /> + New Approval Rule
          </button>
        </div>
      </div>

      {/* Telemetry Ribbon */}
      <div className="grid-metrics">
        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Active Chains</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>{rules.filter(r => r.status === 'ACTIVE').length} Active Rules</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Tier & Margin Conditionals</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Multi-Sig Gates</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>3 Levels</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Rep &rarr; Manager &rarr; VP Finance</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Auto-Approval SLA</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>&lt; 200ms</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Instant Fast-Path Rule</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Manager Timeout SLA</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-surface)' }}>24 Hours</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Auto-Escalation Gate</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Executive Threshold</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--error)' }}>&gt; ₹2.0 Cr</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Dual VP Signature Lock</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Rule Execution</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>Enforced</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Active Multi-Sig Chain</span>
        </div>
      </div>

      {/* Approval Flow Visualizer */}
      <div className="card card-body" style={{ background: 'var(--surface-container-low)', border: '1px solid rgba(209,195,202,0.3)' }}>
        <h3 className="headline-sm" style={{ color: 'var(--primary)', marginBottom: 12 }}>Multi-Tier Approval Hierarchy Visualization</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <div style={{ background: '#fff', padding: 12, borderRadius: 8, borderLeft: '4px solid var(--secondary)' }}>
            <span className="badge badge-secondary" style={{ fontSize: 10 }}>LEVEL 1</span>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>Fast-Path Auto-Approve</h4>
            <p style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 4 }}>
              Discount within Customer Tier Limit & Margin &ge; 35%. Instant execution without queue delay.
            </p>
          </div>

          <div style={{ background: '#fff', padding: 12, borderRadius: 8, borderLeft: '4px solid #f59e0b' }}>
            <span className="badge badge-amber" style={{ fontSize: 10 }}>LEVEL 2</span>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>Sales Manager Single-Sig</h4>
            <p style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 4 }}>
              Discount exceeds Tier Limit (up to 30%) or Margin between 22%-34.9%. Assigned to Regional Manager.
            </p>
          </div>

          <div style={{ background: '#fff', padding: 12, borderRadius: 8, borderLeft: '4px solid var(--primary)' }}>
            <span className="badge badge-primary" style={{ fontSize: 10 }}>LEVEL 3</span>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>Dual Executive Multi-Sig</h4>
            <p style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 4 }}>
              Discount &gt; 30% OR Contract Value &gt; ₹2.0 Cr. Requires signatures from VP Sales & VP Finance.
            </p>
          </div>

          <div style={{ background: '#fff', padding: 12, borderRadius: 8, borderLeft: '4px solid var(--error)' }}>
            <span className="badge badge-error" style={{ fontSize: 10 }}>LEVEL 4</span>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>Hard Policy Floor Block</h4>
            <p style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 4 }}>
              Discount &gt; 45% OR Margin &lt; 22%. System automatically rejects quote. No manual bypass permitted.
            </p>
          </div>
        </div>
      </div>

      {/* Approval Rule Matrix Table */}
      <div className="card">
        <div className="card-header flex-between">
          <div>
            <h3 className="headline-sm" style={{ color: 'var(--primary)' }}>Configured Approval Chains & Escalation Triggers</h3>
            <p className="body-sm" style={{ color: 'var(--outline)' }}>Rule priority, conditional logic, assigned approver roles, and enforcement status</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="Search approval rules..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ width: 200, height: 32 }}
            />
            <select
              value={filterTier}
              onChange={e => setFilterTier(e.target.value)}
              className="select-field"
              style={{ width: 140, height: 32 }}
            >
              <option value="ALL">All Tiers</option>
              <option value="STANDARD">Standard Tier</option>
              <option value="GOLD">Gold Tier</option>
              <option value="PLATINUM">Platinum Tier</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rule ID</th>
                <th>Rule Name</th>
                <th>Target Tier / Scope</th>
                <th>Trigger Conditions</th>
                <th>Assigned Approver</th>
                <th>Timeout SLA</th>
                <th>Action on Expire</th>
                <th>Status</th>
                <th>Ops</th>
              </tr>
            </thead>
            <tbody>
              {filteredRules.map(rule => (
                <tr key={rule.id}>
                  <td className="font-mono font-semibold">{rule.id}</td>
                  <td className="font-semibold" style={{ color: 'var(--on-surface)' }}>{rule.name}</td>
                  <td>
                    <span className={`badge ${rule.tier === 'PLATINUM' ? 'badge-secondary' : rule.tier === 'GOLD' ? 'badge-amber' : 'badge-surface'}`}>
                      {rule.tier}
                    </span>
                  </td>
                  <td className="font-mono">{rule.conditions}</td>
                  <td>{rule.approver}</td>
                  <td>{rule.sla}</td>
                  <td>{rule.onExpire}</td>
                  <td>
                    <span className={`badge ${rule.status === 'ACTIVE' ? 'badge-success' : rule.status === 'HARD FLOOR' ? 'badge-error' : 'badge-surface'}`}>
                      {rule.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => setViewRule(rule)} className="btn btn-outline btn-sm" title="View Details">
                        View
                      </button>
                      <button onClick={() => handleOpenEdit(rule)} className="btn btn-outline btn-sm" title="Edit Rule">
                        Edit
                      </button>
                      {rule.status !== 'HARD FLOOR' && (
                        <button
                          onClick={() => handleToggleStatus(rule)}
                          className={`btn btn-sm ${rule.status === 'ACTIVE' ? 'btn-outline' : 'btn-primary'}`}
                          style={{ fontSize: 10, padding: '2px 6px' }}
                        >
                          {rule.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Rule Modal Form */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingRule ? `Edit Approval Rule — ${editingRule.id}` : 'Create New Approval Chain Rule'}
      >
        <form onSubmit={handleSaveForm} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="input-group">
            <label className="input-label">Rule Identifier</label>
            <input
              type="text"
              value={formData.id}
              disabled
              className="input-field font-mono"
              style={{ background: 'var(--surface-container-low)' }}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Rule Name *</label>
            <input
              type="text"
              placeholder="e.g. Gold Tier Discount Escalation"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
            />
            {formErrors.name && <span style={{ color: 'var(--error)', fontSize: 11, marginTop: 2 }}>{formErrors.name}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="input-group">
              <label className="input-label">Target Tier / Scope *</label>
              <select
                value={formData.tier}
                onChange={e => setFormData({ ...formData, tier: e.target.value })}
                className="select-field"
              >
                <option value="STANDARD">Standard Tier</option>
                <option value="GOLD">Gold Tier</option>
                <option value="PLATINUM">Platinum Tier</option>
                <option value="ALL">All Tiers / Global</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Rule Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="select-field"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="DISABLED">DISABLED</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Trigger Conditions *</label>
            <input
              type="text"
              placeholder="e.g. Discount > 20% AND <= 30%"
              value={formData.conditions}
              onChange={e => setFormData({ ...formData, conditions: e.target.value })}
              className="input-field font-mono"
            />
            {formErrors.conditions && <span style={{ color: 'var(--error)', fontSize: 11, marginTop: 2 }}>{formErrors.conditions}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Assigned Approver Role *</label>
            <input
              type="text"
              placeholder="e.g. Sales Manager (Single-Sig)"
              value={formData.approver}
              onChange={e => setFormData({ ...formData, approver: e.target.value })}
              className="input-field"
            />
            {formErrors.approver && <span style={{ color: 'var(--error)', fontSize: 11, marginTop: 2 }}>{formErrors.approver}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="input-group">
              <label className="input-label">Timeout SLA</label>
              <select
                value={formData.sla}
                onChange={e => setFormData({ ...formData, sla: e.target.value })}
                className="select-field"
              >
                <option value="Instant">Instant</option>
                <option value="8 Hours">8 Hours</option>
                <option value="12 Hours">12 Hours</option>
                <option value="18 Hours">18 Hours</option>
                <option value="24 Hours">24 Hours</option>
                <option value="48 Hours">48 Hours</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Action on Expire</label>
              <input
                type="text"
                placeholder="e.g. Escalate to VP Sales"
                value={formData.onExpire}
                onChange={e => setFormData({ ...formData, onExpire: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" onClick={() => setIsFormOpen(false)} className="btn btn-outline">
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
        isOpen={!!viewRule}
        onClose={() => setViewRule(null)}
        title={`Approval Rule Inspector — ${viewRule?.id}`}
      >
        {viewRule && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: 14, borderRadius: 8, background: 'var(--surface-container-low)', border: '1px solid rgba(209,195,202,0.3)' }}>
              <div style={{ fontSize: 11, color: 'var(--outline)', textTransform: 'uppercase', fontWeight: 600 }}>Rule Name</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)', marginTop: 2 }}>{viewRule.name}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: '#fff', padding: 10, borderRadius: 6, border: '1px solid rgba(209,195,202,0.3)' }}>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Target Tier</span>
                <strong style={{ fontSize: 13, color: 'var(--on-surface)' }}>{viewRule.tier}</strong>
              </div>
              <div style={{ background: '#fff', padding: 10, borderRadius: 6, border: '1px solid rgba(209,195,202,0.3)' }}>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Rule Status</span>
                <strong style={{ fontSize: 13, color: 'var(--secondary)' }}>{viewRule.status}</strong>
              </div>
            </div>

            <div style={{ background: '#fff', padding: 10, borderRadius: 6, border: '1px solid rgba(209,195,202,0.3)' }}>
              <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Trigger Conditions</span>
              <code style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>{viewRule.conditions}</code>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: '#fff', padding: 10, borderRadius: 6, border: '1px solid rgba(209,195,202,0.3)' }}>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Assigned Approver</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{viewRule.approver}</span>
              </div>
              <div style={{ background: '#fff', padding: 10, borderRadius: 6, border: '1px solid rgba(209,195,202,0.3)' }}>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Timeout SLA & Escalation</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{viewRule.sla} &rarr; {viewRule.onExpire}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button onClick={() => { const r = viewRule; setViewRule(null); handleOpenEdit(r); }} className="btn btn-outline">
                Edit Rule
              </button>
              <button onClick={() => setViewRule(null)} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
