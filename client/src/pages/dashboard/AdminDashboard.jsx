import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';
import Modal from '../../components/common/Modal';

const MS = ({ icon, size = 18 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size, color: 'inherit' }}>{icon}</span>
);

export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '' });

  const setTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  const handleBlockedAction = (actionTitle) => {
    setModalConfig({
      isOpen: true,
      title: `Backend API Not Connected — ${actionTitle}`,
      message: `The Administrator UI is currently operating in Read-Only Governance Mode. Backend endpoint for "${actionTitle}" is not connected in the current server instance. No database records were modified.`
    });
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
          <span className="badge" style={{ background: 'rgba(87,52,79,0.1)', color: 'var(--primary)', padding: '6px 12px', fontSize: 12 }}>
            <MS icon="shield" size={16} /> Read-Only Governance Mode
          </span>
          <span className="badge" style={{ background: 'var(--surface-container-high)', color: 'var(--on-surface-variant)', padding: '6px 12px', fontSize: 12 }}>
            <MS icon="dns" size={16} /> Backend Endpoint: Disconnected
          </span>
          <button
            onClick={() => handleBlockedAction('Export System Governance Report')}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <MS icon="download" size={16} /> Export Governance Spec
          </button>
        </div>
      </div>

      {/* Governance Banner Notice */}
      <div style={{
        padding: '12px 16px', borderRadius: 'var(--radius-lg)',
        background: 'rgba(146,239,245,0.15)', borderLeft: '4px solid var(--secondary)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <MS icon="info" size={20} />
          <span style={{ fontSize: 12, color: 'var(--on-surface)' }}>
            <strong>Governance Authenticity Notice:</strong> All displayed rules reflect frontend system policies & constants. Mutation operations are explicitly set to <em>Read-Only</em> state.
          </span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          CLASSIFICATION: EXISTING FRONTEND CONFIGURATION & READ-ONLY
        </span>
      </div>

      {/* Metric Cards Top Bar */}
      <div className="grid-metrics">
        <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Governance Policies</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>12 Active Rules</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>4 Tiers • 5 Approval Routes</span>
        </div>

        <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>RBAC System Roles</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>5 Canonical Roles</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Rep, Mgr, Ops, Admin, Buyer</span>
        </div>

        <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Hard Discount Cap</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--error)' }}>45.0% Ceiling</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Auto-Rejection Threshold</span>
        </div>

        <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Gross Margin Floor</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-surface)' }}>22.0% Minimum</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Deal Profit Lock</span>
        </div>

        <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>Executive Threshold</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>&gt;30% / ₹2.0 Cr</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Dual VP Approval Required</span>
        </div>

        <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>System Write Status</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--error)' }}>Read-Only</div>
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Backend API Not Connected</span>
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
              <button onClick={() => handleBlockedAction('Add New Policy Rule')} className="btn btn-primary btn-sm">
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
                  <tr>
                    <td className="font-semibold text-primary-color">POL-STD-DISC</td>
                    <td>Discount Limit</td>
                    <td><span className="badge badge-surface">Standard Tier</span></td>
                    <td className="font-mono">Max 10.0% Discount</td>
                    <td>Requires Manager Approval if &gt;10%</td>
                    <td><span className="badge badge-amber">LOW RISK</span></td>
                    <td><span className="badge badge-success">ACTIVE</span></td>
                    <td>
                      <button onClick={() => handleBlockedAction('Edit Rule POL-STD-DISC')} className="btn btn-outline btn-sm">View Rule</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-primary-color">POL-GLD-DISC</td>
                    <td>Discount Limit</td>
                    <td><span className="badge badge-amber">Gold Tier</span></td>
                    <td className="font-mono">Max 20.0% Discount</td>
                    <td>Requires Manager Approval if &gt;20%</td>
                    <td><span className="badge badge-amber">LOW RISK</span></td>
                    <td><span className="badge badge-success">ACTIVE</span></td>
                    <td>
                      <button onClick={() => handleBlockedAction('Edit Rule POL-GLD-DISC')} className="btn btn-outline btn-sm">View Rule</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-primary-color">POL-PLT-DISC</td>
                    <td>Discount Limit</td>
                    <td><span className="badge badge-secondary">Platinum Tier</span></td>
                    <td className="font-mono">Max 30.0% Discount</td>
                    <td>Requires Manager Approval if &gt;30%</td>
                    <td><span className="badge badge-amber">MEDIUM RISK</span></td>
                    <td><span className="badge badge-success">ACTIVE</span></td>
                    <td>
                      <button onClick={() => handleBlockedAction('Edit Rule POL-PLT-DISC')} className="btn btn-outline btn-sm">View Rule</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-primary-color">POL-EXEC-DUAL</td>
                    <td>Approval Escalation</td>
                    <td>All Customer Tiers</td>
                    <td className="font-mono">Discount &gt;30% OR Contract &gt;₹2.0 Cr</td>
                    <td>Triggers Dual VP Finance Approval</td>
                    <td><span className="badge badge-error">HIGH RISK</span></td>
                    <td><span className="badge badge-success">ACTIVE</span></td>
                    <td>
                      <button onClick={() => handleBlockedAction('Edit Rule POL-EXEC-DUAL')} className="btn btn-outline btn-sm">View Rule</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-primary-color">POL-HARD-CEILING</td>
                    <td>Hard Policy Floor</td>
                    <td>System-Wide</td>
                    <td className="font-mono">Discount &gt;45.0%</td>
                    <td>Automated System Rejection</td>
                    <td><span className="badge badge-error">CRITICAL</span></td>
                    <td><span className="badge badge-success">ENFORCED</span></td>
                    <td>
                      <button onClick={() => handleBlockedAction('Edit Rule POL-HARD-CEILING')} className="btn btn-outline btn-sm">View Rule</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-primary-color">POL-MARGIN-FLOOR</td>
                    <td>Margin Lock</td>
                    <td>Hardware & Software</td>
                    <td className="font-mono">Gross Margin &lt;22.0%</td>
                    <td>Automated Deal Block / Margin Floor Alert</td>
                    <td><span className="badge badge-error">CRITICAL</span></td>
                    <td><span className="badge badge-success">ENFORCED</span></td>
                    <td>
                      <button onClick={() => handleBlockedAction('Edit Rule POL-MARGIN-FLOOR')} className="btn btn-outline btn-sm">View Rule</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* System Canonical Roles Matrix */}
          <div>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="headline-sm" style={{ color: 'var(--primary)' }}>System Role Architecture (RBAC)</h3>
                <p className="body-sm" style={{ color: 'var(--outline)' }}>The 5 canonical system roles and their scope of authority</p>
              </div>
              <button onClick={() => handleBlockedAction('Configure RBAC Matrix')} className="btn btn-outline btn-sm">
                <MS icon="security" size={16} /> Manage Roles
              </button>
            </div>

            <div className="grid-metrics" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
              <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8, borderLeft: '4px solid var(--secondary)' }}>
                <span className="badge badge-secondary" style={{ width: 'fit-content' }}>ROLE 1</span>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--on-surface)' }}>Sales Representative</h4>
                <p style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>
                  CPQ Quote Creation, Customer Negotiation, Fast-Path Discount Requests within Tier Limits.
                </p>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--outline)', marginTop: 'auto' }}>SCOPE: Territory Accounts</div>
              </div>

              <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8, borderLeft: '4px solid var(--primary)' }}>
                <span className="badge badge-primary" style={{ width: 'fit-content' }}>ROLE 2</span>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--on-surface)' }}>Sales Manager / Approver</h4>
                <p style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>
                  Approval Queue Management, Discount Overrides, Margin Waiver, Re-approval Triggers.
                </p>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--outline)', marginTop: 'auto' }}>SCOPE: Sales Team / Queue</div>
              </div>

              <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8, borderLeft: '4px solid #075985' }}>
                <span className="badge badge-surface" style={{ width: 'fit-content' }}>ROLE 3</span>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--on-surface)' }}>Finance / Operations</h4>
                <p style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>
                  Warehouse Stock Allocation, Fulfillment Locking, Hybrid Invoicing & Billing Engine.
                </p>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--outline)', marginTop: 'auto' }}>SCOPE: Operations / ERP</div>
              </div>

              <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8, borderLeft: '4px solid var(--error)' }}>
                <span className="badge badge-error" style={{ width: 'fit-content' }}>ROLE 4</span>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--on-surface)' }}>Administrator</h4>
                <p style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>
                  System Governance, Policy Matrix Visibility, RBAC User Access, Audit Log Inspection.
                </p>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--outline)', marginTop: 'auto' }}>SCOPE: Global System Console</div>
              </div>

              <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8, borderLeft: '4px solid #78350f' }}>
                <span className="badge badge-amber" style={{ width: 'fit-content' }}>ROLE 5</span>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--on-surface)' }}>Customer Portal User</h4>
                <p style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>
                  Self-service Proposal Review, Counter-Offer Submission, 48h Stock Hold, Digital Invoice Payment.
                </p>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--outline)', marginTop: 'auto' }}>SCOPE: External Buyer Portal</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GOVERNANCE POLICIES */}
      {activeTab === 'policies' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Customer Tier Governance */}
          <div className="card">
            <div className="card-header flex-between">
              <div>
                <h3 className="headline-sm" style={{ color: 'var(--primary)' }}>Customer Tier Governance Specifications</h3>
                <p className="body-sm" style={{ color: 'var(--outline)' }}>
                  Distinction between <strong>Customer Tier</strong> (STANDARD / GOLD / PLATINUM) and <strong>Customer Purchase Type</strong> (ONE_TIME / BULK / RECURRING)
                </p>
              </div>
              <button onClick={() => handleBlockedAction('Modify Tier Governance')} className="btn btn-outline btn-sm">
                <MS icon="edit" size={16} /> Edit Tier Limits
              </button>
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
                    <th>Governance Level</th>
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
                    <td><span className="badge badge-amber">Level 1 Manager Review</span></td>
                  </tr>
                  <tr>
                    <td><span className="badge badge-amber" style={{ fontSize: 12 }}>GOLD</span></td>
                    <td className="font-mono font-semibold text-amber">20.0%</td>
                    <td className="font-mono text-emerald">≤ 12.0%</td>
                    <td className="font-mono">{formatCurrency(12000000)}</td>
                    <td>ONE_TIME, RECURRING_FREE, RECURRING_PREMIUM</td>
                    <td>High-Priority 24-Hour SLA</td>
                    <td><span className="badge badge-amber">Level 1 Manager Review</span></td>
                  </tr>
                  <tr>
                    <td><span className="badge badge-secondary" style={{ fontSize: 12 }}>PLATINUM</span></td>
                    <td className="font-mono font-semibold text-secondary-color">30.0%</td>
                    <td className="font-mono text-emerald">≤ 20.0%</td>
                    <td className="font-mono">{formatCurrency(20000000)}</td>
                    <td>ONE_TIME, BULK_ONE_TIME, RECURRING_PREMIUM</td>
                    <td>Mission Critical 4-Hour SLA</td>
                    <td><span className="badge badge-primary">Level 2 VP Approval</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Customer Purchase Type Matrix */}
          <div className="card">
            <div className="card-header">
              <h3 className="headline-sm" style={{ color: 'var(--primary)' }}>Customer Purchase Type Definitions</h3>
              <p className="body-sm" style={{ color: 'var(--outline)' }}>Product billing categories and recurring revenue classification</p>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Purchase Type Code</th>
                    <th>Description</th>
                    <th>Revenue Model</th>
                    <th>Inventory Reservation</th>
                    <th>Governance Rule</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-mono font-semibold">ONE_TIME</td>
                    <td>Standard Hardware & Accessory Order</td>
                    <td>Upfront CapEx</td>
                    <td>50% Normal Inventory Pool</td>
                    <td>Requires immediate allocation check</td>
                  </tr>
                  <tr>
                    <td className="font-mono font-semibold">BULK_ONE_TIME</td>
                    <td>High-Volume Enterprise Hardware Deployment</td>
                    <td>Upfront CapEx + Tiered Volume Discount</td>
                    <td>50% Premium Bulk Pool Lock</td>
                    <td>Triggers warehouse split optimization</td>
                  </tr>
                  <tr>
                    <td className="font-mono font-semibold">RECURRING_FREE</td>
                    <td>SaaS Evaluation / Trial Subscription</td>
                    <td>Monthly OpEx (Waived)</td>
                    <td>Digital License Provisioning</td>
                    <td>Max 30 days trial duration cap</td>
                  </tr>
                  <tr>
                    <td className="font-mono font-semibold">RECURRING_PREMIUM</td>
                    <td>Enterprise SaaS & 24/7 SLA Subscription</td>
                    <td>Monthly or Annual OpEx</td>
                    <td>Guaranteed SLA Resource Lock</td>
                    <td>Supports auto-renewal & indexation</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACCOUNTS & USERS */}
      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* User Directory */}
          <div className="card">
            <div className="card-header flex-between">
              <div>
                <h3 className="headline-sm" style={{ color: 'var(--primary)' }}>System Users & Account Registry</h3>
                <p className="body-sm" style={{ color: 'var(--outline)' }}>Active canonical user profiles across all 5 system roles</p>
              </div>
              <button onClick={() => handleBlockedAction('Create New User')} className="btn btn-primary btn-sm">
                <MS icon="person_add" size={16} /> Create System User
              </button>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>User Name</th>
                    <th>Email Address</th>
                    <th>Assigned Role</th>
                    <th>Territory / Org</th>
                    <th>Session Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-mono font-semibold">USR-401</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" alt="Victoria" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                        <strong style={{ color: 'var(--primary)' }}>Victoria Stone</strong>
                      </div>
                    </td>
                    <td>victoria.stone@dealflow360.internal</td>
                    <td><span className="badge badge-error">Administrator</span></td>
                    <td>Global Corporate HQ</td>
                    <td><span className="badge badge-success">ACTIVE SESSION</span></td>
                    <td>
                      <button onClick={() => handleBlockedAction('Modify User USR-401')} className="btn btn-outline btn-sm">Edit Role</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-mono font-semibold">USR-101</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" alt="Sarah" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                        <span>Sarah Jenkins</span>
                      </div>
                    </td>
                    <td>sarah.jenkins@dealflow360.internal</td>
                    <td><span className="badge badge-secondary">Sales Representative</span></td>
                    <td>Midwest Commercial</td>
                    <td><span className="badge badge-surface">OFFLINE</span></td>
                    <td>
                      <button onClick={() => handleBlockedAction('Modify User USR-101')} className="btn btn-outline btn-sm">Edit Role</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-mono font-semibold">USR-102</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" alt="Alex" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                        <span>Alex Rivera</span>
                      </div>
                    </td>
                    <td>alex.rivera@dealflow360.internal</td>
                    <td><span className="badge badge-secondary">Sales Representative</span></td>
                    <td>Enterprise Strategic</td>
                    <td><span className="badge badge-surface">OFFLINE</span></td>
                    <td>
                      <button onClick={() => handleBlockedAction('Modify User USR-102')} className="btn btn-outline btn-sm">Edit Role</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-mono font-semibold">USR-201</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" alt="David" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                        <span>David Keller</span>
                      </div>
                    </td>
                    <td>david.keller@dealflow360.internal</td>
                    <td><span className="badge badge-primary">Sales Manager / Approver</span></td>
                    <td>VP Sales Desk</td>
                    <td><span className="badge badge-surface">OFFLINE</span></td>
                    <td>
                      <button onClick={() => handleBlockedAction('Modify User USR-201')} className="btn btn-outline btn-sm">Edit Role</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-mono font-semibold">USR-301</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" alt="Elena" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                        <span>Elena Rostova</span>
                      </div>
                    </td>
                    <td>elena.rostova@dealflow360.internal</td>
                    <td><span className="badge badge-surface">Finance / Operations</span></td>
                    <td>Fulfillment Operations</td>
                    <td><span className="badge badge-surface">OFFLINE</span></td>
                    <td>
                      <button onClick={() => handleBlockedAction('Modify User USR-301')} className="btn btn-outline btn-sm">Edit Role</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-mono font-semibold">CUST-002-USR</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" alt="Marcus" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                        <span>Marcus Vance</span>
                      </div>
                    </td>
                    <td>procurement@nexushyperscale.com</td>
                    <td><span className="badge badge-amber">Customer Portal User</span></td>
                    <td>Nexus HyperScale Ltd</td>
                    <td><span className="badge badge-surface">OFFLINE</span></td>
                    <td>
                      <button onClick={() => handleBlockedAction('Modify User CUST-002-USR')} className="btn btn-outline btn-sm">Edit Role</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT & COMPLIANCE */}
      {activeTab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="card-header flex-between">
              <div>
                <h3 className="headline-sm" style={{ color: 'var(--primary)' }}>System Audit & Compliance Log Stream</h3>
                <p className="body-sm" style={{ color: 'var(--outline)' }}>Immutable record of policy evaluations, approval routing, and security events</p>
              </div>
              <button onClick={() => handleBlockedAction('Download Audit Log CSV')} className="btn btn-outline btn-sm">
                <MS icon="download" size={16} /> Export Audit Log
              </button>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Log ID</th>
                    <th>Timestamp</th>
                    <th>Actor</th>
                    <th>Event Description</th>
                    <th>Target Entity</th>
                    <th>Risk Rating</th>
                    <th>Governance Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-mono font-semibold">AUD-8921</td>
                    <td>2026-09-05 14:22:04</td>
                    <td>Victoria Stone (Admin)</td>
                    <td>Authenticated into Admin Console</td>
                    <td className="font-mono">SESSION-901</td>
                    <td><span className="badge badge-success">INFO</span></td>
                    <td>Access Granted</td>
                  </tr>
                  <tr>
                    <td className="font-mono font-semibold">AUD-8920</td>
                    <td>2026-09-04 14:32:15</td>
                    <td>Marcus Vance (Customer)</td>
                    <td>Submitted counter-offer (25% disc, Net 60)</td>
                    <td className="font-mono">Q-2026-002</td>
                    <td><span className="badge badge-amber">MEDIUM</span></td>
                    <td>Re-approval Triggered</td>
                  </tr>
                  <tr>
                    <td className="font-mono font-semibold">AUD-8919</td>
                    <td>2026-09-02 11:15:40</td>
                    <td>Sarah Jenkins (Rep)</td>
                    <td>Created quote exceeding Gold Tier limit (22% vs 20%)</td>
                    <td className="font-mono">Q-2026-001</td>
                    <td><span className="badge badge-amber">MEDIUM</span></td>
                    <td>Routed to Sales Manager</td>
                  </tr>
                  <tr>
                    <td className="font-mono font-semibold">AUD-8918</td>
                    <td>2026-08-30 09:44:12</td>
                    <td>David Keller (Manager)</td>
                    <td>Approved quotation override (15% disc)</td>
                    <td className="font-mono">Q-2026-003</td>
                    <td><span className="badge badge-success">LOW</span></td>
                    <td>Status: APPROVED</td>
                  </tr>
                  <tr>
                    <td className="font-mono font-semibold">AUD-8917</td>
                    <td>2026-08-25 16:50:33</td>
                    <td>Discount Evaluator</td>
                    <td>Evaluated quote against Gold Tier policy</td>
                    <td className="font-mono">Q-2026-004</td>
                    <td><span className="badge badge-success">LOW</span></td>
                    <td>Auto-Approved</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SYSTEM CONFIGURATION */}
      {activeTab === 'config' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <h3 className="headline-sm" style={{ color: 'var(--primary)' }}>System Parameters & Feature Flags</h3>
              <p className="body-sm" style={{ color: 'var(--outline)' }}>Global engine configurations and API connectivity indicators</p>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Feature / Parameter Key</th>
                    <th>Description</th>
                    <th>Current State</th>
                    <th>Execution Layer</th>
                    <th>Read-Only Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-mono font-semibold">AUTOMATED_DISCOUNT_EVALUATOR</td>
                    <td>Evaluates discount requests against customer tier policy limits</td>
                    <td><span className="badge badge-success">ENABLED</span></td>
                    <td>Frontend Fallback Engine</td>
                    <td>Active Rule (Read-Only)</td>
                  </tr>
                  <tr>
                    <td className="font-mono font-semibold">INVENTORY_48H_HOLD_LOCK</td>
                    <td>Reserves 50/50 stock pool for active customer negotiations</td>
                    <td><span className="badge badge-success">ENABLED</span></td>
                    <td>Local State Engine</td>
                    <td>Active Rule (Read-Only)</td>
                  </tr>
                  <tr>
                    <td className="font-mono font-semibold">DUAL_EXECUTIVE_APPROVAL_CHAIN</td>
                    <td>Requires VP Finance approval for deals &gt; ₹2.0 Cr or &gt; 30% discount</td>
                    <td><span className="badge badge-success">ENABLED</span></td>
                    <td>Rule Evaluator</td>
                    <td>Active Rule (Read-Only)</td>
                  </tr>
                  <tr>
                    <td className="font-mono font-semibold">ADMIN_WRITE_MUTATION_API</td>
                    <td>Allows HTTP POST/PUT/DELETE for policy configuration and user CRUD</td>
                    <td><span className="badge badge-error">DISCONNECTED</span></td>
                    <td>Backend Server Instance</td>
                    <td>Blocked / Backend Offline</td>
                  </tr>
                  <tr>
                    <td className="font-mono font-semibold">BACKEND_API_BASE_URL</td>
                    <td>http://localhost:5000/api</td>
                    <td><span className="badge badge-amber">FALLBACK ACTIVE</span></td>
                    <td>Offline Dev Mode</td>
                    <td>Read-Only Fallback</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Action Blocked Modal */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        title={modalConfig.title}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            padding: 12, borderRadius: 'var(--radius-md)',
            background: 'var(--error-container)', color: 'var(--on-error-container)',
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 12
          }}>
            <MS icon="lock" size={20} />
            <span><strong>Read-Only Governance Protection:</strong> Modification operations are restricted until backend API endpoints are deployed.</span>
          </div>
          <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>
            {modalConfig.message}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}
              className="btn btn-primary"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
