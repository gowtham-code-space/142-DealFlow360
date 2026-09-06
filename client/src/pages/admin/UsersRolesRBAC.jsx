import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

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
  'ADMIN': 'ADMIN',
  'Sales Representative': 'SALES_REP',
  'SALES_REP': 'SALES_REP',
  'Sales Manager / Approver': 'SALES_MANAGER',
  'Sales Manager': 'SALES_MANAGER',
  'SALES_MANAGER': 'SALES_MANAGER',
  'Finance / Operations': 'FINANCE_OPS',
  'Finance Ops': 'FINANCE_OPS',
  'FINANCE_OPS': 'FINANCE_OPS',
  'Customer Portal User': 'CUSTOMER',
  'Customer': 'CUSTOMER',
  'CUSTOMER': 'CUSTOMER'
};

const DEFAULT_USER_FORM = {
  id: '',
  name: '',
  email: '',
  password: '',
  role: 'Sales Representative',
  region: 'Global',
  status: 'Active'
};

export default function UsersRolesRBAC() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form State
  const [formData, setFormData] = useState(DEFAULT_USER_FORM);
  const [formErrors, setFormErrors] = useState({});

  // Bulk Upload State
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [parsedBulkUsers, setParsedBulkUsers] = useState([]);
  const [bulkErrors, setBulkErrors] = useState([]);
  const [isBulkImporting, setIsBulkImporting] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers();
      const rawList = Array.isArray(res?.data?.items)
        ? res.data.items
        : Array.isArray(res?.data)
        ? res.data
        : [];

      if (rawList.length > 0) {
        const formatted = rawList.map(u => ({
          id: u.id,
          name: u.name || 'User',
          email: u.email,
          role: ROLE_MAP[u.roleId || u.role] || u.roleId || u.role || 'Sales Representative',
          roleId: u.roleId || u.role || 'SALES_REP',
          region: u.region || 'Global',
          status: u.isActive === false ? 'Deactivated' : 'Active'
        }));
        setUsers(formatted);
      } else {
        // Fallback demo users if none returned from API yet
        setUsers([
          { id: 'USR-401', name: 'Victoria Stone', email: 'victoria.stone@dealflow360.internal', role: 'Administrator', roleId: 'ADMIN', region: 'Global HQ', status: 'Active' },
          { id: 'USR-201', name: 'David Keller', email: 'david.keller@dealflow360.internal', role: 'Sales Manager / Approver', roleId: 'SALES_MANAGER', region: 'North America', status: 'Active' },
          { id: 'USR-101', name: 'Sarah Jenkins', email: 'sarah.jenkins@dealflow360.internal', role: 'Sales Representative', roleId: 'SALES_REP', region: 'EMEA', status: 'Active' },
          { id: 'USR-301', name: 'Elena Rostova', email: 'elena.rostova@dealflow360.internal', role: 'Finance / Operations', roleId: 'FINANCE_OPS', region: 'Global', status: 'Active' },
          { id: 'CUST-002-USR', name: 'Marcus Vance', email: 'procurement@nexushyperscale.com', role: 'Customer Portal User', roleId: 'CUSTOMER', region: 'West Coast', status: 'Active' }
        ]);
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
        role: backendRole,
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
        password: formData.password || 'DealFlow2026!',
        role: backendRole,
        roleId: backendRole,
        isActive: formData.status === 'Active'
      };
      const res = await api.createUser(payload);
      if (res && res.success) {
        showToast(`New user "${formData.name}" provisioned successfully.`);
        loadUsers();
      } else {
        showToast(res?.message || 'Failed to create user', 'error');
      }
    }

    setIsFormModalOpen(false);
  };

  // Handle Toggle Status
  const handleToggleStatus = async () => {
    if (!selectedUser) return;
    const isActivating = selectedUser.status === 'Deactivated';

    try {
      let res;
      if (isActivating) {
        res = await api.reactivateUser(selectedUser.id);
      } else {
        res = await api.deleteUser(selectedUser.id);
      }

      if (res && res.success) {
        showToast(`User "${selectedUser.name}" ${isActivating ? 'reactivated' : 'deactivated'} successfully.`);
        loadUsers();
      } else {
        showToast(res?.message || 'Failed to update user status', 'error');
      }
    } catch {
      showToast('Action failed', 'error');
    }
    setIsConfirmModalOpen(false);
  };

  // Bulk CSV parser
  const handleParseCsv = (text) => {
    setBulkCsvText(text);
    if (!text.trim()) {
      setParsedBulkUsers([]);
      setBulkErrors([]);
      return;
    }

    const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
    const parsed = [];
    const errors = [];

    // Check if line 0 is a header
    const hasHeader = lines[0].toLowerCase().includes('email') || lines[0].toLowerCase().includes('role');
    const startIdx = hasHeader ? 1 : 0;

    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i];
      // handle comma or tab separated
      const cols = line.includes('\t') ? line.split('\t') : line.split(',');
      if (cols.length < 2) {
        errors.push(`Row ${i + 1}: Invalid format (needs Name, Email, Password, Role)`);
        continue;
      }

      const name = cols[0]?.trim();
      const email = cols[1]?.trim();
      const password = cols[2]?.trim() || 'DealFlow2026!';
      const rawRole = cols[3]?.trim() || 'SALES_REP';
      const role = REVERSE_ROLE_MAP[rawRole] || REVERSE_ROLE_MAP[rawRole.toUpperCase()] || 'SALES_REP';

      if (!name || !email || !email.includes('@')) {
        errors.push(`Row ${i + 1}: Missing valid name or email (${email || 'empty'})`);
        continue;
      }

      parsed.push({
        name,
        email,
        password,
        role,
        roleLabel: ROLE_MAP[role] || role
      });
    }

    setParsedBulkUsers(parsed);
    setBulkErrors(errors);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        handleParseCsv(content);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadSampleCsv = () => {
    const sample = `Name,Email,Password,Role
Sarah Jenkins,sarah.jenkins@dealflow360.internal,Password123!,SALES_REP
David Keller,david.keller@dealflow360.internal,Password123!,SALES_MANAGER
Elena Rostova,elena.rostova@dealflow360.internal,Password123!,FINANCE_OPS
Victoria Stone,victoria.stone@dealflow360.internal,Password123!,ADMIN
Marcus Vance,procurement@nexushyperscale.com,Password123!,CUSTOMER`;

    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'dealflow360_user_import_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Sample CSV template downloaded.');
  };

  const handleExecuteBulkImport = async () => {
    if (parsedBulkUsers.length === 0) {
      showToast('No valid users to import.', 'error');
      return;
    }

    setIsBulkImporting(true);
    try {
      const payload = parsedBulkUsers.map(u => ({
        name: u.name,
        email: u.email,
        password: u.password,
        role: u.role
      }));

      const res = await api.bulkCreateUsers(payload);
      if (res && res.success) {
        showToast(`Successfully imported ${res.data?.created?.length || parsedBulkUsers.length} users in bulk.`);
        setIsBulkModalOpen(false);
        setBulkCsvText('');
        setParsedBulkUsers([]);
        loadUsers();
      } else {
        showToast(res?.message || 'Bulk import partially succeeded or encountered errors.', 'warning');
        loadUsers();
      }
    } catch {
      showToast('Bulk import failed to connect to backend', 'error');
    } finally {
      setIsBulkImporting(false);
    }
  };

  // Filtered list
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.roleId === roleFilter || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
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
              <MS icon="manage_accounts" size={22} />
            </div>
            <div>
              <h1 className="headline-lg" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                User Management & Role Governance
              </h1>
              <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                System User Directory, Individual Account Provisioning & Excel/CSV Bulk Import Engine
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => setIsBulkModalOpen(true)} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MS icon="upload_file" size={16} /> Bulk Upload (CSV/Excel)
          </button>
          <button onClick={handleOpenAddModal} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MS icon="person_add" size={16} /> + Add Individual User
          </button>
        </div>
      </div>

      {/* User Directory Roster */}
      <div className="card">
        <div className="card-header flex-between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 className="headline-sm" style={{ color: 'var(--primary)' }}>Active System User Directory</h3>
            <p className="body-sm" style={{ color: 'var(--outline)' }}>
              Showing {filteredUsers.length} of {users.length} accounts with canonical RBAC authority
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-bar" style={{ minWidth: 260 }}>
              <MS icon="search" size={18} />
              <input
                type="text"
                placeholder="Search user name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="select-input"
              style={{ minWidth: 160 }}
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Administrator</option>
              <option value="SALES_REP">Sales Representative</option>
              <option value="SALES_MANAGER">Sales Manager / Approver</option>
              <option value="FINANCE_OPS">Finance / Operations</option>
              <option value="CUSTOMER">Customer Portal User</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-input"
              style={{ minWidth: 130 }}
            >
              <option value="ALL">All Status</option>
              <option value="Active">Active</option>
              <option value="Deactivated">Deactivated</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User Identifier</th>
                <th>Full Name</th>
                <th>Corporate Email</th>
                <th>Assigned Role (RBAC)</th>
                <th>Territory / Region</th>
                <th>Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--on-surface-variant)' }}>
                    <MS icon="person_search" size={32} />
                    <div style={{ marginTop: 8, fontWeight: 500 }}>No users found matching the filter criteria.</div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((usr) => {
                  const isCustomer = usr.roleId === 'CUSTOMER' || usr.role.includes('Customer');
                  const isAdmin = usr.roleId === 'ADMIN' || usr.role.includes('Admin');
                  const isManager = usr.roleId === 'SALES_MANAGER' || usr.role.includes('Manager');
                  const isFinance = usr.roleId === 'FINANCE_OPS' || usr.role.includes('Finance');

                  const badgeClass = isAdmin
                    ? 'badge-error'
                    : isManager
                    ? 'badge-primary'
                    : isFinance
                    ? 'badge-surface'
                    : isCustomer
                    ? 'badge-amber'
                    : 'badge-secondary';

                  return (
                    <tr key={usr.id}>
                      <td className="font-semibold text-primary-color font-mono">{usr.id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%', background: 'var(--surface-container-high)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                            color: 'var(--primary)'
                          }}>
                            {usr.name.charAt(0)}
                          </div>
                          <span style={{ fontWeight: 600 }}>{usr.name}</span>
                        </div>
                      </td>
                      <td className="font-mono" style={{ fontSize: 12 }}>{usr.email}</td>
                      <td>
                        <span className={`badge ${badgeClass}`} style={{ fontSize: 11 }}>
                          {usr.role}
                        </span>
                      </td>
                      <td><span className="badge badge-surface">{usr.region || 'Global'}</span></td>
                      <td>
                        <span className={`badge ${usr.status === 'Active' ? 'badge-success' : 'badge-error'}`}>
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
                          <button
                            onClick={() => handleOpenConfirmModal(usr)}
                            className={`btn btn-sm ${usr.status === 'Active' ? 'btn-outline' : 'btn-primary'}`}
                            style={usr.status === 'Active' ? { color: 'var(--error)', borderColor: 'var(--error)' } : {}}
                            title={usr.status === 'Active' ? 'Deactivate User' : 'Reactivate User'}
                          >
                            {usr.status === 'Active' ? 'Deactivate' : 'Reactivate'}
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

      {/* SINGLE USER PROVISION / EDIT MODAL */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingUser ? `Edit Account: ${editingUser.name}` : 'Provision New System User'}
        size="md"
      >
        <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label required">Full Name</label>
            <input
              type="text"
              className={`form-input ${formErrors.name ? 'error' : ''}`}
              placeholder="e.g. Marcus Vance"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {formErrors.name && <span className="form-error">{formErrors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label required">Corporate Email Address</label>
            <input
              type="email"
              className={`form-input ${formErrors.email ? 'error' : ''}`}
              placeholder="e.g. user@dealflow360.internal"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {formErrors.email && <span className="form-error">{formErrors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">{editingUser ? 'New Password (leave blank to keep current)' : 'Initial Password'}</label>
            <input
              type="password"
              className={`form-input ${formErrors.password ? 'error' : ''}`}
              placeholder={editingUser ? '••••••••' : 'Min 6 characters'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            {formErrors.password && <span className="form-error">{formErrors.password}</span>}
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label required">Canonical Role (RBAC)</label>
              <select
                className="select-input"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="Sales Representative">Sales Representative</option>
                <option value="Sales Manager / Approver">Sales Manager / Approver</option>
                <option value="Finance / Operations">Finance / Operations</option>
                <option value="Administrator">Administrator</option>
                <option value="Customer Portal User">Customer Portal User</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Account Status</label>
              <select
                className="select-input"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Deactivated">Deactivated</option>
              </select>
            </div>
          </div>

          <div className="modal-actions flex-end" style={{ marginTop: 12 }}>
            <button type="button" onClick={() => setIsFormModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingUser ? 'Save Changes' : 'Provision User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* BULK CSV / EXCEL IMPORT MODAL */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Bulk User Provisioning (CSV / Excel)"
        size="lg"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            padding: '12px 16px', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(209,195,202,0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--primary)' }}>Bulk Import Format: Name, Email, Password, Role</div>
              <div style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Supports roles: SALES_REP, SALES_MANAGER, FINANCE_OPS, ADMIN, CUSTOMER</div>
            </div>
            <button onClick={handleDownloadSampleCsv} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MS icon="download" size={16} /> Sample CSV Template
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label className="form-label">Upload CSV / Excel File</label>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="form-input"
              style={{ padding: '8px 12px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label className="form-label">Or Paste CSV / Tab-Delimited Data Below</label>
            <textarea
              rows={5}
              className="form-input"
              placeholder={`Name,Email,Password,Role\nSarah Jenkins,sarah.jenkins@dealflow360.internal,Password123!,SALES_REP\nDavid Keller,david.keller@dealflow360.internal,Password123!,SALES_MANAGER`}
              value={bulkCsvText}
              onChange={(e) => handleParseCsv(e.target.value)}
              style={{ fontFamily: 'monospace', fontSize: 12 }}
            />
          </div>

          {bulkErrors.length > 0 && (
            <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, color: '#991b1b', fontSize: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Parsing Warnings:</div>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {bulkErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {parsedBulkUsers.length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--secondary)' }}>
                Preview Parsed Users ({parsedBulkUsers.length} Valid Records Ready to Import):
              </div>
              <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid rgba(209,195,202,0.5)', borderRadius: 8 }}>
                <table className="data-table" style={{ fontSize: 11 }}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Assigned Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedBulkUsers.map((u, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                        <td className="font-mono">{u.email}</td>
                        <td><span className="badge badge-primary">{u.roleLabel}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="modal-actions flex-end" style={{ marginTop: 12 }}>
            <button type="button" onClick={() => setIsBulkModalOpen(false)} className="btn btn-outline" disabled={isBulkImporting}>
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecuteBulkImport}
              className="btn btn-primary"
              disabled={parsedBulkUsers.length === 0 || isBulkImporting}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {isBulkImporting ? <MS icon="sync" size={16} /> : <MS icon="cloud_upload" size={16} />}
              {isBulkImporting ? 'Importing Users...' : `Import ${parsedBulkUsers.length} Users`}
            </button>
          </div>
        </div>
      </Modal>

      {/* VIEW DETAIL MODAL */}
      {selectedUser && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`User Dossier: ${selectedUser.name}`}
          size="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', background: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 700
              }}>
                {selectedUser.name.charAt(0)}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, color: 'var(--on-surface)' }}>{selectedUser.name}</h3>
                <span className="font-mono" style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{selectedUser.email}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 14, background: 'var(--surface-container-lowest)', borderRadius: 8 }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', textTransform: 'uppercase' }}>User ID</span>
                <div className="font-mono" style={{ fontSize: 12, fontWeight: 600 }}>{selectedUser.id}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', textTransform: 'uppercase' }}>Assigned RBAC Role</span>
                <div><span className="badge badge-primary">{selectedUser.role}</span></div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', textTransform: 'uppercase' }}>Territory</span>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{selectedUser.region || 'Global'}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--outline)', textTransform: 'uppercase' }}>Account Status</span>
                <div><span className={`badge ${selectedUser.status === 'Active' ? 'badge-success' : 'badge-error'}`}>{selectedUser.status}</span></div>
              </div>
            </div>

            <div className="modal-actions flex-end">
              <button onClick={() => setIsDetailModalOpen(false)} className="btn btn-primary">Close</button>
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRM STATUS TOGGLE MODAL */}
      {selectedUser && (
        <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          title={selectedUser.status === 'Active' ? 'Deactivate User Account' : 'Reactivate User Account'}
          size="sm"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p className="body-md">
              Are you sure you want to {selectedUser.status === 'Active' ? 'deactivate' : 'reactivate'} account for <strong>{selectedUser.name}</strong> ({selectedUser.email})?
            </p>
            <div className="modal-actions flex-end">
              <button onClick={() => setIsConfirmModalOpen(false)} className="btn btn-outline">Cancel</button>
              <button
                onClick={handleToggleStatus}
                className={`btn ${selectedUser.status === 'Active' ? 'btn-error' : 'btn-primary'}`}
              >
                Confirm {selectedUser.status === 'Active' ? 'Deactivate' : 'Reactivate'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
