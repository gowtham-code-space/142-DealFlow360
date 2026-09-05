/**
 * DealFlow360 Enums and Constants
 * Single source of truth for all database enums, role definitions, and business constants.
 */

const Role = Object.freeze({
  ADMIN: 'ADMIN',
  SALES_REP: 'SALES_REP',
  SALES_MANAGER: 'SALES_MANAGER',
  FINANCE_OPS: 'FINANCE_OPS',
  CUSTOMER: 'CUSTOMER'
});

const RoleGroups = Object.freeze({
  ADMIN_ONLY: [Role.ADMIN],
  MANAGERS: [Role.ADMIN, Role.SALES_MANAGER],
  SALES: [Role.ADMIN, Role.SALES_MANAGER, Role.SALES_REP],
  FINANCE: [Role.ADMIN, Role.FINANCE_OPS],
  APPROVERS: [Role.ADMIN, Role.SALES_MANAGER, Role.SALES_REP, Role.FINANCE_OPS],
  INTERNAL: [Role.ADMIN, Role.SALES_MANAGER, Role.SALES_REP, Role.FINANCE_OPS],
  ALL_USERS: [Role.ADMIN, Role.SALES_MANAGER, Role.SALES_REP, Role.FINANCE_OPS, Role.CUSTOMER]
});

const CustomerTier = Object.freeze({
  FREE: 'FREE',
  STANDARD: 'STANDARD',
  PREMIUM: 'PREMIUM',
  GOLD: 'GOLD',
  PLATINUM: 'PLATINUM'
});

const ProductType = Object.freeze({
  HARDWARE: 'HARDWARE',
  SOFTWARE: 'SOFTWARE',
  SERVICE: 'SERVICE'
});

const QuoteStatus = Object.freeze({
  DRAFT: 'DRAFT',
  SALES_REP_REVIEW: 'SALES_REP_REVIEW',
  MANAGER_REVIEW: 'MANAGER_REVIEW',
  FINANCE_REVIEW: 'FINANCE_REVIEW',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  RETURNED: 'RETURNED',
  APPROVED: 'APPROVED',
  SENT_TO_CUSTOMER: 'SENT_TO_CUSTOMER',
  UNDER_NEGOTIATION: 'UNDER_NEGOTIATION',
  CUSTOMER_NEGOTIATION: 'CUSTOMER_NEGOTIATION',
  CUSTOMER_ACCEPTED: 'CUSTOMER_ACCEPTED',
  CONFIRMED: 'CONFIRMED',
  FULFILLING: 'FULFILLING',
  PARTIALLY_FULFILLED: 'PARTIALLY_FULFILLED',
  FULFILLED: 'FULFILLED',
  BILLED: 'BILLED',
  INVOICED: 'INVOICED',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED'
});

const PoolType = Object.freeze({
  NORMAL: 'NORMAL',
  PREMIUM_BULK: 'PREMIUM_BULK'
});

const ApprovalStage = Object.freeze({
  SALES_REP: 'SALES_REP',
  SALES_MANAGER: 'SALES_MANAGER',
  FINANCE_OPS: 'FINANCE_OPS'
});

const ApprovalStatus = Object.freeze({
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  RETURNED: 'RETURNED',
  INVALIDATED: 'INVALIDATED'
});

const AllocationStatus = Object.freeze({
  PENDING: 'PENDING',
  PROPOSED: 'PROPOSED',
  ACCEPTED: 'ACCEPTED',
  OVERRIDDEN: 'OVERRIDDEN',
  ALLOCATED: 'ALLOCATED',
  DISPATCHED: 'DISPATCHED',
  DELIVERED: 'DELIVERED'
});

const BackorderStatus = Object.freeze({
  CREATED: 'CREATED',
  STOCK_ARRIVED: 'STOCK_ARRIVED',
  FULFILLED: 'FULFILLED',
  CANCELLED: 'CANCELLED'
});

