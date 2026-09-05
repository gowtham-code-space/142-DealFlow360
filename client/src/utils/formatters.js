export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

export const formatPercent = (val) => {
  return `${Number(val || 0).toFixed(1)}%`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'DRAFT': return 'badge-draft';
    case 'PENDING_APPROVAL': return 'badge-pending';
    case 'APPROVED': return 'badge-approved';
    case 'REJECTED': return 'badge-danger';
    case 'CUSTOMER_NEGOTIATION': return 'badge-negotiating';
    case 'CUSTOMER_ACCEPTED': return 'badge-approved';
    case 'FULFILLED': return 'badge-fulfilled';
    default: return 'badge-draft';
  }
};
