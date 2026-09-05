import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';
import { api } from '../../services/api';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

const ROLE_MAP = {
  ADMIN: 'Administrator',
  SALES_REP: 'Sales Representative',
  SALES_MANAGER: 'Sales Manager / Approver',
  FINANCE_OPS: 'Finance / Operations',
  CUSTOMER: 'Customer Portal User'
};

const REVERSE_ROLE_MAP = {
  'Administrator': 'ADMIN',
  'Sales Representative': 'SALES_REP',
  'Sales Manager / Approver': 'SALES_MANAGER',
  'Finance / Operations': 'FINANCE_OPS',
  'Customer Portal User': 'CUSTOMER'
};

const DEFAULT_USER_FORM = {
  id: '',
  name: '',
  email: '',
  password: '',
  role: 'Sales Representative',
  region: 'North America',
  status: 'Active'
};

export default function UsersRolesRBAC() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form State
  const [formData, setFormData] = useState(DEFAULT_USER_FORM);
  const [formErrors, setFormErrors] = useState({});

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers();
      if (res && res.success && Array.isArray(res.data)) {
        const formatted = res.data.map(u => ({
          id: u.id,
          name: u.name || 'User',
          email: u.email,
          role: ROLE_MAP[u.roleId || u.role] || u.roleId || u.role || 'Sales Representative',
          roleId: u.roleId || u.role || 'SALES_REP',
          region: u.region || 'Global',
          status: u.isActive === false ? 'Deactivated' : 'Active'
        }));
        setUsers(formatted);
      }
    } catch {
      showToast('Could not fetch user list from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      ...DEFAULT_USER_FORM,
      id: ''
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (usr) => {
    setEditingUser(usr);
    setFormData({ ...usr, password: '' });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open Detail Modal
  const handleOpenDetailModal = (usr) => {
    setSelectedUser(usr);
    setIsDetailModalOpen(true);
  };

  // Open Confirm Deactivate Modal
  const handleOpenConfirmModal = (usr) => {
    setSelectedUser(usr);
    setIsConfirmModalOpen(true);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'User name is required';
    if (!formData.email.trim() || !formData.email.includes('@')) errors.email = 'Valid email is required';
    if (!editingUser && (!formData.password || formData.password.length < 6)) {
      errors.password = 'Initial password (min 6 chars) is required';
    }
    if (!formData.role) errors.role = 'Role assignment is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Save
  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const backendRole = REVERSE_ROLE_MAP[formData.role] || 'SALES_REP';

    if (editingUser) {
      const payload = {
        name: formData.name,
        email: formData.email,
        roleId: backendRole,
        isActive: formData.status !== 'Deactivated'
      };
      if (formData.password && formData.password.length >= 6) {
        payload.password = formData.password;
      }
      const res = await api.updateUser(editingUser.id, payload);
      if (res && res.success) {
        showToast(`User account "${formData.name}" updated successfully.`);
        loadUsers();
      } else {
        showToast(res?.message || 'Failed to update user', 'error');
      }
    } else {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password || 'DealFlow@2026',
        roleId: backendRole
      };
      const res = await api.createUser(payload);
      if (res && res.success) {
        showToast(`New user "${formData.name}" provisioned successfully.`);
        loadUsers();
      } else {
        showToast(res?.message || 'Failed to provision user', 'error');
      }
    }

    setIsFormModalOpen(false);
  };

  // Handle Toggle Status
  const handleToggleStatus = async () => {
    if (!selectedUser) return;
    const isDeactivating = selectedUser.status !== 'Deactivated';

    const res = isDeactivating
      ? await api.deleteUser(selectedUser.id)
      : await api.reactivateUser(selectedUser.id);

    if (res && res.success) {
      showToast(`User account status updated.`, 'info');
      loadUsers();
    } else {
      showToast(res?.message || 'Failed to toggle status', 'error');
    }
    setIsConfirmModalOpen(false);
  };

  // Filtered users
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
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
              <MS icon="admin_panel_settings" size={22} />
            </div>
            <div>
              <h1 className="headline-lg" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                Users & Roles RBAC Governance Matrix
              </h1>
              <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                Role-Based Access Control Matrix, System User Directory, & Scope Privilege Governance
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={handleOpenAddModal} className="btn btn-primary btn-sm">
            <MS icon="person_add" size={16} /> + Provision User
          </button>
        </div>
      </div>

      {/* Telemetry Ribbon */}
      <div className="grid-metrics">
        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>System Users</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>{users.length} Accounts</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Active User Registry</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>System Roles</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>5 Roles</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Canonical Architecture</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Active Session</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>Victoria Stone</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>#USR-401 • System Admin</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Auth Engine</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-surface)' }}>OAuth2 / JWT</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Enterprise Session Active</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Permission Engine</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>Strict Isolation</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>No Cross-Role Leaks</span>
        </div>

        <div className="card card-body">
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>RBAC Policy</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>Enforced</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Role Boundaries Active</span>
        </div>
      </div>

      {/* RBAC Capabilities Matrix Table */}
      <div className="card">
        <div className="card-header flex-between">
          <div>
            <h3 className="headline-sm" style={{ color: 'var(--primary)' }}>RBAC Capability & Permission Scope Matrix</h3>
            <p className="body-sm" style={{ color: 'var(--outline)' }}>Feature permissions across the 5 system roles</p>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>System Role</th>
                <th>Create & Edit Quotes</th>
                <th>Approve Overrides</th>
                <th>Inspect Cost / Margin</th>
                <th>Stock Allocation</th>
                <th>System Governance</th>
                <th>Buyer Portal Access</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="badge badge-secondary" style={{ fontSize: 12 }}>Sales Representative</span></td>
                <td><span className="badge badge-success">&check; ALLOWED</span></td>
                <td><span className="badge badge-error">&cross; BLOCKED</span></td>
                <td><span className="badge badge-error">&cross; HIDDEN</span></td>
                <td><span className="badge badge-surface">INSPECT ONLY</span></td>
                <td><span className="badge badge-error">&cross; BLOCKED</span></td>
                <td><span className="badge badge-error">&cross; BLOCKED</span></td>
              </tr>
              <tr>
                <td><span className="badge badge-primary" style={{ fontSize: 12 }}>Sales Manager / Approver</span></td>
                <td><span className="badge badge-surface">INSPECT ONLY</span></td>
                <td><span className="badge badge-success">&check; ALLOWED</span></td>
                <td><span className="badge badge-success">&check; ALLOWED</span></td>
                <td><span className="badge badge-surface">INSPECT ONLY</span></td>
                <td><span className="badge badge-error">&cross; BLOCKED</span></td>
                <td><span className="badge badge-error">&cross; BLOCKED</span></td>
              </tr>
              <tr>
                <td><span className="badge badge-surface" style={{ fontSize: 12 }}>Finance / Operations</span></td>
                <td><span className="badge badge-surface">INSPECT ONLY</span></td>
                <td><span className="badge badge-error">&cross; BLOCKED</span></td>
                <td><span className="badge badge-success">&check; ALLOWED</span></td>
                <td><span className="badge badge-success">&check; ALLOWED</span></td>
                <td><span className="badge badge-error">&cross; BLOCKED</span></td>
                <td><span className="badge badge-error">&cross; BLOCKED</span></td>
              </tr>
              <tr>
                <td><span className="badge badge-error" style={{ fontSize: 12 }}>Administrator</span></td>
                <td><span className="badge badge-surface">INSPECT ONLY</span></td>
                <td><span className="badge badge-surface">INSPECT ONLY</span></td>
                <td><span className="badge badge-success">&check; ALLOWED</span></td>
                <td><span className="badge badge-surface">INSPECT ONLY</span></td>
                <td><span className="badge badge-success">&check; FULL GOVERNANCE</span></td>
                <td><span className="badge badge-error">&cross; BLOCKED</span></td>
              </tr>
              <tr>
                <td><span className="badge badge-amber" style={{ fontSize: 12 }}>Customer Portal User</span></td>
                <td><span className="badge badge-surface">COUNTER-OFFER ONLY</span></td>
                <td><span className="badge badge-error">&cross; BLOCKED</span></td>
                <td><span className="badge badge-error">&cross; HIDDEN</span></td>
                <td><span className="badge badge-surface">48H HOLD ONLY</span></td>
                <td><span className="badge badge-error">&cross; BLOCKED</span></td>
                <td><span className="badge badge-success">&check; ALLOWED</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* User Roster */}
      <div className="card">
        <div className="card-header flex-between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 className="headline-sm" style={{ color: 'var(--primary)' }}>Active User Directory</h3>
            <p className="body-sm" style={{ color: 'var(--outline)' }}>User profiles and assigned canonical role</p>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search user name or role..."
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
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Assigned Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 30, color: 'var(--outline)' }}>
                    No users matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((usr) => (
                  <tr key={usr.id} style={{ opacity: usr.status === 'Deactivated' ? 0.6 : 1 }}>
                    <td className="font-mono font-semibold">{usr.id}</td>
                    <td><strong>{usr.name}</strong></td>
                    <td>{usr.email}</td>
                    <td>
                      <span className={`badge ${
                        usr.role === 'Administrator' ? 'badge-error' :
                        usr.role.includes('Representative') ? 'badge-secondary' :
                        usr.role.includes('Manager') ? 'badge-primary' :
                        usr.role.includes('Customer') ? 'badge-amber' : 'badge-surface'
                      }`}>
                        {usr.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${usr.status.includes('ACTIVE') || usr.status === 'Active' ? 'badge-success' : 'badge-error'}`}>
                        {usr.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleOpenDetailModal(usr)} className="btn btn-outline btn-sm" title="View Profile">
                          View
                        </button>
                        <button onClick={() => handleOpenEditModal(usr)} className="btn btn-outline btn-sm" title="Edit User">
                          Edit
                        </button>
                        {usr.id !== 'USR-401' && (
                          <button onClick={() => handleOpenConfirmModal(usr)} className="btn btn-outline btn-sm" style={{ color: usr.status === 'Deactivated' ? '#16a34a' : '#dc2626' }}>
                            {usr.status === 'Deactivated' ? 'Activate' : 'Deactivate'}
                          </button>
                        )}
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
        title={editingUser ? `Edit User: ${editingUser.name}` : 'Provision New System User Account'}
      >
        <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Full Name *</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Jordan Miller"
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}
            />
            {formErrors.name && <span style={{ color: '#dc2626', fontSize: 11 }}>{formErrors.name}</span>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Corporate Email Address *</label>
            <input
              type="email"
              className="form-control"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="jordan.miller@dealflow360.internal"
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}
            />
            {formErrors.email && <span style={{ color: '#dc2626', fontSize: 11 }}>{formErrors.email}</span>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
              {editingUser ? 'New Password (leave blank to keep existing)' : 'Password *'}
            </label>
            <input
              type="password"
              className="form-control"
              value={formData.password || ''}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={editingUser ? '••••••••' : 'Min 6 characters'}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}
            />
            {formErrors.password && <span style={{ color: '#dc2626', fontSize: 11 }}>{formErrors.password}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Assigned Role *</label>
              <select
                className="form-control"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', background: '#fff' }}
              >
                <option value="Sales Representative">Sales Representative</option>
                <option value="Sales Manager / Approver">Sales Manager / Approver</option>
                <option value="Finance / Operations">Finance / Operations</option>
                <option value="Administrator">Administrator</option>
                <option value="Customer Portal User">Customer Portal User</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Regional Scope</label>
              <select
                className="form-control"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', background: '#fff' }}
              >
                <option value="Global">Global</option>
                <option value="North America">North America</option>
                <option value="LATAM">LATAM</option>
                <option value="EMEA">EMEA</option>
                <option value="APAC">APAC</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" onClick={() => setIsFormModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingUser ? 'Save User Account' : 'Provision User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`User Specification — ${selectedUser?.name || ''}`}
      >
        {selectedUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'var(--surface-container-low)', padding: 14, borderRadius: 8 }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>User ID</span>
                <strong className="font-mono" style={{ fontSize: 14 }}>{selectedUser.id}</strong>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Assigned Role</span>
                <span className={`badge ${selectedUser.role === 'Administrator' ? 'badge-error' : 'badge-secondary'}`}>
                  {selectedUser.role}
                </span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Email Address</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{selectedUser.email}</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Regional Scope</span>
                <span style={{ fontSize: 13 }}>{selectedUser.region}</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', display: 'block' }}>Account Status</span>
                <span className={`badge ${selectedUser.status === 'Deactivated' ? 'badge-error' : 'badge-success'}`}>
                  {selectedUser.status}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => { setIsDetailModalOpen(false); handleOpenEditModal(selectedUser); }} className="btn btn-outline">
                Edit User
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
        title={selectedUser?.status === 'Deactivated' ? 'Activate User Account?' : 'Deactivate User Account?'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 14, color: 'var(--on-surface)' }}>
            Are you sure you want to {selectedUser?.status === 'Deactivated' ? 'activate' : 'deactivate'} user <strong>{selectedUser?.name} ({selectedUser?.email})</strong>?
          </p>
          <p style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>
            {selectedUser?.status !== 'Deactivated'
              ? 'Deactivating this user will revoke session access immediately.'
              : 'Activating this user will allow system login under their assigned role.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button onClick={() => setIsConfirmModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button
              onClick={handleToggleStatus}
              className={`btn ${selectedUser?.status !== 'Deactivated' ? 'btn-error' : 'btn-primary'}`}
            >
              {selectedUser?.status !== 'Deactivated' ? 'Deactivate User' : 'Activate User'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

