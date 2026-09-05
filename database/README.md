# DealFlow360 Database Architecture (MySQL)

Enterprise SaaS-grade relational database for **DealFlow360 (Quote-to-Cash Lifecycle Platform)**.

---

## 📁 Directory Structure

```text
database/
├── schema.sql    # Complete SaaS-grade DDL: 23 Tables, Constraints, Indexes & Views
├── seed.sql      # Realistic baseline data (Admin, Reps, Customers, Products, Warehouses, Invoices)
└── README.md     # Setup, ERD summary & concurrency governance guide
```

---

## 🏗 Schema Architecture Overview

| Domain | Tables | Description |
|---|---|---|
| **Identity & Access** | `users`, `customers` | Canonical roles (`ADMIN`, `SALES_REP`, `SALES_MANAGER`, `FINANCE_OPS`, `CUSTOMER`), tiers & credit limits |
| **Product & Pricing** | `products`, `product_variants`, `price_lists`, `price_list_rules` | Product types (`HARDWARE`, `SOFTWARE`, `SERVICE`), spec variants, price matrices |
| **Discount Governance** | `discount_policies`, `discount_type_rules`, `approval_chain_rules` | 5-tier stacking discount limits & Level 1 / Level 2 / Level 3 automated approval routing |
| **Warehouses & Pools** | `warehouses`, `inventories`, `region_demand_records` | Multi-warehouse stock tracking, 50/50 normal vs premium/bulk pool split with row-locking support |
| **Deal Engine** | `quotations`, `quotation_items`, `deposit_records` | Quote revision tracking (`quote_revision`), live margin %, line-level discount breakdown, refundable deposits |
| **Approvals** | `approvals` | Revision-tied approvals (`quote_revision`, `stage`), status lifecycle with `INVALIDATED` support |
| **Fulfillment** | `allocations`, `backorders` | Cost & distance optimized warehouse splits, automated backorder queues |
| **Hybrid Billing** | `invoices`, `invoice_items`, `subscriptions`, `payments` | Itemized invoice breakdown, license subscriptions with unit price snapshot & payment status |
| **Customer Portal** | `negotiation_tickets`, `product_holds`, `line_comments`, `negotiations` | Interactive customer negotiation, 48h inventory holds, comment threads |
| **Audit & Alerts** | `audit_logs`, `notifications` | Immutable change tracking with before/after state diffs & user alerts |
| **Analytics Views** | `vw_quotation_details`, `vw_inventory_pool_status`, `vw_deal_health_kpis` | Real-time KPI queries for manager and deal health dashboards |

---

## ⚡ Concurrency & Invalidation Governance

### 1. Atomic Inventory Reservations
To prevent race conditions during concurrent customer checkout or hold creation:
```sql
-- Transactional Hold Creation
START TRANSACTION;

SELECT id, normal_pool_qty, reserved_normal 
FROM inventories 
WHERE warehouse_id = 'wh_east' AND product_id = 'prd_srv_x1' 
FOR UPDATE;

-- Application checks: (normal_pool_qty - reserved_normal) >= requested_qty

UPDATE inventories 
SET reserved_normal = reserved_normal + 2 
WHERE warehouse_id = 'wh_east' AND product_id = 'prd_srv_x1';

INSERT INTO product_holds (id, ticket_id, product_id, warehouse_id, pool_type, quantity_held, status, expires_at)
VALUES ('hold_01', 'ticket_01', 'prd_srv_x1', 'wh_east', 'NORMAL', 2, 'ACTIVE', DATE_ADD(NOW(), INTERVAL 48 HOUR));

COMMIT;
```

### 2. Approval Invalidation Workflow
Whenever a quotation is modified or negotiated after receiving approval:
1. Increment `quotations.quote_revision = quote_revision + 1`.
2. Update existing approvals: `UPDATE approvals SET status = 'INVALIDATED' WHERE quotation_id = ? AND quote_revision < ?`.
3. Re-evaluate blended risk score and insert fresh `PENDING` approval record for the new `quote_revision`.

---

## 🚀 Execution & Import

To initialize the database locally:

```bash
# 1. Run the DDL Schema
mysql -u root -p < database/schema.sql

# 2. Run the Seed Data
mysql -u root -p < database/seed.sql
```
