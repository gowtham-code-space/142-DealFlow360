import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { api } from '../../services/api';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

const DEFAULT_FORM_DATA = {
  id: '',
  name: '',
  email: '',
  phone: '',
  address: '',
  tier: 'STANDARD',
  creditLimit: 10000000,
  riskScore: 25,
  paymentTerms: 'Net-30',
  purchaseModel: 'ONE_TIME',
  slaLevel: 'High-Priority (24h)',
  status: 'Active'
};

export default function CustomerConfig() {
  const { showToast, toast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Form State
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [formErrors, setFormErrors] = useState({});

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.getCustomers();
      if (res && res.success && Array.isArray(res.data)) {
        const mapped = res.data.map(c => ({
          id: c.id,
          name: c.name,
          email: c.email,
          contactEmail: c.email,
          phone: c.phone || '',
          address: c.address || '',
          tier: c.tier || 'STANDARD',
          creditLimit: Number(c.creditLimit || 10000000),
          riskScore: Number(c.riskScore || 20),
          paymentTerms: c.paymentTerms || 'Net-30',
          purchaseModel: c.tier === 'PLATINUM' ? 'RECURRING_PREMIUM' : c.tier === 'GOLD' ? 'BULK_ONE_TIME' : 'ONE_TIME',
          slaLevel: c.tier === 'PLATINUM' ? 'Mission Critical (4h)' : c.tier === 'GOLD' ? 'High-Priority (24h)' : 'Standard (48h)',
          status: c.isActive !== false ? 'Active' : 'Inactive'
        }));
        setCustomers(mapped);
      }
    } catch {
      showToast('Could not load customer accounts from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // Open Form for Add
  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      ...DEFAULT_FORM_DATA,
      id: ''
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open Form for Edit
  const handleOpenEditModal = (cust) => {
    setEditingCustomer(cust);
    setFormData({ ...cust });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open Details Modal
  const handleOpenDetailModal = (cust) => {
    setSelectedCustomer(cust);
    setIsDetailModalOpen(true);
  };

  // Confirm Deactivate
  const handleOpenConfirmModal = (cust) => {
    setSelectedCustomer(cust);
    setIsConfirmModalOpen(true);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Customer Name is required';
    if (!formData.email?.trim() || !formData.email.includes('@')) errors.email = 'Valid Email is required';
    if (!formData.tier) errors.tier = 'Customer Tier is required';
    if (formData.creditLimit < 0) errors.creditLimit = 'Credit limit cannot be negative';
    if (formData.riskScore < 0 || formData.riskScore > 100) errors.riskScore = 'Risk score must be between 0 and 100';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Save (Add / Edit)
  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || null,
      address: formData.address || null,
      tier: formData.tier,
      creditLimit: Number(formData.creditLimit),
      riskScore: Number(formData.riskScore),
      paymentTerms: formData.paymentTerms || 'Net-30',
      isActive: formData.status === 'Active'
    };

    if (editingCustomer) {
      const res = await api.updateCustomer(editingCustomer.id, payload);
      if (res && res.success) {
        showToast(`Customer account "${formData.name}" updated successfully.`);
        loadCustomers();
      } else {
        showToast(res?.message || 'Failed to update customer', 'error');
      }
    } else {
      const res = await api.createCustomer(payload);
      if (res && res.success) {
        showToast(`New customer account "${formData.name}" onboarded successfully.`);
        loadCustomers();
      } else {
        showToast(res?.message || 'Failed to onboard customer', 'error');
      }
    }

    setIsFormModalOpen(false);
  };

  // Handle Deactivate / Toggle Status
  const handleToggleStatus = async () => {
    if (!selectedCustomer) return;
    const isDeactivating = selectedCustomer.status === 'Active';

    const res = isDeactivating
      ? await api.deleteCustomer(selectedCustomer.id)
      : await api.reactivateCustomer(selectedCustomer.id);

    if (res && res.success) {
      showToast(`Account status updated.`, 'info');
      loadCustomers();
    } else {
      showToast(res?.message || 'Failed to update status', 'error');
    }
    setIsConfirmModalOpen(false);
  };

  // Metrics computation
  const activeCustomers = customers.filter(c => c.status === 'Active');
  const totalCreditExposure = activeCustomers.reduce((acc, curr) => acc + (curr.creditLimit || 0), 0);
  const platinumCount = activeCustomers.filter(c => c.tier === 'PLATINUM').length;
  const goldCount = activeCustomers.filter(c => c.tier === 'GOLD').length;
  const standardCount = activeCustomers.filter(c => c.tier === 'STANDARD').length;

  // Filtered customers
  const filteredCustomers = customers.filter(cust => {
    const matchesSearch = cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cust.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === 'ALL' || cust.tier === tierFilter;
    return matchesSearch && matchesTier;
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
              <MS icon="group" size={22} />
            </div>
            <div>
              <h1 className="headline-lg" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                Customer Configuration & Tier Classification
              </h1>
              <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                Account Governance, Credit Floor Limits, Risk Score Ratings & Billing Type Classification
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={handleOpenAddModal} className="btn btn-primary btn-sm">
            <MS icon="person_add" size={16} /> + Onboard Account
          </button>
        </div>
      </div>

      {/* Telemetry Ribbon */}
      <div className="grid-metrics">
        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Managed Accounts</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>{customers.length} Enterprises</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Canonical Customer Directory</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Total Credit Exposure</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>{formatCurrency(totalCreditExposure)}</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Active Accounts Credit Ceiling</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Platinum Accounts</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>{platinumCount} Accounts</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Apex Tier (30% Max Disc)</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Gold Accounts</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>{goldCount} Accounts</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>High Tier (20% Max Disc)</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Standard Accounts</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-surface)' }}>{standardCount} Accounts</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Core Tier (10% Max Disc)</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Risk Governance</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>Active</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Blended Score Matrix Active</span>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="card">
        <div className="card-header flex-between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 className="headline-sm" style={{ color: 'var(--primary)' }}>Enterprise Account Governance Directory</h3>
            <p className="body-sm" style={{ color: 'var(--outline)' }}>Tier classification, credit limits, risk scores, and SLA governance commitments</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search account name or ID..."
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

            {/* Filter */}
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--outline-variant)',
                fontSize: 13,
                background: '#fff'
              }}
            >
              <option value="ALL">All Tiers</option>
              <option value="PLATINUM">Platinum Tier</option>
              <option value="GOLD">Gold Tier</option>
              <option value="STANDARD">Standard Tier</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Account ID</th>
                <th>Customer Enterprise Name</th>
                <th>Customer Tier</th>
                <th>Max Discount %</th>
                <th>Credit Limit Floor</th>
                <th>Risk Score</th>
                <th>Purchase Model</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 30, color: 'var(--outline)' }}>
                    No customer accounts matching your filter.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} style={{ opacity: cust.status === 'Inactive' ? 0.6 : 1 }}>
                    <td className="font-mono font-semibold">{cust.id}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{cust.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--outline)' }}>{cust.contactEmail}</div>
                    </td>
                    <td>
                      <span className={`badge ${cust.tier === 'PLATINUM' ? 'badge-secondary' : cust.tier === 'GOLD' ? 'badge-amber' : 'badge-surface'}`}>
                        {cust.tier}
                      </span>
                    </td>
                    <td className="font-mono font-semibold">
                      {cust.tier === 'PLATINUM' ? '30.0%' : cust.tier === 'GOLD' ? '20.0%' : '10.0%'}
                    </td>
                    <td className="font-mono">{formatCurrency(cust.creditLimit)}</td>
                    <td>
                      <span className={`badge ${cust.riskScore < 25 ? 'badge-success' : cust.riskScore < 50 ? 'badge-amber' : 'badge-error'}`}>
                        Score {cust.riskScore} / 100 ({cust.riskScore < 25 ? 'LOW' : cust.riskScore < 50 ? 'MEDIUM' : 'HIGH'})
                      </span>
                    </td>
                    <td className="font-mono text-sm">
                      {cust.purchaseModel}
                    </td>
                    <td>
                      <span className={`badge ${cust.status === 'Active' ? 'badge-success' : 'badge-error'}`}>
                        {cust.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleOpenDetailModal(cust)} className="btn btn-outline btn-sm" title="View Details">
                          View
                        </button>
                        <button onClick={() => handleOpenEditModal(cust)} className="btn btn-outline btn-sm" title="Edit Customer">
                          Edit
                        </button>
                        <button onClick={() => handleOpenConfirmModal(cust)} className="btn btn-outline btn-sm" style={{ color: cust.status === 'Active' ? '#dc2626' : '#16a34a' }}>
                          {cust.status === 'Active' ? 'Deactivate' : 'Activate'}
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

      {/* Tier vs Purchase Type Clarification Matrix */}
      <div className="card card-body" style={{ background: 'var(--surface-container-low)', border: '1px solid rgba(209,195,202,0.3)' }}>
        <h3 className="headline-sm" style={{ color: 'var(--primary)', marginBottom: 8 }}>Tier Classification & Purchase Type Governance Rule</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: '#fff', padding: 14, borderRadius: 8 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>Customer Tier Governance (Tier Rules)</h4>
            <p style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 4 }}>
              Determines max fast-path discount % ceiling, manager approval triggers, and credit limit ceilings.
            </p>
            <ul style={{ fontSize: 11, color: 'var(--on-surface)', marginTop: 8, paddingLeft: 16, lineHeight: 1.6 }}>
              <li><strong>STANDARD:</strong> Max 10% discount floor. Credit limit: ₹40 Lakh.</li>
              <li><strong>GOLD:</strong> Max 20% discount floor. Credit limit: ₹1.2 Cr.</li>
              <li><strong>PLATINUM:</strong> Max 30% discount floor. Credit limit: ₹2.0 Cr.</li>
            </ul>
          </div>

          <div style={{ background: '#fff', padding: 14, borderRadius: 8 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--secondary)' }}>Customer Purchase Type (Billing Rules)</h4>
            <p style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 4 }}>
              Determines billing engine model, warehouse pool allocation, and subscription SLA.
            </p>
            <ul style={{ fontSize: 11, color: 'var(--on-surface)', marginTop: 8, paddingLeft: 16, lineHeight: 1.6 }}>
              <li><strong>ONE_TIME:</strong> Direct hardware purchases (50% Normal Pool).</li>
              <li><strong>BULK_ONE_TIME:</strong> Large-scale volume hardware (50% Premium Pool).</li>
              <li><strong>RECURRING_FREE:</strong> SaaS trial evaluation (30-day cap).</li>
              <li><strong>RECURRING_PREMIUM:</strong> SaaS licenses & 24/7 SLA (Annual/Monthly).</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingCustomer ? `Edit Customer: ${editingCustomer.name}` : 'Onboard New Customer Account'}
      >
        <form onSubmit={handleSaveCustomer} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Customer Enterprise Name *</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Acme Cloud Corp"
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}
            />
            {formErrors.name && <span style={{ color: '#dc2626', fontSize: 11 }}>{formErrors.name}</span>}
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
                <option value="PLATINUM">PLATINUM (30% Ceiling)</option>
                <option value="GOLD">GOLD (20% Ceiling)</option>
                <option value="STANDARD">STANDARD (10% Ceiling)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Purchase Model *</label>
              <select
                className="form-control"
                value={formData.purchaseModel}
                onChange={(e) => setFormData({ ...formData, purchaseModel: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', background: '#fff' }}
              >
                <option value="RECURRING_PREMIUM">RECURRING_PREMIUM</option>
                <option value="BULK_ONE_TIME">BULK_ONE_TIME</option>
                <option value="ONE_TIME">ONE_TIME</option>
                <option value="RECURRING_FREE">RECURRING_FREE</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Credit Limit Floor (₹) *</label>
              <input
                type="number"
                className="form-control"
                value={formData.creditLimit}
                onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}
              />
              {formErrors.creditLimit && <span style={{ color: '#dc2626', fontSize: 11 }}>{formErrors.creditLimit}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Risk Score (0 - 100) *</label>
              <input
                type="number"
                min="0"
                max="100"
                className="form-control"
                value={formData.riskScore}
                onChange={(e) => setFormData({ ...formData, riskScore: Number(e.target.value) })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}
              />
              {formErrors.riskScore && <span style={{ color: '#dc2626', fontSize: 11 }}>{formErrors.riskScore}</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Contact Email</label>
              <input
                type="email"
                className="form-control"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="procurement@company.com"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>SLA Support Commitment</label>
              <select
                className="form-control"
                value={formData.slaLevel}
                onChange={(e) => setFormData({ ...formData, slaLevel: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', background: '#fff' }}
              >
                <option value="Mission Critical (4h)">Mission Critical (4h)</option>
                <option value="High-Priority (24h)">High-Priority (24h)</option>
                <option value="Standard (48h)">Standard (48h)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" onClick={() => setIsFormModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingCustomer ? 'Save Account Changes' : 'Create Customer Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Account Specification — ${selectedCustomer?.name || ''}`}
      >
        {selectedCustomer && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'var(--surface-container-low)', padding: 14, borderRadius: 8 }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Account ID</span>
                <strong className="font-mono" style={{ fontSize: 14 }}>{selectedCustomer.id}</strong>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Account Tier</span>
                <span className={`badge ${selectedCustomer.tier === 'PLATINUM' ? 'badge-secondary' : selectedCustomer.tier === 'GOLD' ? 'badge-amber' : 'badge-surface'}`}>
                  {selectedCustomer.tier}
                </span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Credit Limit Floor</span>
                <span className="font-mono" style={{ fontSize: 14, fontWeight: 700 }}>{formatCurrency(selectedCustomer.creditLimit)}</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Risk Score Rating</span>
                <span className={`badge ${selectedCustomer.riskScore < 25 ? 'badge-success' : selectedCustomer.riskScore < 50 ? 'badge-amber' : 'badge-error'}`}>
                  Score {selectedCustomer.riskScore} / 100 ({selectedCustomer.riskScore < 25 ? 'LOW' : selectedCustomer.riskScore < 50 ? 'MEDIUM' : 'HIGH'})
                </span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Purchase Model</span>
                <span className="font-mono" style={{ fontSize: 13 }}>{selectedCustomer.purchaseModel}</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>SLA Commitment</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{selectedCustomer.slaLevel}</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Primary Contact</span>
                <span style={{ fontSize: 13 }}>{selectedCustomer.contactEmail}</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Governance Status</span>
                <span className={`badge ${selectedCustomer.status === 'Active' ? 'badge-success' : 'badge-error'}`}>
                  {selectedCustomer.status}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => { setIsDetailModalOpen(false); handleOpenEditModal(selectedCustomer); }} className="btn btn-outline">
                Edit Account
              </button>
              <button onClick={() => setIsDetailModalOpen(false)} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Modal for Deactivate */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title={selectedCustomer?.status === 'Active' ? 'Deactivate Customer Account?' : 'Activate Customer Account?'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 14, color: 'var(--on-surface)' }}>
            Are you sure you want to {selectedCustomer?.status === 'Active' ? 'deactivate' : 'activate'} customer <strong>{selectedCustomer?.name}</strong>?
          </p>
          <p style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>
            {selectedCustomer?.status === 'Active'
              ? 'Deactivating this account will prevent new quotation creation and pause credit limit checks.'
              : 'Activating this account will enable quotation creation under configured tier governance limits.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button onClick={() => setIsConfirmModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button
              onClick={handleToggleStatus}
              className={`btn ${selectedCustomer?.status === 'Active' ? 'btn-error' : 'btn-primary'}`}
            >
              {selectedCustomer?.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

