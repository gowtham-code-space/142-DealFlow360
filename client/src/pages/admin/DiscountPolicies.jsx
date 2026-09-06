import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

const DEFAULT_POLICY_FORM = {
  id: '',
  policyName: '',
  tier: 'STANDARD',
  category: 'Hardware',
  autoApproveCap: 10.0,
  hardRejectionCap: 45.0,
  marginFloor: 20.0,
  stacking: 'Volume + Line Discount',
  status: 'Active'
};

export default function DiscountPolicies() {
  const { showToast, toast } = useToast();
  const [policies, setPolicies] = useState([]);
  const [discountTypes, setDiscountTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);

  const [editingPolicy, setEditingPolicy] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [editingType, setEditingType] = useState(null);

  // Form State
  const [formData, setFormData] = useState(DEFAULT_POLICY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [typeFormData, setTypeFormData] = useState({
    id: '',
    name: '',
    code: '',
    description: '',
    calculationType: 'PERCENTAGE',
    defaultValue: 0,
    isActive: true
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [polRes, typesRes] = await Promise.all([
        api.getDiscountPolicies(),
        api.getDiscountTypes()
      ]);

      if (polRes && polRes.success && Array.isArray(polRes.data)) {
        const mapped = polRes.data.map(p => ({
          id: p.id,
          tier: p.customerTier,
          policyName: `${p.customerTier} Tier — ${p.productCategory}`,
          category: p.productCategory,
          autoApproveCap: Number(p.maxDiscountPct),
          managerReviewRange: `${(Number(p.maxDiscountPct) + 0.1).toFixed(1)}% - ${Math.min(Number(p.maxDiscountPct) + 10, 45).toFixed(1)}%`,
          executiveRange: `${(Math.min(Number(p.maxDiscountPct) + 10, 45) + 0.1).toFixed(1)}% - 45.0%`,
          hardRejectionCap: 45.0,
          marginFloor: 20.0,
          stacking: 'Tier Matrix Rule',
          status: p.isActive !== false ? 'Active' : 'Inactive'
        }));
        setPolicies(mapped);
      }

      if (typesRes && typesRes.success && Array.isArray(typesRes.data)) {
        setDiscountTypes(typesRes.data);
      }
    } catch {
      showToast('Could not load discount policies from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Open Form for Add
  const handleOpenAddModal = () => {
    setEditingPolicy(null);
    setFormData({
      ...DEFAULT_POLICY_FORM,
      id: ''
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open Form for Edit
  const handleOpenEditModal = (pol) => {
    setEditingPolicy(pol);
    setFormData({ ...pol });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open Discount Type Edit
  const handleOpenTypeEdit = (dt) => {
    setEditingType(dt);
    setTypeFormData({
      id: dt.id,
      name: dt.name || '',
      code: dt.code || '',
      description: dt.description || '',
      calculationType: dt.calculationType || 'PERCENTAGE',
      defaultValue: Number(dt.defaultValue || 0),
      isActive: dt.isActive !== false
    });
    setIsTypeModalOpen(true);
  };

  const handleSaveType = async (e) => {
    e.preventDefault();
    if (!editingType) return;
    try {
      const res = await api.updateDiscountType(editingType.id, {
        name: typeFormData.name,
        description: typeFormData.description,
        defaultValue: Number(typeFormData.defaultValue),
        isActive: typeFormData.isActive
      });
      if (res && res.success) {
        showToast(`Discount rule "${typeFormData.name}" updated successfully.`);
        loadData();
      } else {
        showToast(res?.message || 'Failed to update discount rule', 'error');
      }
    } catch {
      showToast('Failed to update discount rule', 'error');
    }
    setIsTypeModalOpen(false);
  };

  // Open Detail Modal
  const handleOpenDetailModal = (pol) => {
    setSelectedPolicy(pol);
    setIsDetailModalOpen(true);
  };

  // Open Confirm Deactivate Modal
  const handleOpenConfirmModal = (pol) => {
    setSelectedPolicy(pol);
    setIsConfirmModalOpen(true);
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (formData.autoApproveCap < 0 || formData.autoApproveCap > 100) errors.autoApproveCap = 'Auto Approve Cap must be 0-100%';
    if (formData.hardRejectionCap <= formData.autoApproveCap) errors.hardRejectionCap = 'Hard Rejection Cap must exceed Auto Approve Cap';
    if (formData.marginFloor < 0 || formData.marginFloor > 100) errors.marginFloor = 'Margin floor must be 0-100%';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Save
  const handleSavePolicy = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const maxDiscountPct = Number(formData.autoApproveCap);

    if (editingPolicy) {
      const res = await api.updateDiscountPolicy(editingPolicy.id, {
        maxDiscountPct,
        isActive: formData.status === 'Active'
      });

      if (res && res.success) {
        showToast(`Discount policy updated successfully.`);
        loadData();
      } else {
        showToast(res?.message || 'Failed to update policy', 'error');
      }
    } else {
      const res = await api.createDiscountPolicy({
        customerTier: formData.tier,
        productCategory: formData.category,
        maxDiscountPct
      });

      if (res && res.success) {
        showToast(`New discount policy created successfully.`);
        loadData();
      } else {
        showToast(res?.message || 'Failed to create policy', 'error');
      }
    }

    setIsFormModalOpen(false);
  };

  // Handle Toggle Status
  const handleToggleStatus = async () => {
    if (!selectedPolicy) return;
    const isActivating = selectedPolicy.status !== 'Active';

    const res = await api.updateDiscountPolicy(selectedPolicy.id, {
      maxDiscountPct: selectedPolicy.autoApproveCap,
      isActive: isActivating
    });

    if (res && res.success) {
      showToast(`Policy status updated.`, 'info');
      loadData();
    } else {
      showToast(res?.message || 'Failed to update status', 'error');
    }
    setIsConfirmModalOpen(false);
  };

  // Handle Delete Policy
  const handleDeletePolicy = async (pol) => {
    if (!pol.id) return;
    if (!window.confirm(`Are you sure you want to permanently delete policy "${pol.policyName}"?`)) return;
    try {
      const res = await api.deleteDiscountPolicy(pol.id);
      if (res && res.success) {
        showToast('Discount policy deleted.');
        loadData();
      } else {
        showToast(res?.message || 'Failed to delete policy', 'error');
      }
    } catch {
      showToast('Failed to delete policy from server', 'error');
    }
  };

  // Filtered Policies
  const filteredPolicies = policies.filter(p =>
    p.policyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.tier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <MS icon="percent" size={22} />
            </div>
            <div>
              <h1 className="headline-lg" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                Discount Policy Governance & Mathematical Guardrails
              </h1>
              <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                System-Wide Discount Limits, Margin Formula Engine, Stacking Rules & Automated Rejection Ceiling
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={handleOpenAddModal} className="btn btn-primary btn-sm">
            <MS icon="add" size={16} /> + New Guardrail Rule
          </button>
        </div>
      </div>

      {/* Telemetry Ribbon */}
      <div className="grid-metrics">
        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Hard Policy Ceiling</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--error)' }}>45.0% Max</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Automated System Block</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Margin Floor Lock</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>22.0% Min</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Enforced Gross Profit</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Active Guardrails</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>{policies.filter(p => p.status === 'Active').length} Policies</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>By Customer Tier</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Executive Escalation</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>&gt; 30% Disc</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Dual Sign Required</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Discount Stacking</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-surface)' }}>Linear Non-Additive</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Prevents Double Discounting</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Evaluator Mode</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>Active</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Guardrail Engine Enforced</span>
        </div>
      </div>

      {/* Tier Discount Limits Table */}
      <div className="card">
        <div className="card-header flex-between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 className="headline-sm" style={{ color: 'var(--primary)' }}>Discount Ceiling Matrix by Customer Tier</h3>
            <p className="body-sm" style={{ color: 'var(--outline)' }}>Fast-path thresholds, manager review triggers, and executive escalation limits</p>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search policy tier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '6px 12px 6px 32px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--outline-variant)',
                fontSize: 13,
                width: 200
              }}
            />
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: 8, top: 7, fontSize: 18, color: 'var(--outline)' }}>
              search
            </span>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Tier</th>
                <th>Policy Name</th>
                <th>Auto-Approve Cap</th>
                <th>Manager Review Range</th>
                <th>Executive Dual-Sig Range</th>
                <th>Hard System Rejection</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPolicies.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 30, color: 'var(--outline)' }}>
                    No discount policies match your search.
                  </td>
                </tr>
              ) : (
                filteredPolicies.map((pol) => (
                  <tr key={pol.id} style={{ opacity: pol.status === 'Inactive' ? 0.6 : 1 }}>
                    <td>
                      <span className={`badge ${pol.tier === 'PLATINUM' ? 'badge-secondary' : pol.tier === 'GOLD' ? 'badge-amber' : 'badge-surface'}`}>
                        {pol.tier}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{pol.policyName}</div>
                      <div style={{ fontSize: 11, color: 'var(--outline)' }}>Category: {pol.category}</div>
                    </td>
                    <td className="font-mono text-emerald">&le; {pol.autoApproveCap.toFixed(1)}%</td>
                    <td className="font-mono text-amber">{pol.managerReviewRange}</td>
                    <td className="font-mono text-primary-color">{pol.executiveRange}</td>
                    <td className="font-mono text-error">&gt; {pol.hardRejectionCap.toFixed(1)}%</td>
                    <td>
                      <span className={`badge ${pol.status === 'Active' ? 'badge-success' : 'badge-error'}`}>
                        {pol.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleOpenDetailModal(pol)} className="btn btn-outline btn-sm" title="View Details">
                          View
                        </button>
                        <button onClick={() => handleOpenEditModal(pol)} className="btn btn-outline btn-sm" title="Configure Policy">
                          Edit
                        </button>
                        <button onClick={() => handleOpenConfirmModal(pol)} className="btn btn-outline btn-sm" style={{ color: pol.status === 'Active' ? '#dc2626' : '#16a34a' }}>
                          {pol.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeletePolicy(pol)}
                          className="btn btn-outline btn-sm"
                          style={{ color: '#dc2626', borderColor: 'rgba(220,38,38,0.3)', padding: '3px 8px' }}
                          title="Delete policy"
                        >
                          <MS icon="delete" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mathematical Margin Guardrail Formula Card */}
      <div className="card card-body" style={{ background: 'var(--surface-container-low)', border: '1px solid rgba(209,195,202,0.3)' }}>
        <h3 className="headline-sm" style={{ color: 'var(--primary)', marginBottom: 8 }}>Automated Margin Formula Engine Specification</h3>
        <p className="body-sm" style={{ color: 'var(--on-surface-variant)', marginBottom: 12 }}>
          DealFlow360 calculates gross margin dynamically for every line item using the canonical formula:
        </p>
        <div style={{ background: '#fff', padding: 14, borderRadius: 8, fontFamily: 'monospace', fontSize: 13, color: 'var(--primary)', fontWeight: 700 }}>
          Calculated Margin % = Max ( 12.0% , 50.0% - ( Discount % &times; 0.8 ) )
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 12 }}>
          <div style={{ background: '#fff', padding: 10, borderRadius: 6, fontSize: 11 }}>
            <strong>HEALTHY MARGIN:</strong> Gross Margin &ge; 35.0%. Quote passes auto-approval evaluation.
          </div>
          <div style={{ background: '#fff', padding: 10, borderRadius: 6, fontSize: 11 }}>
            <strong>WARNING / FLOOR LOCK:</strong> Gross Margin &lt; 35.0%. Requires Manager override; &lt; 22.0% triggers system rejection.
          </div>
        </div>
      </div>

      {/* Discount Types & Promotional Rules Section */}
      <div className="card">
        <div className="card-header flex-between">
          <div>
            <h3 className="headline-sm" style={{ color: 'var(--primary)' }}>Discount Types & Calculation Rules</h3>
            <p className="body-sm" style={{ color: 'var(--outline)' }}>Base promotional rules (Bulk, Consistency, Seasonal, Product Variant)</p>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount Type Name</th>
                <th>Calculation Logic</th>
                <th>Default Rate / Value</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {discountTypes.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--outline)' }}>
                    No discount type rules loaded.
                  </td>
                </tr>
              ) : (
                discountTypes.map((dt) => (
                  <tr key={dt.id}>
                    <td className="font-mono font-semibold">{dt.code}</td>
                    <td style={{ fontWeight: 600 }}>{dt.name}</td>
                    <td><span className="badge badge-surface">{dt.calculationType || 'PERCENTAGE'}</span></td>
                    <td className="font-mono font-bold text-emerald">
                      {dt.defaultValue ? `${dt.defaultValue}%` : 'Variable'}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{dt.description || 'System rule'}</td>
                    <td>
                      <span className={`badge ${dt.isActive !== false ? 'badge-success' : 'badge-error'}`}>
                        {dt.isActive !== false ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleOpenTypeEdit(dt)} className="btn btn-outline btn-sm">
                        Edit Rule
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Discount Type Edit Modal */}
      <Modal
        isOpen={isTypeModalOpen}
        onClose={() => setIsTypeModalOpen(false)}
        title={`Configure Discount Type: ${typeFormData.name || typeFormData.code}`}
      >
        <form onSubmit={handleSaveType} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Rule Name *</label>
            <input
              type="text"
              className="form-control"
              value={typeFormData.name}
              onChange={(e) => setTypeFormData({ ...typeFormData, name: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Default Rate (%) *</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              className="form-control"
              value={typeFormData.defaultValue}
              onChange={(e) => setTypeFormData({ ...typeFormData, defaultValue: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Description / Scope</label>
            <textarea
              className="form-control"
              rows={3}
              value={typeFormData.description}
              onChange={(e) => setTypeFormData({ ...typeFormData, description: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button type="button" onClick={() => setIsTypeModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Discount Rule
            </button>
          </div>
        </form>
      </Modal>

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingPolicy ? `Configure Policy: ${editingPolicy.tier}` : 'Create New Discount Guardrail Policy'}
      >
        <form onSubmit={handleSavePolicy} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Policy Rule Name *</label>
            <input
              type="text"
              className="form-control"
              value={formData.policyName}
              onChange={(e) => setFormData({ ...formData, policyName: e.target.value })}
              placeholder="e.g. Gold Tier Hardware Guardrail"
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}
            />
            {formErrors.policyName && <span style={{ color: '#dc2626', fontSize: 11 }}>{formErrors.policyName}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Customer Tier *</label>
              <select
                className="form-control"
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', background: '#fff' }}
              >
                <option value="STANDARD">STANDARD</option>
                <option value="GOLD">GOLD</option>
                <option value="PLATINUM">PLATINUM</option>
                <option value="ENTERPRISE">ENTERPRISE</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Product Category</label>
              <select
                className="form-control"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', background: '#fff' }}
              >
                <option value="ALL">ALL Categories</option>
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Service">Service</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Auto-Approve Cap (% max) *</label>
              <input
                type="number"
                step="0.5"
                className="form-control"
                value={formData.autoApproveCap}
                onChange={(e) => setFormData({ ...formData, autoApproveCap: Number(e.target.value) })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}
              />
              {formErrors.autoApproveCap && <span style={{ color: '#dc2626', fontSize: 11 }}>{formErrors.autoApproveCap}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Hard Rejection Cap (% ceiling) *</label>
              <input
                type="number"
                step="0.5"
                className="form-control"
                value={formData.hardRejectionCap}
                onChange={(e) => setFormData({ ...formData, hardRejectionCap: Number(e.target.value) })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}
              />
              {formErrors.hardRejectionCap && <span style={{ color: '#dc2626', fontSize: 11 }}>{formErrors.hardRejectionCap}</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Margin Floor Lock (%) *</label>
              <input
                type="number"
                step="0.5"
                className="form-control"
                value={formData.marginFloor}
                onChange={(e) => setFormData({ ...formData, marginFloor: Number(e.target.value) })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}
              />
              {formErrors.marginFloor && <span style={{ color: '#dc2626', fontSize: 11 }}>{formErrors.marginFloor}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Discount Stacking Rule</label>
              <select
                className="form-control"
                value={formData.stacking}
                onChange={(e) => setFormData({ ...formData, stacking: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', background: '#fff' }}
              >
                <option value="Single Line Discount">Single Line Discount</option>
                <option value="Volume + Line Discount">Volume + Line Discount</option>
                <option value="Custom SLA + Line Discount">Custom SLA + Line Discount</option>
                <option value="Non-Additive Cap">Non-Additive Strict Cap</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" onClick={() => setIsFormModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingPolicy ? 'Save Policy Guardrail' : 'Create Guardrail Rule'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Policy Details — ${selectedPolicy?.policyName || ''}`}
      >
        {selectedPolicy && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'var(--surface-container-low)', padding: 14, borderRadius: 8 }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Policy ID</span>
                <strong className="font-mono" style={{ fontSize: 14 }}>{selectedPolicy.id}</strong>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Customer Tier</span>
                <span className={`badge ${selectedPolicy.tier === 'PLATINUM' ? 'badge-secondary' : selectedPolicy.tier === 'GOLD' ? 'badge-amber' : 'badge-surface'}`}>
                  {selectedPolicy.tier}
                </span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Auto-Approve Fast Path</span>
                <span className="font-mono text-emerald" style={{ fontSize: 14, fontWeight: 700 }}>&le; {selectedPolicy.autoApproveCap.toFixed(1)}%</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Manager Review Range</span>
                <span className="font-mono text-amber" style={{ fontSize: 14 }}>{selectedPolicy.managerReviewRange}</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Executive Escalation Range</span>
                <span className="font-mono text-primary-color" style={{ fontSize: 14 }}>{selectedPolicy.executiveRange}</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Hard System Rejection</span>
                <span className="font-mono text-error" style={{ fontSize: 14, fontWeight: 700 }}>&gt; {selectedPolicy.hardRejectionCap.toFixed(1)}%</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Margin Floor</span>
                <span className="font-mono" style={{ fontSize: 14 }}>{selectedPolicy.marginFloor.toFixed(1)}%</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Stacking Governance</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{selectedPolicy.stacking}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => { setIsDetailModalOpen(false); handleOpenEditModal(selectedPolicy); }} className="btn btn-outline">
                Configure Policy
              </button>
              <button onClick={() => setIsDetailModalOpen(false)} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title={selectedPolicy?.status === 'Active' ? 'Deactivate Discount Guardrail Rule?' : 'Activate Discount Guardrail Rule?'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 14, color: 'var(--on-surface)' }}>
            Are you sure you want to {selectedPolicy?.status === 'Active' ? 'deactivate' : 'activate'} policy <strong>{selectedPolicy?.policyName} ({selectedPolicy?.tier})</strong>?
          </p>
          <p style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>
            {selectedPolicy?.status === 'Active'
              ? 'Deactivating this guardrail rule will revert this tier to default baseline discount thresholds.'
              : 'Activating this rule will enforce configured discount ceilings during quotation creation.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button onClick={() => setIsConfirmModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button
              onClick={handleToggleStatus}
              className={`btn ${selectedPolicy?.status === 'Active' ? 'btn-error' : 'btn-primary'}`}
            >
              {selectedPolicy?.status === 'Active' ? 'Deactivate Policy' : 'Activate Policy'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

