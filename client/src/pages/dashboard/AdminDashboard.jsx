import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';
import { api } from '../../services/api';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

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
  const { showToast, toast } = useToast();

  const [rules, setRules] = useState(INITIAL_RULES);
  const [loading, setLoading] = useState(false);

  const fetchLiveGovernance = async () => {
    setLoading(true);
    try {
      const [polRes, appRes] = await Promise.all([
        api.getDiscountPolicies(),
        api.getApprovalChains()
      ]);
      const dynamicRules = [];
      if (polRes && polRes.success && Array.isArray(polRes.data) && polRes.data.length > 0) {
        polRes.data.forEach(p => {
          dynamicRules.push({
            id: p.id,
            domain: 'Discount Ceiling',
            scope: `${p.customerTier} Tier — ${p.productCategory || 'All'}`,
            threshold: `Max ${p.maxDiscountPct}% Discount`,
            action: 'Manager Review required if exceeded',
            risk: Number(p.maxDiscountPct) > 25 ? 'HIGH RISK' : 'LOW RISK',
            status: p.isActive !== false ? 'ACTIVE' : 'DISABLED',
            raw: p
          });
        });
      }
      if (appRes && appRes.success && Array.isArray(appRes.data) && appRes.data.length > 0) {
        appRes.data.forEach(a => {
          dynamicRules.push({
            id: a.id,
            domain: 'Approval Routing',
            scope: 'All Tiers',
            threshold: `Rep Max: ${a.salesRepOnlyMaxOverCeilingPct}% | Finance: >${a.financeThresholdOverCeilingPct}%`,
            action: a.description || 'Approval Gate Trigger',
            risk: Number(a.financeThresholdOverCeilingPct) > 15 ? 'HIGH RISK' : 'MEDIUM RISK',
            status: a.isActive !== false ? 'ACTIVE' : 'DISABLED',
            raw: a
          });
        });
      }
      if (dynamicRules.length > 0) {
        setRules(dynamicRules);
      } else {
        setRules(INITIAL_RULES);
      }
    } catch {
      setRules(INITIAL_RULES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveGovernance();
  }, []);

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [selectedRule, setSelectedRule] = useState(null);

  const [formData, setFormData] = useState({
    id: '',
    domain: 'Discount Ceiling',
    scope: 'STANDARD',
    threshold: 15.0,
    action: 'Requires Manager Approval',
    risk: 'MEDIUM RISK',
    status: 'ACTIVE'
  });

  const setTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  const handleOpenAddModal = () => {
    setEditingRule(null);
    setFormData({
      id: '',
      domain: 'Discount Ceiling',
      scope: 'STANDARD',
      threshold: 15.0,
      action: 'Requires Manager Approval',
      risk: 'MEDIUM RISK',
      status: 'ACTIVE'
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (rule) => {
    setEditingRule(rule);
    setFormData({
      ...rule,
      threshold: rule.raw?.maxDiscountPct || rule.raw?.salesRepOnlyMaxOverCeilingPct || 15.0,
      scope: rule.raw?.customerTier || 'STANDARD'
    });
    setIsFormModalOpen(true);
  };

  const handleOpenDetailModal = (rule) => {
    setSelectedRule(rule);
    setIsDetailModalOpen(true);
  };

  const handleSaveRule = async (e) => {
    e.preventDefault();
    try {
      if (formData.domain === 'Discount Ceiling') {
        if (editingRule && editingRule.raw?.id) {
          const res = await api.updateDiscountPolicy(editingRule.raw.id, {
            maxDiscountPct: Number(formData.threshold),
            isActive: formData.status === 'ACTIVE'
          });
          if (res && res.success) {
            showToast('Discount governance policy updated.');
          } else {
            showToast(res?.message || 'Failed to update policy', 'error');
          }
        } else {
          const res = await api.createDiscountPolicy({
            customerTier: formData.scope || 'STANDARD',
            productCategory: 'Hardware',
            maxDiscountPct: Number(formData.threshold)
          });
          if (res && res.success) {
            showToast('Discount governance policy created.');
          } else {
            showToast(res?.message || 'Failed to create policy', 'error');
          }
        }
      } else {
        if (editingRule && editingRule.raw?.id) {
          const res = await api.updateApprovalChain(editingRule.raw.id, {
            description: formData.action || 'Approval Rule',
            salesRepOnlyMaxOverCeilingPct: Number(formData.threshold),
            isActive: formData.status === 'ACTIVE'
          });
          if (res && res.success) {
            showToast('Approval governance rule updated.');
          } else {
            showToast(res?.message || 'Failed to update approval rule', 'error');
          }
        } else {
          const res = await api.createApprovalChain({
            description: formData.action || 'Approval Gate Rule',
            salesRepOnlyMaxOverCeilingPct: Number(formData.threshold),
            financeThresholdOverCeilingPct: 15.0,
            isActive: formData.status === 'ACTIVE'
          });
          if (res && res.success) {
            showToast('Approval governance rule created.');
          } else {
            showToast(res?.message || 'Failed to create approval rule', 'error');
          }
        }
      }
      fetchLiveGovernance();
    } catch {
      showToast('Failed to save governance rule to server', 'error');
    }
    setIsFormModalOpen(false);
  };

  const handleExportReport = () => {
    try {
      const spec = {
        title: 'DealFlow360 Enterprise Governance Specification',
        generatedAt: new Date().toISOString(),
        totalRules: rules.length,
        rules: rules
      };
      const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `dealflow360_governance_spec_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Governance specification exported.');
    } catch {
      showToast('Failed to export governance spec', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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

