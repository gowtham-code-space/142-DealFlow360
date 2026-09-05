import React from 'react';

const STATUS_MAP = {
  DRAFT:                { label: 'Draft',         cls: 'status-draft',       icon: 'edit_note' },
  PENDING_APPROVAL:     { label: 'Awaiting Approval', cls: 'status-pending', icon: 'pending_actions' },
  APPROVED:             { label: 'Approved',       cls: 'status-approved',    icon: 'check_circle' },
  REJECTED:             { label: 'Rejected',       cls: 'status-rejected',    icon: 'cancel' },
  CUSTOMER_NEGOTIATION: { label: 'In Negotiation', cls: 'status-negotiation', icon: 'handshake' },
  CUSTOMER_ACCEPTED:    { label: 'Deal Accepted',  cls: 'status-approved',    icon: 'task_alt' },
  FULFILLED:            { label: 'Fulfilled',       cls: 'status-fulfilled',  icon: 'inventory_2' },
  INVOICED:             { label: 'Invoiced',        cls: 'status-fulfilled',  icon: 'receipt_long' },
  COUNTER_PENDING:      { label: 'Counter Sent',   cls: 'status-pending',     icon: 'reply' },
  REAPPROVAL_REQUIRED:  { label: 'Re-approval Required', cls: 'status-pending', icon: 'policy' },
  INVALIDATED:          { label: 'Terms Invalidated', cls: 'status-rejected', icon: 'warning' },
};

const VERDICT_MAP = {
  APPROVED_AUTOMATIC:     { label: 'Auto-Approved', cls: 'approval-auto' },
  REQUIRES_MANAGER_APPROVAL: { label: 'Mgr Review Required', cls: 'approval-manager' },
  REQUIRES_DUAL_APPROVAL: { label: 'Dual Approval Required', cls: 'approval-dual' },
  REJECTED_EXCEEDS_CEILING: { label: 'Policy Rejected', cls: 'approval-invalidated' },
};

export default function StatusBadge({ status, text, showIcon = true }) {
  const map = STATUS_MAP[status] || VERDICT_MAP[status] || { label: status || '—', cls: 'badge-surface' };
  const label = text || map.label;
  return (
    <span className={`badge ${map.cls}`}>
      {showIcon && map.icon && (
        <span className="material-symbols-outlined" style={{ fontSize: 12, color: 'inherit' }}>{map.icon}</span>
      )}
      {label}
    </span>
  );
}

export function VerdictBadge({ verdict }) {
  const map = VERDICT_MAP[verdict] || { label: verdict || '—', cls: 'badge-surface' };
  return (
    <span className={`badge ${map.cls}`}>{map.label}</span>
  );
}
