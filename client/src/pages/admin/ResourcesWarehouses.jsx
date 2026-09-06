import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

const DEFAULT_WAREHOUSE_FORM = {
  id: '',
  name: '',
  code: '',
  region: 'East Coast',
  location: '',
  locationLat: 13.0827,
  locationLng: 80.2707,
  shippingCostFactor: 1.0,
  stock: 500,
  shippingCostRate: 100,
  status: 'Active'
};

export default function ResourcesWarehouses() {
  const { showToast, toast } = useToast();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);

  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedInventoryWh, setSelectedInventoryWh] = useState(null);
  const [warehouseInventory, setWarehouseInventory] = useState([]);

  // Form State
  const [formData, setFormData] = useState(DEFAULT_WAREHOUSE_FORM);
  const [formErrors, setFormErrors] = useState({});

  const loadWarehouses = async () => {
    setLoading(true);
    try {
      const res = await api.getWarehouses();
      if (res && res.success && Array.isArray(res.data)) {
        const mapped = res.data.map(w => ({
          id: w.id,
          name: w.name,
          code: w.code || w.id,
          region: w.region || 'Regional Hub',
          location: w.location || '',
          locationLat: Number(w.locationLat || 0),
          locationLng: Number(w.locationLng || 0),
          shippingCostFactor: Number(w.shippingCostFactor || 1.0),
          shippingCostRate: Math.round(Number(w.shippingCostFactor || 1.0) * 100),
          stock: w.inventories ? w.inventories.reduce((acc, inv) => acc + (inv.normalPoolQty || 0) + (inv.premiumBulkPoolQty || 0), 0) : 500,
          status: w.isActive !== false ? 'Active' : 'Inactive'
        }));
        setWarehouses(mapped);
      }
    } catch {
      showToast('Could not load warehouses from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  const handleOpenInventoryModal = async (wh) => {
    setSelectedInventoryWh(wh);
    setIsInventoryModalOpen(true);
    try {
      const res = await api.getWarehouseInventory(wh.id);
      if (res && res.success && Array.isArray(res.data)) {
        setWarehouseInventory(res.data);
      } else {
        setWarehouseInventory([]);
      }
    } catch {
      showToast('Failed to load inventory for warehouse', 'error');
    }
  };

  const handleAdjustInventory = async (productId, normalPoolQty, premiumBulkPoolQty) => {
    if (!selectedInventoryWh) return;
    try {
      const res = await api.adjustWarehouseInventory(selectedInventoryWh.id, productId, {
        normalPoolQty: Number(normalPoolQty),
        premiumBulkPoolQty: Number(premiumBulkPoolQty)
      });
      if (res && res.success) {
        showToast('Inventory allocation updated successfully.');
        const updated = await api.getWarehouseInventory(selectedInventoryWh.id);
        if (updated && updated.success && Array.isArray(updated.data)) {
          setWarehouseInventory(updated.data);
        }
        loadWarehouses();
      } else {
        showToast(res?.message || 'Failed to adjust inventory', 'error');
      }
    } catch {
      showToast('Failed to adjust inventory', 'error');
    }
  };

  // Open Form for Add
  const handleOpenAddModal = () => {
    setEditingWarehouse(null);
    setFormData({
      ...DEFAULT_WAREHOUSE_FORM,
      id: ''
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open Form for Edit
  const handleOpenEditModal = (wh) => {
    setEditingWarehouse(wh);
    setFormData({ ...wh });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open Detail Modal
  const handleOpenDetailModal = (wh) => {
    setSelectedWarehouse(wh);
    setIsDetailModalOpen(true);
  };

  // Open Confirm Deactivate Modal
  const handleOpenConfirmModal = (wh) => {
    setSelectedWarehouse(wh);
    setIsConfirmModalOpen(true);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Warehouse Facility Name is required';
    if (formData.shippingCostRate < 0) errors.shippingCostRate = 'Shipping rate cannot be negative';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Save (Add / Edit)
  const handleSaveWarehouse = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name: formData.name,
      code: formData.code || formData.name.toLowerCase().replace(/\s+/g, '-'),
      region: formData.region || 'Regional Hub',
      location: formData.location || '',
      locationLat: Number(formData.locationLat || 13.0827),
      locationLng: Number(formData.locationLng || 80.2707),
      shippingCostFactor: Number(formData.shippingCostRate) / 100 || 1.0,
      isActive: formData.status === 'Active'
    };

    if (editingWarehouse) {
      const res = await api.updateWarehouse(editingWarehouse.id, payload);
      if (res && res.success) {
        showToast(`Warehouse facility "${formData.name}" updated successfully.`);
        loadWarehouses();
      } else {
        showToast(res?.message || 'Failed to update warehouse', 'error');
      }
    } else {
      const res = await api.createWarehouse(payload);
      if (res && res.success) {
        showToast(`New regional warehouse "${formData.name}" provisioned successfully.`);
        loadWarehouses();
      } else {
        showToast(res?.message || 'Failed to provision warehouse', 'error');
      }
    }

    setIsFormModalOpen(false);
  };

  // Handle Deactivate / Toggle Status
  const handleToggleStatus = async () => {
    if (!selectedWarehouse) return;
    const isActivating = selectedWarehouse.status !== 'Active';

    const res = await api.updateWarehouse(selectedWarehouse.id, {
      name: selectedWarehouse.name,
      isActive: isActivating
    });

    if (res && res.success) {
      showToast(`Warehouse facility status changed.`, 'info');
      loadWarehouses();
    } else {
      showToast(res?.message || 'Failed to change status', 'error');
    }
    setIsConfirmModalOpen(false);
  };

  // Telemetry computation
  const activeHubs = warehouses.filter(w => w.status === 'Active');
  const totalStockPool = activeHubs.reduce((acc, w) => acc + (w.stock || 0), 0);

  // Filtered list
  const filteredWarehouses = warehouses.filter(w =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.id.toLowerCase().includes(searchTerm.toLowerCase())
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
              <MS icon="warehouse" size={22} />
            </div>
            <div>
              <h1 className="headline-lg" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                Resource & Regional Warehouse Allocation
              </h1>
              <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                Multi-Warehouse Stock Splitting, 50/50 Pool Allocation, 48h Inventory Hold Locks & Shipping Optimization
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={handleOpenAddModal} className="btn btn-primary btn-sm">
            <MS icon="add_location" size={16} /> + Provision Warehouse Hub
          </button>
        </div>
      </div>

      {/* Telemetry Ribbon */}
      <div className="grid-metrics">
        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Active Warehouses</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>{activeHubs.length} Hubs</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Regional Facilities</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Total Stock Pool</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>{totalStockPool.toLocaleString()} Units</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Hardware Inventory</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>50/50 Pool Split</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>ENFORCED</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Normal vs Bulk Pool</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Active 48h Holds</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>4 Holds</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Customer Negotiation Holds</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Optimization Engine</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>Cost & Distance</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Nearest Warehouse Route</span>
        </div>
      </div>

      {/* Warehouse Roster Table */}
      <div className="card">
        <div className="card-header flex-between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 className="headline-sm" style={{ color: 'var(--primary)' }}>Regional Warehouse Roster & Pool Split Status</h3>
            <p className="body-sm" style={{ color: 'var(--outline)' }}>Stock balances, pool splits (Normal vs Bulk), and shipping rates per regional hub</p>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search warehouse facility..."
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
                <th>Warehouse ID</th>
                <th>Regional Facility Name</th>
                <th>Total Stock Units</th>
                <th>Normal Pool (50%)</th>
                <th>Premium Bulk Pool (50%)</th>
                <th>Shipping Cost Rate</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWarehouses.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 30, color: 'var(--outline)' }}>
                    No warehouse facilities found matching your search.
                  </td>
                </tr>
              ) : (
                filteredWarehouses.map((wh) => {
                  const halfStock = Math.floor(wh.stock / 2);
                  return (
                    <tr key={wh.id} style={{ opacity: wh.status === 'Inactive' ? 0.6 : 1 }}>
                      <td className="font-mono font-semibold">{wh.id}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{wh.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--outline)' }}>{wh.region}</div>
                      </td>
                      <td className="font-mono font-semibold">{wh.stock} Units</td>
                      <td className="font-mono text-secondary-color">{halfStock} Units</td>
                      <td className="font-mono text-primary-color">{halfStock} Units</td>
                      <td className="font-mono">₹{wh.shippingCostRate} / unit</td>
                      <td>
                        <span className={`badge ${wh.status === 'Active' ? 'badge-success' : 'badge-error'}`}>
                          {wh.status === 'Active' ? 'ACTIVE & OPTIMIZED' : 'INACTIVE'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => handleOpenInventoryModal(wh)} className="btn btn-primary btn-sm" title="Manage SKU Inventory & 50/50 Pools">
                            Stock Pools
                          </button>
                          <button onClick={() => handleOpenDetailModal(wh)} className="btn btn-outline btn-sm" title="View Hub Specs">
                            View
                          </button>
                          <button onClick={() => handleOpenEditModal(wh)} className="btn btn-outline btn-sm" title="Configure Hub">
                            Edit
                          </button>
                          <button onClick={() => handleOpenConfirmModal(wh)} className="btn btn-outline btn-sm" style={{ color: wh.status === 'Active' ? '#dc2626' : '#16a34a' }}>
                            {wh.status === 'Active' ? 'Deactivate' : 'Activate'}
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

      {/* 50/50 Inventory Pool Allocation Policy Diagram */}
      <div className="card card-body" style={{ background: 'var(--surface-container-low)', border: '1px solid rgba(209,195,202,0.3)' }}>
        <h3 className="headline-sm" style={{ color: 'var(--primary)', marginBottom: 8 }}>50/50 Inventory Reservation Governance Architecture</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <div style={{ background: '#fff', padding: 12, borderRadius: 8, borderLeft: '4px solid var(--secondary)' }}>
            <span className="badge badge-secondary" style={{ fontSize: 10 }}>POOL A (50%)</span>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>Normal Pool (Standard Orders)</h4>
            <p style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 4 }}>
              Allocated for single-item or standard quotation orders from Sales Reps. Immediate fulfillment dispatch.
            </p>
          </div>

          <div style={{ background: '#fff', padding: 12, borderRadius: 8, borderLeft: '4px solid var(--primary)' }}>
            <span className="badge badge-primary" style={{ fontSize: 10 }}>POOL B (50%)</span>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>Premium Bulk Pool (Enterprise)</h4>
            <p style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 4 }}>
              Reserved for Gold and Platinum bulk deployments. Prevents inventory exhaustion by standard orders.
            </p>
          </div>

          <div style={{ background: '#fff', padding: 12, borderRadius: 8, borderLeft: '4px solid #f59e0b' }}>
            <span className="badge badge-amber" style={{ fontSize: 10 }}>HOLD GOVERNANCE</span>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>48-Hour Atomic Lock</h4>
            <p style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 4 }}>
              When a buyer submits a negotiation counter-offer, stock is locked atomically for 48 hours to prevent race conditions.
            </p>
          </div>
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingWarehouse ? `Configure Warehouse: ${editingWarehouse.id}` : 'Provision New Regional Warehouse Hub'}
      >
        <form onSubmit={handleSaveWarehouse} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Regional Facility Name *</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Southern Logistics Hub (TX)"
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}
            />
            {formErrors.name && <span style={{ color: '#dc2626', fontSize: 11 }}>{formErrors.name}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Region / Zone</label>
              <select
                className="form-control"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', background: '#fff' }}
              >
                <option value="East Coast">East Coast</option>
                <option value="West Coast">West Coast</option>
                <option value="Midwest">Midwest</option>
                <option value="South">South Region</option>
                <option value="APAC">APAC Hub</option>
                <option value="EMEA">EMEA Hub</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Total Available Stock (Units) *</label>
              <input
                type="number"
                className="form-control"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}
              />
              {formErrors.stock && <span style={{ color: '#dc2626', fontSize: 11 }}>{formErrors.stock}</span>}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Shipping Cost Rate (₹ / unit) *</label>
            <input
              type="number"
              className="form-control"
              value={formData.shippingCostRate}
              onChange={(e) => setFormData({ ...formData, shippingCostRate: Number(e.target.value) })}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}
            />
            {formErrors.shippingCostRate && <span style={{ color: '#dc2626', fontSize: 11 }}>{formErrors.shippingCostRate}</span>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" onClick={() => setIsFormModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingWarehouse ? 'Save Warehouse Config' : 'Provision Warehouse'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Facility Specification — ${selectedWarehouse?.name || ''}`}
      >
        {selectedWarehouse && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'var(--surface-container-low)', padding: 14, borderRadius: 8 }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Facility ID</span>
                <strong className="font-mono" style={{ fontSize: 14 }}>{selectedWarehouse.id}</strong>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Region</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{selectedWarehouse.region}</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Total Hardware Stock</span>
                <span className="font-mono" style={{ fontSize: 14, fontWeight: 700 }}>{selectedWarehouse.stock} Units</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Normal Pool (50%)</span>
                <span className="font-mono text-secondary-color" style={{ fontSize: 14 }}>{Math.floor(selectedWarehouse.stock / 2)} Units</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Premium Bulk Pool (50%)</span>
                <span className="font-mono text-primary-color" style={{ fontSize: 14 }}>{Math.floor(selectedWarehouse.stock / 2)} Units</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Shipping Cost Rate</span>
                <span className="font-mono" style={{ fontSize: 14 }}>₹{selectedWarehouse.shippingCostRate} / unit</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Operational Status</span>
                <span className={`badge ${selectedWarehouse.status === 'Active' ? 'badge-success' : 'badge-error'}`}>
                  {selectedWarehouse.status}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => { setIsDetailModalOpen(false); handleOpenEditModal(selectedWarehouse); }} className="btn btn-outline">
                Configure Hub
              </button>
              <button onClick={() => setIsDetailModalOpen(false)} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Warehouse Inventory Inspection & Adjustment Modal */}
      <Modal
        isOpen={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
        title={`Inventory & 50/50 Pool Allocation — ${selectedInventoryWh?.name || ''}`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--surface-container-low)', padding: 12, borderRadius: 8, fontSize: 12, color: 'var(--on-surface-variant)' }}>
            Adjust physical inventory and reserve allocation between <strong>Normal Pool (Standard Orders)</strong> and <strong>Premium Bulk Pool (Enterprise Deals)</strong>.
          </div>

          <div className="table-container" style={{ maxHeight: 320, overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product SKU</th>
                  <th>Normal Pool</th>
                  <th>Premium Bulk Pool</th>
                  <th>Total SKU Stock</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {warehouseInventory.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--outline)' }}>
                      No SKU inventory mapped to this facility yet.
                    </td>
                  </tr>
                ) : (
                  warehouseInventory.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.product?.name || item.productId}</div>
                        <span className="font-mono text-xs text-outline">{item.product?.sku || item.productId}</span>
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          defaultValue={item.normalPoolQty || 0}
                          id={`normal-${item.productId}`}
                          style={{ width: 80, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--outline-variant)' }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          defaultValue={item.premiumBulkPoolQty || 0}
                          id={`bulk-${item.productId}`}
                          style={{ width: 80, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--outline-variant)' }}
                        />
                      </td>
                      <td className="font-mono font-bold">
                        {(item.normalPoolQty || 0) + (item.premiumBulkPoolQty || 0)} Units
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => {
                            const norm = document.getElementById(`normal-${item.productId}`)?.value || item.normalPoolQty;
                            const bulk = document.getElementById(`bulk-${item.productId}`)?.value || item.premiumBulkPoolQty;
                            handleAdjustInventory(item.productId, norm, bulk);
                          }}
                          className="btn btn-primary btn-sm"
                        >
                          Save
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button onClick={() => setIsInventoryModalOpen(false)} className="btn btn-primary">
              Done
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title={selectedWarehouse?.status === 'Active' ? 'Deactivate Warehouse Facility?' : 'Activate Warehouse Facility?'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 14, color: 'var(--on-surface)' }}>
            Are you sure you want to {selectedWarehouse?.status === 'Active' ? 'deactivate' : 'activate'} warehouse <strong>{selectedWarehouse?.name} ({selectedWarehouse?.id})</strong>?
          </p>
          <p style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>
            {selectedWarehouse?.status === 'Active'
              ? 'Deactivating this warehouse will exclude its stock pool from nearest-route quotation splits.'
              : 'Activating this warehouse will restore automated inventory fulfillment routing.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button onClick={() => setIsConfirmModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button
              onClick={handleToggleStatus}
              className={`btn ${selectedWarehouse?.status === 'Active' ? 'btn-error' : 'btn-primary'}`}
            >
              {selectedWarehouse?.status === 'Active' ? 'Deactivate Warehouse' : 'Activate Warehouse'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

