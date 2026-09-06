import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

export default function ApprovalRules() {
  const { showToast, toast } = useToast();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterTier, setFilterTier] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Form Modal State (Add / Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    tier: 'STANDARD',
    salesRepOnlyMaxOverCeilingPct: 5.0,
    financeThresholdOverCeilingPct: 15.0,
    conditions: '',
    approver: 'Sales Manager / Finance Ops',
    sla: '24 Hours',
    onExpire: 'Escalate to VP Sales',
    status: 'ACTIVE'
  });
  const [formErrors, setFormErrors] = useState({});

  // View Detail Modal State
  const [viewRule, setViewRule] = useState(null);

  const loadRules = async () => {
    setLoading(true);
    try {
      const res = await api.getApprovalChains();
      if (res && res.success && Array.isArray(res.data)) {
        const mapped = res.data.map(r => ({
          id: r.id,
          name: r.description || `Approval Rule (${r.id})`,
          tier: 'ALL',
          salesRepOnlyMaxOverCeilingPct: Number(r.salesRepOnlyMaxOverCeilingPct || 5),
          financeThresholdOverCeilingPct: Number(r.financeThresholdOverCeilingPct || 15),
          conditions: `Rep Max: ${r.salesRepOnlyMaxOverCeilingPct}% over ceiling | Finance: >${r.financeThresholdOverCeilingPct}%`,
          approver: Number(r.financeThresholdOverCeilingPct) > 15 ? 'Finance Ops Manager' : 'Sales Manager / Approver',
          sla: '24 Hours',
          onExpire: 'Escalate to VP Sales',
          status: r.isActive !== false ? 'ACTIVE' : 'DISABLED'
        }));
        setRules(mapped);
      }
    } catch {
      showToast('Could not load approval rules from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleOpenAdd = () => {
    setEditingRule(null);
    setFormData({
      id: '',
      name: '',
      tier: 'STANDARD',
      salesRepOnlyMaxOverCeilingPct: 5.0,
      financeThresholdOverCeilingPct: 15.0,
      conditions: '',
      approver: 'Sales Manager / Approver',
      sla: '24 Hours',
      onExpire: 'Escalate to VP Sales',
      status: 'ACTIVE'
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

  const handleSaveForm = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Rule Description is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      description: formData.name,
      salesRepOnlyMaxOverCeilingPct: Number(formData.salesRepOnlyMaxOverCeilingPct || 5),
      financeThresholdOverCeilingPct: Number(formData.financeThresholdOverCeilingPct || 15),
      isActive: formData.status === 'ACTIVE'
    };

    if (editingRule) {
      const res = await api.updateApprovalChain(editingRule.id, payload);
      if (res && res.success) {
        showToast(`Approval rule "${formData.name}" updated successfully.`);
        loadRules();
      } else {
        showToast(res?.message || 'Failed to update rule');
      }
    } else {
      const res = await api.createApprovalChain(payload);
      if (res && res.success) {
        showToast(`Approval rule "${formData.name}" created successfully.`);
        loadRules();
      } else {
        showToast(res?.message || 'Failed to create rule');
      }
    }

    setIsFormOpen(false);
  };

  const handleToggleStatus = async (rule) => {
    const isActivating = rule.status !== 'ACTIVE';
    const res = await api.updateApprovalChain(rule.id, {
      description: rule.name,
      salesRepOnlyMaxOverCeilingPct: rule.salesRepOnlyMaxOverCeilingPct,
      financeThresholdOverCeilingPct: rule.financeThresholdOverCeilingPct,
      isActive: isActivating
    });

    if (res && res.success) {
      showToast(`Rule ${rule.id} status updated.`);
      loadRules();
    } else {
      showToast(res?.message || 'Failed to update status');
    }
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

      {/* Approval Rule Matrix Table */}
      <div className="card">
        <div className="card-header flex-between">
          <div>
            <h3 className="headline-sm" style={{ color: 'var(--primary)' }}>Configured Approval Chains & Escalation Triggers</h3>
            <p className="body-sm" style={{ color: 'var(--outline)' }}>Rule priority, conditional logic, assigned approver roles, and enforcement status</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="search-bar" style={{ minWidth: 220 }}>
              <MS icon="search" size={18} />
              <input
                type="text"
                placeholder="Search approval rules..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={filterTier}
              onChange={e => setFilterTier(e.target.value)}
              className="select-input"
              style={{ minWidth: 140 }}
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
