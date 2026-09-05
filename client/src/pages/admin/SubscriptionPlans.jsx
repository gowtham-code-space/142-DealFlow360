import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

const INITIAL_PLANS = [
  {
    id: 'PLAN-SAAS-STR',
    name: 'DealFlow SaaS Starter',
    billingCycle: 'RECURRING_MONTHLY',
    price: 15000,
    seats: '10 User Seats',
    sla: 'Standard SLA (48h)',
    indexation: 3.0,
    features: 'Basic Quote Engine, Standard SLA, 10 Rep Seats',
    status: 'Active'
  },
  {
    id: 'PLAN-SAAS-GRW',
    name: 'DealFlow SaaS Growth',
    billingCycle: 'RECURRING_MONTHLY',
    price: 35000,
    seats: '50 User Seats',
    sla: 'High-Priority SLA (24h)',
    indexation: 4.0,
    features: 'Advanced Governance Rules, 24/7 Support, 50 Rep Seats',
    status: 'Active'
  },
  {
    id: 'PLAN-SAAS-ENT',
    name: 'DealFlow SaaS Enterprise',
    billingCycle: 'RECURRING_ANNUAL',
    price: 100000,
    seats: 'Unlimited Seats',
    sla: 'Mission Critical SLA (4h)',
    indexation: 5.0,
    features: 'Full Governance Suite, Executive Escalation, Unlimited Seats',
    status: 'Active'
  }
];