const DepositStatus = Object.freeze({
  PENDING: 'PENDING',
  PAID: 'PAID',
  REFUNDED: 'REFUNDED',
  DEDUCTED_FROM_INVOICE: 'DEDUCTED_FROM_INVOICE'
});

const InvoiceType = Object.freeze({
  ONE_TIME: 'ONE_TIME',
  RECURRING: 'RECURRING'
});

const InvoiceStatus = Object.freeze({
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED',
  CLOSED: 'CLOSED'
});

const PaymentStatus = Object.freeze({
  PENDING: 'PENDING',
  SUCCESSFUL: 'SUCCESSFUL',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
});

const SubscriptionStatus = Object.freeze({
  ACTIVE: 'ACTIVE',
  MODIFIED: 'MODIFIED',
  CANCELLED: 'CANCELLED'
});

const BillingPeriod = Object.freeze({
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  YEARLY: 'YEARLY'
});

const ProrationType = Object.freeze({
  DAILY: 'DAILY',
  NONE: 'NONE'
});

const DiscountTypeEnum = Object.freeze({
  BULK: 'BULK',
  CONSISTENCY: 'CONSISTENCY',
  PREMIUM: 'PREMIUM',
  VARIANT: 'VARIANT'
});

const NegotiationTicketStatus = Object.freeze({
  OPEN: 'OPEN',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  COUNTERED: 'COUNTERED',
  EXPIRED: 'EXPIRED'
});

const HoldStatus = Object.freeze({
  ACTIVE: 'ACTIVE',
  RELEASED: 'RELEASED',
  CONSUMED: 'CONSUMED',
  EXPIRED: 'EXPIRED'
});

const NotificationType = Object.freeze({
  APPROVAL_REQUIRED: 'APPROVAL_REQUIRED',
  APPROVAL_DECISION: 'APPROVAL_DECISION',
  APPROVAL_INVALIDATED: 'APPROVAL_INVALIDATED',
  NEGOTIATION_TICKET_RAISED: 'NEGOTIATION_TICKET_RAISED',
  NEGOTIATION_DECISION: 'NEGOTIATION_DECISION',
  BACKORDER_FULFILLED: 'BACKORDER_FULFILLED',
  QUOTE_SENT: 'QUOTE_SENT',
  QUOTE_CONFIRMED: 'QUOTE_CONFIRMED',
  DEPOSIT_RECEIVED: 'DEPOSIT_RECEIVED',
  DEPOSIT_REFUNDED: 'DEPOSIT_REFUNDED',
  SYSTEM_ALERT: 'SYSTEM_ALERT'
});

const SenderRole = Object.freeze({
  ADMIN: 'ADMIN',
  SALES_REP: 'SALES_REP',
  SALES_MANAGER: 'SALES_MANAGER',
  FINANCE_OPS: 'FINANCE_OPS',
  CUSTOMER: 'CUSTOMER'
});

const Defaults = Object.freeze({
  CURRENCY: 'INR',
  TAX_PCT: 18.00,
  DEPOSIT_PCT: 10.00,
  HOLD_DURATION_HOURS: 48,
  PAGE: 1,
  PAGE_SIZE: 20,
  PAYMENT_TERMS: 'Net-30',
  MIN_MARGIN_PCT: 20.00,
  SHIPPING_RATE_PER_KM: 0.15,
  BASE_SHIPPING_FLAT: 50.00
});

module.exports = {
  Role,
  RoleGroups,
  CustomerTier,
  ProductType,
  QuoteStatus,
  PoolType,
  ApprovalStage,
  ApprovalStatus,
  AllocationStatus,
  BackorderStatus,
  DepositStatus,
  InvoiceType,
  InvoiceStatus,
  PaymentStatus,
  SubscriptionStatus,
  BillingPeriod,
  ProrationType,
  DiscountTypeEnum,
  NegotiationTicketStatus,
  HoldStatus,
  NotificationType,
  SenderRole,
  Defaults
};
