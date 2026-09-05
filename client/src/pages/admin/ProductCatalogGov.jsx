import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { MOCK_PRODUCTS } from '../../utils/constants';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

const DEFAULT_PRODUCT_FORM = {
  id: '',
  name: '',
  category: 'Hardware',
  listPrice: 500000,
  costPrice: 300000,
  minMargin: 20,
  billingType: 'ONE_TIME',
  isUpsell: false,
  status: 'Active'
};

export default function ProductCatalogGov() {
  const [products, setProducts] = useState(
    MOCK_PRODUCTS.map(p => ({
      ...p,
      status: p.status || 'Active'
    }))
  );

  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form State
  const [formData, setFormData] = useState(DEFAULT_PRODUCT_FORM);
  const [formErrors, setFormErrors] = useState({});

  // Toast State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Open Add Product Modal
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      ...DEFAULT_PRODUCT_FORM,
      id: `PRD-${String(products.length + 101).padStart(3, '0')}`
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open Edit Product Modal
  const handleOpenEditModal = (prd) => {
    setEditingProduct(prd);
    setFormData({ ...prd });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open View Details Modal
  const handleOpenDetailModal = (prd) => {
    setSelectedProduct(prd);
    setIsDetailModalOpen(true);
  };

  // Open Deactivate Confirmation Modal
  const handleOpenConfirmModal = (prd) => {
    setSelectedProduct(prd);
    setIsConfirmModalOpen(true);
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Product Name is required';
    if (!formData.category) errors.category = 'Category is required';
    if (formData.listPrice <= 0) errors.listPrice = 'List price must be greater than 0';
    if (formData.costPrice < 0) errors.costPrice = 'Cost price cannot be negative';
    if (formData.costPrice > formData.listPrice) errors.costPrice = 'Cost price cannot exceed list price';
    if (formData.minMargin < 0 || formData.minMargin > 100) errors.minMargin = 'Min margin % must be between 0 and 100';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Save
  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const updatedProduct = {
      ...formData,
      listPrice: Number(formData.listPrice),
      costPrice: Number(formData.costPrice),
      minMargin: Number(formData.minMargin)
    };

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));
      showToast(`Product SKU "${updatedProduct.name}" updated successfully.`);
    } else {
      setProducts([updatedProduct, ...products]);
      showToast(`New product SKU "${updatedProduct.name}" added to catalog.`);
    }

    setIsFormModalOpen(false);
  };

  // Handle Toggle Status
  const handleToggleStatus = () => {
    if (!selectedProduct) return;
    const newStatus = selectedProduct.status === 'Active' ? 'Inactive' : 'Active';

    setProducts(products.map(p => p.id === selectedProduct.id ? { ...p, status: newStatus } : p));
    showToast(`SKU "${selectedProduct.name}" status set to ${newStatus}.`, 'info');
    setIsConfirmModalOpen(false);
  };

  // Dynamic Telemetry Metrics
  const activeProducts = products.filter(p => p.status === 'Active');
  const hardwareCount = activeProducts.filter(p => p.category.toUpperCase() === 'HARDWARE').length;
  const upsellCount = activeProducts.filter(p => p.isUpsell).length;
  const avgMinMargin = activeProducts.length > 0
    ? (activeProducts.reduce((acc, p) => acc + p.minMargin, 0) / activeProducts.length).toFixed(1)
    : '0.0';

  // Filtered Products
  const filteredProducts = products.filter(prd => {
    const matchesCategory = filterCategory === 'ALL' || prd.category.toUpperCase() === filterCategory;
    const matchesSearch = prd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prd.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
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
              <MS icon="inventory_2" size={22} />
            </div>
            <div>
              <h1 className="headline-lg" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                Product Configuration & Catalog Governance
              </h1>
              <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                Catalog Matrix, Minimum Margin Thresholds, Pricing Rules & Cross-Sell Governance
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={handleOpenAddModal} className="btn btn-primary btn-sm">
            <MS icon="add" size={16} /> + Add Catalog Product
          </button>
        </div>
      </div>

      {/* Telemetry Ribbon */}
      <div className="grid-metrics">
        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Catalog Items</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>{products.length} Products</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Hardware, Software, Services</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Avg Margin Floor</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>{avgMinMargin}% Target</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Enforced Profit Floor</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Hardware SKUs</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-surface)' }}>{hardwareCount} SKUs</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Physical Infrastructure</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Upsell Accessories</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>{upsellCount} Recommended</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Margin Booster SKUs</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Catalog Mode</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>Active</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Live SKU Catalog</span>
        </div>
      </div>

      {/* Product Catalog Table */}
      <div className="card">
        <div className="card-header flex-between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 className="headline-sm" style={{ color: 'var(--primary)' }}>Product Catalog & Pricing Governance Matrix</h3>
            <p className="body-sm" style={{ color: 'var(--outline)' }}>List prices, unit cost, minimum margin floors, and billing classifications</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search product or SKU..."
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

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="select-field"
              style={{ width: 150, height: 32, fontSize: 13, background: '#fff' }}
            >
              <option value="ALL">All Categories</option>
              <option value="HARDWARE">Hardware</option>
              <option value="SOFTWARE">Software</option>
              <option value="SERVICE">Service</option>
              <option value="ACCESSORY">Accessory</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>List Price</th>
                <th>Unit Cost Price</th>
                <th>Min Margin %</th>
                <th>Billing Model</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 30, color: 'var(--outline)' }}>
                    No products match your filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prd) => {
                  const marginVal = (((prd.listPrice - prd.costPrice) / prd.listPrice) * 100).toFixed(1);
                  return (
                    <tr key={prd.id} style={{ opacity: prd.status === 'Inactive' ? 0.6 : 1 }}>
                      <td className="font-mono font-semibold">{prd.id}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{prd.name}</div>
                      </td>
                      <td>
                        <span className="badge badge-surface">{prd.category}</span>
                      </td>
                      <td className="font-mono font-semibold">{formatCurrency(prd.listPrice)}</td>
                      <td className="font-mono">{formatCurrency(prd.costPrice)}</td>
                      <td className="font-mono">
                        <strong style={{ color: Number(marginVal) >= prd.minMargin ? 'var(--secondary)' : '#dc2626' }}>
                          {marginVal}% (Floor {prd.minMargin}%)
                        </strong>
                      </td>
                      <td className="font-mono text-sm">{prd.billingType}</td>
                      <td>
                        <span className={`badge ${prd.status === 'Active' ? 'badge-success' : 'badge-error'}`}>
                          {prd.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => handleOpenDetailModal(prd)} className="btn btn-outline btn-sm" title="View Product Spec">
                            View
                          </button>
                          <button onClick={() => handleOpenEditModal(prd)} className="btn btn-outline btn-sm" title="Edit SKU">
                            Edit
                          </button>
                          <button onClick={() => handleOpenConfirmModal(prd)} className="btn btn-outline btn-sm" style={{ color: prd.status === 'Active' ? '#dc2626' : '#16a34a' }}>
                            {prd.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingProduct ? `Edit Product SKU: ${editingProduct.id}` : 'Add Product SKU to Catalog'}
      >
        <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Product Name *</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Enterprise Router R-500"
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}
            />
            {formErrors.name && <span style={{ color: '#dc2626', fontSize: 11 }}>{formErrors.name}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Category *</label>
              <select
                className="form-control"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', background: '#fff' }}
              >
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Service">Service</option>
                <option value="Accessory">Accessory</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Billing Model *</label>
              <select
                className="form-control"
                value={formData.billingType}
                onChange={(e) => setFormData({ ...formData, billingType: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', background: '#fff' }}
              >
                <option value="ONE_TIME">ONE_TIME</option>
                <option value="RECURRING_MONTHLY">RECURRING_MONTHLY</option>
                <option value="RECURRING_ANNUAL">RECURRING_ANNUAL</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>List Price (₹) *</label>
              <input
                type="number"
                className="form-control"
                value={formData.listPrice}
                onChange={(e) => setFormData({ ...formData, listPrice: Number(e.target.value) })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}
              />
              {formErrors.listPrice && <span style={{ color: '#dc2626', fontSize: 11 }}>{formErrors.listPrice}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Unit Cost Price (₹) *</label>
              <input
                type="number"
                className="form-control"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}
              />
              {formErrors.costPrice && <span style={{ color: '#dc2626', fontSize: 11 }}>{formErrors.costPrice}</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Min Margin Floor (%) *</label>
              <input
                type="number"
                className="form-control"
                value={formData.minMargin}
                onChange={(e) => setFormData({ ...formData, minMargin: Number(e.target.value) })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}
              />
              {formErrors.minMargin && <span style={{ color: '#dc2626', fontSize: 11 }}>{formErrors.minMargin}</span>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginTop: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isUpsell}
                  onChange={(e) => setFormData({ ...formData, isUpsell: e.target.checked })}
                  style={{ width: 16, height: 16 }}
                />
                <strong>Recommended Upsell / Cross-sell SKU</strong>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" onClick={() => setIsFormModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingProduct ? 'Save Product SKU' : 'Add Product SKU'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Product Specification — ${selectedProduct?.name || ''}`}
      >
        {selectedProduct && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'var(--surface-container-low)', padding: 14, borderRadius: 8 }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>SKU Code</span>
                <strong className="font-mono" style={{ fontSize: 14 }}>{selectedProduct.id}</strong>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Category</span>
                <span className="badge badge-surface">{selectedProduct.category}</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>List Price</span>
                <span className="font-mono" style={{ fontSize: 14, fontWeight: 700 }}>{formatCurrency(selectedProduct.listPrice)}</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Unit Cost Price</span>
                <span className="font-mono" style={{ fontSize: 14 }}>{formatCurrency(selectedProduct.costPrice)}</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Calculated Margin</span>
                <span className="font-mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--secondary)' }}>
                  {(((selectedProduct.listPrice - selectedProduct.costPrice) / selectedProduct.listPrice) * 100).toFixed(1)}%
                </span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Minimum Margin Floor</span>
                <span className="font-mono" style={{ fontSize: 14 }}>{selectedProduct.minMargin}%</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Billing Model</span>
                <span className="font-mono" style={{ fontSize: 13 }}>{selectedProduct.billingType}</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Status</span>
                <span className={`badge ${selectedProduct.status === 'Active' ? 'badge-success' : 'badge-error'}`}>
                  {selectedProduct.status}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => { setIsDetailModalOpen(false); handleOpenEditModal(selectedProduct); }} className="btn btn-outline">
                Edit SKU
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
        title={selectedProduct?.status === 'Active' ? 'Deactivate Product SKU?' : 'Activate Product SKU?'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 14, color: 'var(--on-surface)' }}>
            Are you sure you want to {selectedProduct?.status === 'Active' ? 'deactivate' : 'activate'} product <strong>{selectedProduct?.name} ({selectedProduct?.id})</strong>?
          </p>
          <p style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>
            {selectedProduct?.status === 'Active'
              ? 'Deactivating this SKU will prevent sales reps from adding it to new quotes.'
              : 'Activating this SKU will allow sales reps to select it in quotes.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button onClick={() => setIsConfirmModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button
              onClick={handleToggleStatus}
              className={`btn ${selectedProduct?.status === 'Active' ? 'btn-error' : 'btn-primary'}`}
            >
              {selectedProduct?.status === 'Active' ? 'Deactivate Product' : 'Activate Product'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

