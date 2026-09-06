import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { api } from '../../services/api';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

const DEFAULT_PRODUCT_FORM = {
  id: '',
  sku: '',
  name: '',
  category: 'Hardware',
  productType: 'HARDWARE',
  listPrice: 500000,
  costPrice: 300000,
  tax: 18.0,
  minMargin: 20,
  isRecurring: false,
  isUpsell: false,
  status: 'Active'
};

const DEFAULT_VARIANT_FORM = {
  id: '',
  productId: '',
  attribute: 'Storage',
  value: '512GB NVMe SSD',
  extraPrice: 15000,
  variantDiscountPct: 0.0,
  isActive: true
};

export default function ProductCatalogGov() {
  const { showToast, toast } = useToast();
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [upsellRules, setUpsellRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'variants' | 'upsell'
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [variantProductFilter, setVariantProductFilter] = useState('ALL');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isUpsellModalOpen, setIsUpsellModalOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);
  const [editingVariant, setEditingVariant] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form State
  const [formData, setFormData] = useState(DEFAULT_PRODUCT_FORM);
  const [variantFormData, setVariantFormData] = useState(DEFAULT_VARIANT_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [upsellFormData, setUpsellFormData] = useState({
    primaryProductId: '',
    upsellProductId: '',
    discountPct: 10.0,
    description: ''
  });

  const loadProducts = async () => {
    setLoading(true);
    try {
      const [prodRes, upRes] = await Promise.all([
        api.getProducts(),
        api.getUpsellRules()
      ]);

      let loadedProducts = [];
      if (prodRes && prodRes.success && Array.isArray(prodRes.data)) {
        loadedProducts = prodRes.data.map(p => ({
          id: p.id,
          sku: p.sku || p.id,
          name: p.name,
          category: p.category || 'Hardware',
          productType: p.productType || 'HARDWARE',
          listPrice: Number(p.listPrice || 0),
          costPrice: Number(p.cost || p.costPrice || 0),
          tax: Number(p.tax || 18.0),
          minMargin: Number(p.minMargin || 20.0),
          billingType: p.isRecurring ? 'RECURRING' : 'ONE_TIME',
          isRecurring: Boolean(p.isRecurring),
          isUpsell: Boolean(p.isUpsell),
          status: p.isActive !== false ? 'Active' : 'Inactive'
        }));
        setProducts(loadedProducts);
      }

      if (upRes && upRes.success && Array.isArray(upRes.data)) {
        setUpsellRules(upRes.data);
      }

      // Fetch variants for all loaded products
      if (loadedProducts.length > 0) {
        const variantPromises = loadedProducts.map(p =>
          api.getProductVariants(p.id).catch(() => ({ success: false, data: [] }))
        );
        const variantResults = await Promise.all(variantPromises);
        const allVariants = [];
        variantResults.forEach((vr, idx) => {
          if (vr && vr.success && Array.isArray(vr.data)) {
            vr.data.forEach(v => {
              allVariants.push({
                ...v,
                productName: loadedProducts[idx]?.name || 'Unknown Product',
                productSku: loadedProducts[idx]?.sku || loadedProducts[idx]?.id
              });
            });
          }
        });

        if (allVariants.length > 0) {
          setVariants(allVariants);
        } else {
          // Pre-populate canonical variants for demo hardware & software
          setVariants([
            { id: 'VAR-101-512G', productId: loadedProducts[0]?.id || 'PRD-101', productName: loadedProducts[0]?.name || 'Enterprise Server Rack', productSku: 'PRD-101', attribute: 'Storage', value: '512GB NVMe SSD', extraPrice: 25000, variantDiscountPct: 0, isActive: true },
            { id: 'VAR-101-1TB', productId: loadedProducts[0]?.id || 'PRD-101', productName: loadedProducts[0]?.name || 'Enterprise Server Rack', productSku: 'PRD-101', attribute: 'Storage', value: '1TB NVMe Dual Array', extraPrice: 65000, variantDiscountPct: 5, isActive: true },
            { id: 'VAR-101-RAM64', productId: loadedProducts[0]?.id || 'PRD-101', productName: loadedProducts[0]?.name || 'Enterprise Server Rack', productSku: 'PRD-101', attribute: 'RAM Memory', value: '64GB DDR5 ECC', extraPrice: 40000, variantDiscountPct: 0, isActive: true },
            { id: 'VAR-101-RAM128', productId: loadedProducts[0]?.id || 'PRD-101', productName: loadedProducts[0]?.name || 'Enterprise Server Rack', productSku: 'PRD-101', attribute: 'RAM Memory', value: '128GB DDR5 ECC', extraPrice: 90000, variantDiscountPct: 8, isActive: true },
            { id: 'VAR-201-10G', productId: loadedProducts[1]?.id || 'PRD-201', productName: loadedProducts[1]?.name || 'Core Network Switch 48-Port', productSku: 'PRD-201', attribute: 'Port Speed', value: '10Gbps SFP+ Uplinks', extraPrice: 35000, variantDiscountPct: 0, isActive: true },
            { id: 'VAR-201-40G', productId: loadedProducts[1]?.id || 'PRD-201', productName: loadedProducts[1]?.name || 'Core Network Switch 48-Port', productSku: 'PRD-201', attribute: 'Port Speed', value: '40Gbps QSFP+ Uplinks', extraPrice: 80000, variantDiscountPct: 10, isActive: true }
          ]);
        }
      }
    } catch {
      showToast('Could not load products from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Upsell Handlers
  const handleOpenAddUpsell = () => {
    setUpsellFormData({
      primaryProductId: products[0]?.id || '',
      upsellProductId: products[1]?.id || '',
      discountPct: 10.0,
      description: 'Standard Bundle Discount'
    });
    setIsUpsellModalOpen(true);
  };

  const handleSaveUpsellRule = async (e) => {
    e.preventDefault();
    if (!upsellFormData.primaryProductId || !upsellFormData.upsellProductId) {
      showToast('Please select both base product and upsell add-on', 'error');
      return;
    }
    try {
      const res = await api.createUpsellRule({
        sourceProductId: upsellFormData.primaryProductId,
        suggestedProductId: upsellFormData.upsellProductId,
        minMarginPct: Number(upsellFormData.discountPct || 20),
        reason: upsellFormData.description || 'Companion product recommendation',
        isPromotion: true
      });
      if (res && res.success) {
        showToast('Upsell promotion rule created successfully.');
        loadProducts();
      } else {
        showToast(res?.message || 'Failed to create upsell rule', 'error');
      }
    } catch {
      showToast('Failed to create upsell rule', 'error');
    }
    setIsUpsellModalOpen(false);
  };

  const handleDeleteUpsellRule = async (id) => {
    try {
      const res = await api.deleteUpsellRule(id);
      if (res && res.success) {
        showToast('Upsell rule deleted.');
        loadProducts();
      } else {
        showToast(res?.message || 'Failed to delete rule', 'error');
      }
    } catch {
      showToast('Failed to delete rule', 'error');
    }
  };

  // Product Modals
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      ...DEFAULT_PRODUCT_FORM,
      id: '',
      sku: ''
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (prd) => {
    setEditingProduct(prd);
    setFormData({ ...prd });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenDetailModal = (prd) => {
    setSelectedProduct(prd);
    setIsDetailModalOpen(true);
  };

  const handleOpenConfirmModal = (prd) => {
    setSelectedProduct(prd);
    setIsConfirmModalOpen(true);
  };

  // Variant Modals
  const handleOpenAddVariant = (forProduct = null) => {
    setEditingVariant(null);
    setVariantFormData({
      ...DEFAULT_VARIANT_FORM,
      id: '',
      productId: forProduct?.id || products[0]?.id || ''
    });
    setIsVariantModalOpen(true);
  };

  const handleOpenEditVariant = (v) => {
    setEditingVariant(v);
    setVariantFormData({
      id: v.id,
      productId: v.productId,
      attribute: v.attribute,
      value: v.value,
      extraPrice: Number(v.extraPrice || 0),
      variantDiscountPct: Number(v.variantDiscountPct || 0),
      isActive: v.isActive !== false
    });
    setIsVariantModalOpen(true);
  };

  const handleSaveVariant = async (e) => {
    e.preventDefault();
    if (!variantFormData.productId || !variantFormData.attribute.trim() || !variantFormData.value.trim()) {
      showToast('Please fill all required variant fields.', 'error');
      return;
    }

    const payload = {
      attribute: variantFormData.attribute,
      value: variantFormData.value,
      extraPrice: Number(variantFormData.extraPrice || 0),
      variantDiscountPct: Number(variantFormData.variantDiscountPct || 0),
      isActive: variantFormData.isActive
    };

    try {
      if (editingVariant) {
        const res = await api.updateProductVariant(variantFormData.productId, editingVariant.id, payload);
        if (res && res.success) {
          showToast(`Variant "${variantFormData.value}" updated successfully.`);
          loadProducts();
        } else {
          showToast(res?.message || 'Failed to update variant', 'error');
        }
      } else {
        const res = await api.createProductVariant(variantFormData.productId, payload);
        if (res && res.success) {
          showToast(`New variant "${variantFormData.value}" added to product.`);
          loadProducts();
        } else {
          showToast(res?.message || 'Failed to create variant', 'error');
        }
      }
    } catch {
      showToast('Failed to save variant', 'error');
    }
    setIsVariantModalOpen(false);
  };

  const handleDeleteVariant = async (productId, variantId) => {
    try {
      const res = await api.deleteProductVariant(productId, variantId);
      if (res && res.success) {
        showToast('Variant removed.');
        loadProducts();
      } else {
        showToast(res?.message || 'Failed to delete variant', 'error');
      }
    } catch {
      showToast('Failed to delete variant', 'error');
    }
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

  // Handle Save Product
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name: formData.name,
      sku: formData.sku || formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      category: formData.category,
      productType: formData.category.toUpperCase().includes('SOFT') ? 'SOFTWARE' : formData.category.toUpperCase().includes('SERV') ? 'SERVICE' : 'HARDWARE',
      listPrice: Number(formData.listPrice),
      cost: Number(formData.costPrice),
      tax: Number(formData.tax || 18.0),
      minMargin: Number(formData.minMargin),
      isRecurring: formData.billingType === 'RECURRING' || formData.isRecurring,
      isUpsell: Boolean(formData.isUpsell),
      isActive: formData.status === 'Active'
    };

    if (editingProduct) {
      const res = await api.updateProduct(editingProduct.id, payload);
      if (res && res.success) {
        showToast(`Product SKU "${formData.name}" updated successfully.`);
        loadProducts();
      } else {
        showToast(res?.message || 'Failed to update product', 'error');
      }
    } else {
      const res = await api.createProduct(payload);
      if (res && res.success) {
        showToast(`New product SKU "${formData.name}" added to catalog.`);
        loadProducts();
      } else {
        showToast(res?.message || 'Failed to create product', 'error');
      }
    }

    setIsFormModalOpen(false);
  };

  // Handle Toggle Status
  const handleToggleStatus = async () => {
    if (!selectedProduct) return;
    const isActivating = selectedProduct.status !== 'Active';

    const res = await api.updateProduct(selectedProduct.id, {
      name: selectedProduct.name,
      isActive: isActivating
    });

    if (res && res.success) {
      showToast(`SKU "${selectedProduct.name}" status updated.`, 'info');
      loadProducts();
    } else {
      showToast(res?.message || 'Failed to update status', 'error');
    }
    setIsConfirmModalOpen(false);
  };

  // Filtered Products
  const filteredProducts = products.filter(prd => {
    const matchesCategory = filterCategory === 'ALL' || prd.category.toUpperCase() === filterCategory;
    const matchesSearch = prd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prd.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filtered Variants
  const filteredVariants = variants.filter(v => {
    const matchesProduct = variantProductFilter === 'ALL' || v.productId === variantProductFilter;
    const matchesSearch = v.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.attribute.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.productName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProduct && matchesSearch;
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
              <MS icon="inventory_2" size={22} />
            </div>
            <div>
              <h1 className="headline-lg" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                Product Configuration & Catalog Governance
              </h1>
              <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                Catalog Matrix, Product Variants, Margin Floors, Pricing Rules & Cross-Sell Governance
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {activeTab === 'catalog' && (
            <button onClick={handleOpenAddModal} className="btn btn-primary btn-sm">
              <MS icon="add" size={16} /> + Add Catalog Product
            </button>
          )}
          {activeTab === 'variants' && (
            <button onClick={() => handleOpenAddVariant()} className="btn btn-primary btn-sm">
              <MS icon="tune" size={16} /> + Add Product Variant
            </button>
          )}
          {activeTab === 'upsell' && (
            <button onClick={handleOpenAddUpsell} className="btn btn-primary btn-sm">
              <MS icon="auto_awesome" size={16} /> + New Upsell Rule
            </button>
          )}
        </div>
      </div>

      {/* Tab Selector */}
      <div className="tab-bar">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
        >
          <MS icon="inventory_2" size={16} /> Product Catalog Matrix ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('variants')}
          className={`tab-btn ${activeTab === 'variants' ? 'active' : ''}`}
        >
          <MS icon="tune" size={16} /> Product Variants & Attributes ({variants.length})
        </button>
        <button
          onClick={() => setActiveTab('upsell')}
          className={`tab-btn ${activeTab === 'upsell' ? 'active' : ''}`}
        >
          <MS icon="auto_awesome" size={16} /> Upsell & Cross-Sell Rules ({upsellRules.length})
        </button>
      </div>

      {/* View 1: Catalog Matrix */}
      {activeTab === 'catalog' && (
        <div className="card">
          <div className="card-header flex-between" style={{ flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 className="headline-sm" style={{ color: 'var(--primary)' }}>Product Catalog & Pricing Governance Matrix</h3>
              <p className="body-sm" style={{ color: 'var(--outline)' }}>List prices, unit cost, minimum margin floors, and billing classifications</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                  <th>Variants</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: 30, color: 'var(--outline)' }}>
                      No products match your filter.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prd) => {
                    const marginVal = (((prd.listPrice - prd.costPrice) / prd.listPrice) * 100).toFixed(1);
                    const prodVariantsCount = variants.filter(v => v.productId === prd.id).length;
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
                          <button
                            onClick={() => {
                              setVariantProductFilter(prd.id);
                              setActiveTab('variants');
                            }}
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: 11, padding: '2px 8px' }}
                          >
                            <MS icon="tune" size={14} /> {prodVariantsCount} Variants
                          </button>
                        </td>
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
                            <button onClick={() => handleOpenEditModal(prd)} className="btn btn-outline btn-sm" title="Edit Pricing">
                              Edit
                            </button>
                            <button
                              onClick={() => handleOpenConfirmModal(prd)}
                              className={`btn btn-sm ${prd.status === 'Active' ? 'btn-outline' : 'btn-primary'}`}
                              style={prd.status === 'Active' ? { color: 'var(--error)', borderColor: 'var(--error)' } : {}}
                            >
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
      )}

      {/* View 2: Product Variants & Attributes */}
      {activeTab === 'variants' && (
        <div className="card">
          <div className="card-header flex-between" style={{ flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 className="headline-sm" style={{ color: 'var(--primary)' }}>Product Variants & Attribute Options</h3>
              <p className="body-sm" style={{ color: 'var(--outline)' }}>
                SKU variant modifiers, extra surcharge adjustments, and memory/storage/speed attribute options
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <select
                value={variantProductFilter}
                onChange={e => setVariantProductFilter(e.target.value)}
                className="select-field"
                style={{ width: 220, height: 32, fontSize: 13, background: '#fff' }}
              >
                <option value="ALL">All Parent Products</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              <button onClick={() => handleOpenAddVariant()} className="btn btn-primary btn-sm">
                <MS icon="add" size={16} /> + New Variant
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Variant ID</th>
                  <th>Parent Product</th>
                  <th>Attribute Name</th>
                  <th>Variant Option / Value</th>
                  <th>Extra Surcharge (₹)</th>
                  <th>Discount %</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVariants.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: 30, color: 'var(--outline)' }}>
                      No product variants found. Click "+ New Variant" to add attributes.
                    </td>
                  </tr>
                ) : (
                  filteredVariants.map((v) => (
                    <tr key={v.id}>
                      <td className="font-mono font-semibold">{v.id}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{v.productName}</div>
                        <span className="font-mono" style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>{v.productSku}</span>
                      </td>
                      <td>
                        <span className="badge badge-surface">{v.attribute}</span>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{v.value}</td>
                      <td className="font-mono font-semibold" style={{ color: 'var(--secondary)' }}>
                        {v.extraPrice > 0 ? `+${formatCurrency(v.extraPrice)}` : 'Included'}
                      </td>
                      <td className="font-mono">{v.variantDiscountPct || 0}%</td>
                      <td>
                        <span className={`badge ${v.isActive !== false ? 'badge-success' : 'badge-error'}`}>
                          {v.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => handleOpenEditVariant(v)} className="btn btn-outline btn-sm">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteVariant(v.productId, v.id)} className="btn btn-outline btn-sm" style={{ color: 'var(--error)' }}>
                            Delete
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
      )}

      {/* View 3: Upsell Rules */}
      {activeTab === 'upsell' && (
        <div className="card">
          <div className="card-header flex-between" style={{ flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 className="headline-sm" style={{ color: 'var(--primary)' }}>Upsell & Cross-Sell Recommendation Matrix</h3>
              <p className="body-sm" style={{ color: 'var(--outline)' }}>Automated bundle companion pairings for sales margin optimization</p>
            </div>
            <button onClick={handleOpenAddUpsell} className="btn btn-primary btn-sm">
              <MS icon="add" size={16} /> + New Upsell Rule
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rule ID</th>
                  <th>Primary Base SKU</th>
                  <th>Suggested Cross-Sell Add-On</th>
                  <th>Min Margin %</th>
                  <th>Recommendation Rationale</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {upsellRules.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 30, color: 'var(--outline)' }}>
                      No upsell rules registered. Click "+ New Upsell Rule" to create one.
                    </td>
                  </tr>
                ) : (
                  upsellRules.map((rule) => {
                    const primary = products.find(p => p.id === rule.sourceProductId);
                    const suggested = products.find(p => p.id === rule.suggestedProductId);
                    return (
                      <tr key={rule.id}>
                        <td className="font-mono font-semibold">{rule.id}</td>
                        <td>
                          <strong>{primary ? primary.name : rule.sourceProductId}</strong>
                        </td>
                        <td>
                          <span className="badge badge-secondary">{suggested ? suggested.name : rule.suggestedProductId}</span>
                        </td>
                        <td className="font-mono">{rule.minMarginPct || 20}%</td>
                        <td>{rule.reason || 'Companion product promotion'}</td>
                        <td>
                          <span className="badge badge-success">Active</span>
                        </td>
                        <td>
                          <button onClick={() => handleDeleteUpsellRule(rule.id)} className="btn btn-outline btn-sm" style={{ color: 'var(--error)' }}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRODUCT CREATE/EDIT MODAL */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingProduct ? `Edit Pricing: ${editingProduct.name}` : 'Provision New Product SKU'}
        size="lg"
      >
        <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label required">Product Name</label>
            <input
              type="text"
              className={`form-input ${formErrors.name ? 'error' : ''}`}
              placeholder="e.g. Enterprise Cloud Server X1"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {formErrors.name && <span className="form-error">{formErrors.name}</span>}
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label required">Category</label>
              <select
                className="select-input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Services">Services</option>
                <option value="Accessory">Accessory</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Billing Model</label>
              <select
                className="select-input"
                value={formData.billingType || 'ONE_TIME'}
                onChange={(e) => setFormData({ ...formData, billingType: e.target.value, isRecurring: e.target.value === 'RECURRING' })}
              >
                <option value="ONE_TIME">One-Time CapEx</option>
                <option value="RECURRING">Recurring Subscription</option>
              </select>
            </div>
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label required">List Price (₹)</label>
              <input
                type="number"
                className={`form-input ${formErrors.listPrice ? 'error' : ''}`}
                value={formData.listPrice}
                onChange={(e) => setFormData({ ...formData, listPrice: e.target.value })}
              />
              {formErrors.listPrice && <span className="form-error">{formErrors.listPrice}</span>}
            </div>

            <div className="form-group">
              <label className="form-label required">Unit Cost Price (₹)</label>
              <input
                type="number"
                className={`form-input ${formErrors.costPrice ? 'error' : ''}`}
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
              />
              {formErrors.costPrice && <span className="form-error">{formErrors.costPrice}</span>}
            </div>

            <div className="form-group">
              <label className="form-label required">Min Margin Floor (%)</label>
              <input
                type="number"
                className={`form-input ${formErrors.minMargin ? 'error' : ''}`}
                value={formData.minMargin}
                onChange={(e) => setFormData({ ...formData, minMargin: e.target.value })}
              />
              {formErrors.minMargin && <span className="form-error">{formErrors.minMargin}</span>}
            </div>
          </div>

          <div className="modal-actions flex-end" style={{ marginTop: 12 }}>
            <button type="button" onClick={() => setIsFormModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* VARIANT CREATE/EDIT MODAL */}
      <Modal
        isOpen={isVariantModalOpen}
        onClose={() => setIsVariantModalOpen(false)}
        title={editingVariant ? `Edit Variant: ${editingVariant.value}` : 'Add Product Variant / Attribute Option'}
        size="md"
      >
        <form onSubmit={handleSaveVariant} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label required">Parent Product</label>
            <select
              className="select-input"
              value={variantFormData.productId}
              onChange={(e) => setVariantFormData({ ...variantFormData, productId: e.target.value })}
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku || p.id})</option>
              ))}
            </select>
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label required">Attribute Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Storage, RAM, Port Speed"
                value={variantFormData.attribute}
                onChange={(e) => setVariantFormData({ ...variantFormData, attribute: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Variant Option / Value</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 512GB NVMe, 64GB DDR5"
                value={variantFormData.value}
                onChange={(e) => setVariantFormData({ ...variantFormData, value: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Extra Surcharge Price (₹)</label>
              <input
                type="number"
                className="form-input"
                placeholder="0"
                value={variantFormData.extraPrice}
                onChange={(e) => setVariantFormData({ ...variantFormData, extraPrice: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Variant Discount (%)</label>
              <input
                type="number"
                className="form-input"
                placeholder="0"
                value={variantFormData.variantDiscountPct}
                onChange={(e) => setVariantFormData({ ...variantFormData, variantDiscountPct: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-actions flex-end" style={{ marginTop: 12 }}>
            <button type="button" onClick={() => setIsVariantModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingVariant ? 'Save Variant' : 'Add Variant'}
            </button>
          </div>
        </form>
      </Modal>

      {/* UPSELL MODAL */}
      <Modal
        isOpen={isUpsellModalOpen}
        onClose={() => setIsUpsellModalOpen(false)}
        title="Create Upsell / Cross-Sell Pairing Rule"
        size="md"
      >
        <form onSubmit={handleSaveUpsellRule} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label required">Primary Base Product SKU</label>
            <select
              className="select-input"
              value={upsellFormData.primaryProductId}
              onChange={(e) => setUpsellFormData({ ...upsellFormData, primaryProductId: e.target.value })}
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label required">Recommended Companion Add-On</label>
            <select
              className="select-input"
              value={upsellFormData.upsellProductId}
              onChange={(e) => setUpsellFormData({ ...upsellFormData, upsellProductId: e.target.value })}
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Recommendation Rationale</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Bought by 80% of enterprise buyers"
              value={upsellFormData.description}
              onChange={(e) => setUpsellFormData({ ...upsellFormData, description: e.target.value })}
            />
          </div>

          <div className="modal-actions flex-end">
            <button type="button" onClick={() => setIsUpsellModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Pairing Rule
            </button>
          </div>
        </form>
      </Modal>

      {/* PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Product Spec: ${selectedProduct.name}`}
          size="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 14, background: 'var(--surface-container-lowest)', borderRadius: 8 }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', textTransform: 'uppercase' }}>Product SKU / ID</span>
                <div className="font-mono" style={{ fontSize: 12, fontWeight: 600 }}>{selectedProduct.sku || selectedProduct.id}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', textTransform: 'uppercase' }}>Category</span>
                <div><span className="badge badge-surface">{selectedProduct.category}</span></div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', textTransform: 'uppercase' }}>List Price</span>
                <div className="font-mono font-semibold">{formatCurrency(selectedProduct.listPrice)}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', textTransform: 'uppercase' }}>Cost Price</span>
                <div className="font-mono">{formatCurrency(selectedProduct.costPrice)}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', textTransform: 'uppercase' }}>Min Margin Floor</span>
                <div className="font-mono font-semibold" style={{ color: 'var(--secondary)' }}>{selectedProduct.minMargin}%</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', textTransform: 'uppercase' }}>Billing Type</span>
                <div className="font-mono">{selectedProduct.billingType}</div>
              </div>
            </div>

            <div className="modal-actions flex-end">
              <button onClick={() => setIsDetailModalOpen(false)} className="btn btn-primary">Close</button>
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRM STATUS MODAL */}
      {selectedProduct && (
        <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          title={selectedProduct.status === 'Active' ? 'Deactivate Product' : 'Activate Product'}
          size="sm"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p className="body-md">
              Are you sure you want to {selectedProduct.status === 'Active' ? 'deactivate' : 'activate'} <strong>{selectedProduct.name}</strong> ({selectedProduct.id})?
            </p>
            <div className="modal-actions flex-end">
              <button onClick={() => setIsConfirmModalOpen(false)} className="btn btn-outline">Cancel</button>
              <button
                onClick={handleToggleStatus}
                className={`btn ${selectedProduct.status === 'Active' ? 'btn-error' : 'btn-primary'}`}
              >
                Confirm {selectedProduct.status === 'Active' ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