const DEFAULT_PLAN_FORM = {
  id: '',
  name: '',
  billingCycle: 'RECURRING_MONTHLY',
  price: 25000,
  seats: '25 User Seats',
  sla: 'High-Priority SLA (24h)',
  indexation: 3.5,
  features: '',
  status: 'Active'
};

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState(INITIAL_PLANS);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const [editingPlan, setEditingPlan] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Form state
  const [formData, setFormData] = useState(DEFAULT_PLAN_FORM);
  const [formErrors, setFormErrors] = useState({});

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Open Form for Add
  const handleOpenAddModal = () => {
    setEditingPlan(null);
    setFormData({
      ...DEFAULT_PLAN_FORM,
      id: `PLAN-SAAS-${String(plans.length + 1).padStart(3, '0')}`
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open Form for Edit
  const handleOpenEditModal = (plan) => {
    setEditingPlan(plan);
    setFormData({ ...plan });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open Detail Modal
  const handleOpenDetailModal = (plan) => {
    setSelectedPlan(plan);
    setIsDetailModalOpen(true);
  };

  // Open Confirm Deactivate Modal
  const handleOpenConfirmModal = (plan) => {
    setSelectedPlan(plan);
    setIsConfirmModalOpen(true);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Plan Name is required';
    if (formData.price < 0) errors.price = 'Price cannot be negative';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Save
  const handleSavePlan = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const updatedPlan = {
      ...formData,
      price: Number(formData.price),
      indexation: Number(formData.indexation)
    };

    if (editingPlan) {
      setPlans(plans.map(p => p.id === editingPlan.id ? updatedPlan : p));
      showToast(`Subscription plan "${updatedPlan.name}" updated successfully.`);
    } else {
      setPlans([...plans, updatedPlan]);
      showToast(`New subscription plan "${updatedPlan.name}" created successfully.`);
    }

    setIsFormModalOpen(false);
  };

  // Handle Toggle Status
  const handleToggleStatus = () => {
    if (!selectedPlan) return;
    const newStatus = selectedPlan.status === 'Active' ? 'Inactive' : 'Active';

    setPlans(plans.map(p => p.id === selectedPlan.id ? { ...p, status: newStatus } : p));
    showToast(`Plan "${selectedPlan.name}" status updated to ${newStatus}.`, 'info');
    setIsConfirmModalOpen(false);
  };

  // Filtered plans
  const filteredPlans = plans.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <MS icon="loyalty" size={22} />
            </div>
            <div>
              <h1 className="headline-lg" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                Subscription Plans & SaaS Billing Governance
              </h1>
              <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                Hybrid SaaS + CapEx Billing Models, License Pricing Tiering, SLA Commitments & Annual Indexation Caps
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={handleOpenAddModal} className="btn btn-primary btn-sm">
            <MS icon="add" size={16} /> + New Plan Tier
          </button>
        </div>
      </div>

      {/* Telemetry Ribbon */}
      <div className="grid-metrics">
        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Subscription Plans</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>{plans.length} Tiers</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Canonical SaaS Portfolio</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Supported Models</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>Hybrid Billing</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>One-Time + Recurring OpEx</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Annual Indexation</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>5.0% Cap</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Inflation Adjustment Ceiling</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>SLA Commitment</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-surface)' }}>99.98% Uptime</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Mission Critical SLA</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Billing Status</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>Operational</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Active Tier Matrix</span>
        </div>
      </div>

      {/* Subscription Tier Plans Table */}
      <div className="card">
        <div className="card-header flex-between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 className="headline-sm" style={{ color: 'var(--primary)' }}>SaaS Subscription Plan Tier Matrix</h3>
            <p className="body-sm" style={{ color: 'var(--outline)' }}>Monthly/Annual recurring pricing, included user seats, support SLA level, and renewal rules</p>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search plan name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '6px 12px 6px 32px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--outline-variant)',
                fontSize: 13,
                width: 220
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
                <th>Plan Code</th>
                <th>Subscription Plan Name</th>
                <th>Billing Model</th>
                <th>List Unit Price</th>
                <th>Included Seats</th>
                <th>SLA Level</th>
                <th>Annual Indexation</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 30, color: 'var(--outline)' }}>
                    No subscription plans match your search.
                  </td>
                </tr>
              ) : (
                filteredPlans.map((plan) => (
                  <tr key={plan.id} style={{ opacity: plan.status === 'Inactive' ? 0.6 : 1 }}>
                    <td className="font-mono font-semibold">{plan.id}</td>
                    <td><strong>{plan.name}</strong></td>
                    <td>
                      <span className={`badge ${plan.billingCycle.includes('ANNUAL') ? 'badge-secondary' : 'badge-surface'}`}>
                        {plan.billingCycle}
                      </span>
                    </td>
                    <td className="font-mono font-semibold">
                      {formatCurrency(plan.price)} / {plan.billingCycle.includes('ANNUAL') ? 'yr' : 'mo'}
                    </td>
                    <td>{plan.seats}</td>
                    <td>{plan.sla}</td>
                    <td className="font-mono">Max {plan.indexation}%</td>
                    <td>
                      <span className={`badge ${plan.status === 'Active' ? 'badge-success' : 'badge-error'}`}>
                        {plan.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleOpenDetailModal(plan)} className="btn btn-outline btn-sm" title="View Plan Specs">
                          View
                        </button>
                        <button onClick={() => handleOpenEditModal(plan)} className="btn btn-outline btn-sm" title="Edit Plan">
                          Edit
                        </button>
                        <button onClick={() => handleOpenConfirmModal(plan)} className="btn btn-outline btn-sm" style={{ color: plan.status === 'Active' ? '#dc2626' : '#16a34a' }}>
                          {plan.status === 'Active' ? 'Deactivate' : 'Activate'}
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

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingPlan ? `Edit Subscription Plan: ${editingPlan.id}` : 'Create New Subscription Plan Tier'}
      >
        <form onSubmit={handleSavePlan} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Plan Name *</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. DealFlow SaaS Professional"
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}
            />
            {formErrors.name && <span style={{ color: '#dc2626', fontSize: 11 }}>{formErrors.name}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Billing Cycle *</label>
              <select
                className="form-control"
                value={formData.billingCycle}
                onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', background: '#fff' }}
              >
                <option value="RECURRING_MONTHLY">RECURRING_MONTHLY</option>
                <option value="RECURRING_ANNUAL">RECURRING_ANNUAL</option>
                <option value="ONE_TIME">ONE_TIME</option>
                <option value="RECURRING_FREE">RECURRING_FREE</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>List Price (₹) *</label>
              <input
                type="number"
                className="form-control"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}
              />
              {formErrors.price && <span style={{ color: '#dc2626', fontSize: 11 }}>{formErrors.price}</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Included Seats</label>
              <input
                type="text"
                className="form-control"
                value={formData.seats}
                onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                placeholder="e.g. 25 User Seats"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>SLA Support Level</label>
              <select
                className="form-control"
                value={formData.sla}
                onChange={(e) => setFormData({ ...formData, sla: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', background: '#fff' }}
              >
                <option value="Mission Critical SLA (4h)">Mission Critical SLA (4h)</option>
                <option value="High-Priority SLA (24h)">High-Priority SLA (24h)</option>
                <option value="Standard SLA (48h)">Standard SLA (48h)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Annual Indexation Cap (%)</label>
            <input
              type="number"
              step="0.5"
              className="form-control"
              value={formData.indexation}
              onChange={(e) => setFormData({ ...formData, indexation: Number(e.target.value) })}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" onClick={() => setIsFormModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingPlan ? 'Save Plan Changes' : 'Create Plan Tier'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Plan Details — ${selectedPlan?.name || ''}`}
      >
        {selectedPlan && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'var(--surface-container-low)', padding: 14, borderRadius: 8 }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Plan Code</span>
                <strong className="font-mono" style={{ fontSize: 14 }}>{selectedPlan.id}</strong>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Billing Cycle</span>
                <span className="badge badge-surface">{selectedPlan.billingCycle}</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>List Unit Price</span>
                <span className="font-mono" style={{ fontSize: 14, fontWeight: 700 }}>
                  {formatCurrency(selectedPlan.price)} / {selectedPlan.billingCycle.includes('ANNUAL') ? 'yr' : 'mo'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Included Seats</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{selectedPlan.seats}</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>SLA Commitment</span>
                <span style={{ fontSize: 13 }}>{selectedPlan.sla}</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Annual Indexation</span>
                <span className="font-mono" style={{ fontSize: 13 }}>Max {selectedPlan.indexation}%</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Plan Status</span>
                <span className={`badge ${selectedPlan.status === 'Active' ? 'badge-success' : 'badge-error'}`}>
                  {selectedPlan.status}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => { setIsDetailModalOpen(false); handleOpenEditModal(selectedPlan); }} className="btn btn-outline">
                Edit Plan
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
        title={selectedPlan?.status === 'Active' ? 'Deactivate Subscription Plan?' : 'Activate Subscription Plan?'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 14, color: 'var(--on-surface)' }}>
            Are you sure you want to {selectedPlan?.status === 'Active' ? 'deactivate' : 'activate'} plan <strong>{selectedPlan?.name} ({selectedPlan?.id})</strong>?
          </p>
          <p style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>
            {selectedPlan?.status === 'Active'
              ? 'Deactivating this plan will hide it from new enterprise quote selections.'
              : 'Activating this plan will make it available for rep quote line items.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button onClick={() => setIsConfirmModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button
              onClick={handleToggleStatus}
              className={`btn ${selectedPlan?.status === 'Active' ? 'btn-error' : 'btn-primary'}`}
            >
              {selectedPlan?.status === 'Active' ? 'Deactivate Plan' : 'Activate Plan'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

