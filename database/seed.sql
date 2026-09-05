-- ============================================================================
-- DealFlow360 — Seed Data for Development, Demo & Testing
-- ============================================================================

USE `dealflow360`;

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- 1. Customers
-- ----------------------------------------------------------------------------
INSERT INTO `customers` (`id`, `name`, `email`, `phone`, `address`, `location_lat`, `location_lng`, `tier`, `credit_limit`, `risk_score`, `payment_terms`, `order_count`, `is_active`) VALUES
('cust_01', 'Apex Global Technologies', 'procurement@apextech.com', '+1-555-0101', '100 Innovation Way, Austin, TX', 30.2672, -97.7431, 'PLATINUM', NULL, 15, 'Net-45', 18, 1),
('cust_02', 'Nexus HyperScale Ltd', 'procurement@nexushyperscale.com', '+1-555-0102', '200 Silicon Ave, San Jose, CA', 37.3382, -121.8863, 'GOLD', 150000.00, 35, 'Net-30', 8, 1),
('cust_03', 'Horizon FinTech Solutions', 'billing@horizonft.com', '+1-555-0103', '50 Wall Street, New York, NY', 40.7068, -74.0090, 'STANDARD', 50000.00, 45, 'Net-30', 3, 1),
('cust_04', 'Acme Cloud Dynamics', 'ops@acmeclouddyn.com', '+1-555-0104', '10 Tech Blvd, Chicago, IL', 41.8781, -87.6298, 'FREE', 10000.00, 60, 'Net-15', 1, 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ----------------------------------------------------------------------------
-- 2. Users (Canonical Uppercase Roles)
-- ----------------------------------------------------------------------------
INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`, `role_id`, `customer_id`, `is_active`) VALUES
('usr_rep_01', 'sarah.jenkins@dealflow360.internal', '$2b$10$wT8vIq59A08Dcl96Xz1bUe.j95c/v1zNeqN4uN5r2a5l7XF7N2d7C', 'Sarah Jenkins', 'SALES_REP', 'role_rep_01', NULL, 1),
('usr_mgr_01', 'david.keller@dealflow360.internal', '$2b$10$wT8vIq59A08Dcl96Xz1bUe.j95c/v1zNeqN4uN5r2a5l7XF7N2d7C', 'David Keller', 'SALES_MANAGER', 'role_mgr_01', NULL, 1),
('usr_fin_01', 'elena.rostova@dealflow360.internal', '$2b$10$wT8vIq59A08Dcl96Xz1bUe.j95c/v1zNeqN4uN5r2a5l7XF7N2d7C', 'Elena Rostova', 'FINANCE_OPS', 'role_fin_01', NULL, 1),
('usr_cust_01', 'procurement@apextech.com', '$2b$10$wT8vIq59A08Dcl96Xz1bUe.j95c/v1zNeqN4uN5r2a5l7XF7N2d7C', 'Marcus Vance (Apex)', 'CUSTOMER', 'role_cust_01', 'cust_01', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ----------------------------------------------------------------------------
-- 3. Products (Hardware, Software, Services)
-- ----------------------------------------------------------------------------
INSERT INTO `products` (`id`, `sku`, `name`, `description`, `category`, `product_type`, `list_price`, `cost`, `tax`, `product_discount_pct`, `min_margin`, `weight`, `is_recurring`, `is_upsell`, `is_active`) VALUES
('prd_srv_x1', 'SRV-X1', 'Enterprise Cloud Server X1', 'High performance enterprise compute node with dual Xeon processors', 'Hardware', 'HARDWARE', 12500.00, 7500.00, 18.00, 5.00, 25.00, 24.50, 0, 0, 1),
('prd_sw_48p', 'SW-48P', 'High-Density Switch 48-Port', 'Layer 3 48-Port 10GbE enterprise rackmount managed switch', 'Hardware', 'HARDWARE', 3200.00, 1800.00, 18.00, 0.00, 20.00, 8.20, 0, 0, 1),
('prd_saas_lic', 'SaaS-LIC', 'DealFlow Platform SaaS License', 'Per-user recurring enterprise license for DealFlow platform', 'Software', 'SOFTWARE', 450.00, 50.00, 18.00, 0.00, 60.00, NULL, 1, 0, 1),
('prd_sla_247', 'SLA-247', '24/7 Mission Critical Support SLA', 'Annual guaranteed SLA support with 15-minute response time', 'Services', 'SERVICE', 1200.00, 400.00, 18.00, 0.00, 40.00, NULL, 1, 0, 1),
('prd_opt_sfp', 'OPT-SFP', 'Optical Fiber SFP+ Transceiver Pack', '10GBASE-SR SFP+ 850nm 300m DOM LC MMF transceiver 4-pack', 'Accessory', 'HARDWARE', 480.00, 160.00, 18.00, 0.00, 30.00, 0.50, 0, 1, 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ----------------------------------------------------------------------------
-- 4. Product Variants
-- ----------------------------------------------------------------------------
INSERT INTO `product_variants` (`id`, `product_id`, `attribute`, `value`, `extra_price`, `variant_discount_pct`, `is_active`) VALUES
('var_srv_win', 'prd_srv_x1', 'OS', 'Windows Server 2022 Datacenter', 1200.00, 0.00, 1),
('var_srv_ubn', 'prd_srv_x1', 'OS', 'Ubuntu Linux LTS', 0.00, 0.00, 1),
('var_srv_leg', 'prd_srv_x1', 'OS', 'Legacy Spec / Baremetal Downgrade', -500.00, -4.00, 1)
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- ----------------------------------------------------------------------------
-- 5. Warehouses
-- ----------------------------------------------------------------------------
INSERT INTO `warehouses` (`id`, `code`, `name`, `region`, `location`, `location_lat`, `location_lng`, `shipping_cost_factor`, `is_active`) VALUES
('wh_east', 'US-EAST-NJ', 'East Coast Distribution (NJ)', 'East US', 'Edison, NJ', 40.5187, -74.4121, 1.20, 1),
('wh_west', 'US-WEST-CA', 'West Coast Logistics (CA)', 'West US', 'Fremont, CA', 37.5485, -121.9886, 1.50, 1),
('wh_central', 'US-MID-IL', 'Midwest Hub (IL)', 'Central US', 'Chicago, IL', 41.8781, -87.6298, 0.90, 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ----------------------------------------------------------------------------
-- 6. Inventories (Dual-Pool 50/50 Partition)
-- ----------------------------------------------------------------------------
INSERT INTO `inventories` (`id`, `warehouse_id`, `product_id`, `normal_pool_qty`, `premium_bulk_pool_qty`, `reserved_normal`, `reserved_premium`) VALUES
('inv_wh_east_srv', 'wh_east', 'prd_srv_x1', 50, 50, 2, 0),
('inv_wh_east_sw', 'wh_east', 'prd_sw_48p', 100, 100, 1, 0),
('inv_wh_east_opt', 'wh_east', 'prd_opt_sfp', 200, 200, 0, 0),
('inv_wh_west_srv', 'wh_west', 'prd_srv_x1', 40, 40, 0, 0),
('inv_wh_west_sw', 'wh_west', 'prd_sw_48p', 80, 80, 0, 0),
('inv_wh_mid_srv', 'wh_central', 'prd_srv_x1', 60, 60, 0, 0),
('inv_wh_mid_sw', 'wh_central', 'prd_sw_48p', 120, 120, 0, 0)
ON DUPLICATE KEY UPDATE `normal_pool_qty` = VALUES(`normal_pool_qty`);

-- ----------------------------------------------------------------------------
-- 7. Upsell Rules
-- ----------------------------------------------------------------------------
INSERT INTO `upsell_rules` (`id`, `source_product_id`, `suggested_product_id`, `reason`, `min_margin_pct`, `is_promotion`, `is_active`) VALUES
('ups_01', 'prd_srv_x1', 'prd_opt_sfp', 'Commonly ordered together for high-throughput connectivity', 25.00, 1, 1),
('ups_02', 'prd_srv_x1', 'prd_sla_247', 'Recommend 24/7 mission-critical SLA for hardware servers', 35.00, 0, 1)
ON DUPLICATE KEY UPDATE `reason` = VALUES(`reason`);

-- ----------------------------------------------------------------------------
-- 8. Mathematically Consistent Quotation & Line Items
-- ----------------------------------------------------------------------------
-- Calculations:
-- Line 1 (prd_srv_x1, qty 2): List = 25,000.00 | Disc (12%) = 3,000.00 | Net = 22,000.00 | Tax (18%) = 3,960.00 | COGS = 15,000.00 | Margin = 31.82%
-- Line 2 (prd_sw_48p, qty 1): List = 3,200.00  | Disc (7%)  = 224.00   | Net = 2,976.00  | Tax (18%) = 535.68   | COGS = 1,800.00  | Margin = 39.52%
-- Header:
-- Subtotal = 28,200.00 | Discount = 3,224.00 | Tax = 4,495.68 | Net (pre-tax) = 24,976.00 | Confirmed Total = 29,471.68 | COGS = 16,800.00 | Margin = 32.73%
-- Flags: has_hardware_lines = 1, has_software_lines = 0
INSERT INTO `quotations` (
  `id`, `quotation_number`, `quote_revision`, `customer_id`, `rep_id`, `status`, `currency`, 
  `subtotal`, `discount_total`, `tax_total`, `estimated_net_total`, `confirmed_net_total`, 
  `cogs`, `margin_pct`, `blended_risk_score`, `approval_level`, `requires_approval`, 
  `has_hardware_lines`, `has_software_lines`, `valid_until`
) VALUES (
  'q_demo_01', 'Q-2026-0001', 1, 'cust_01', 'usr_rep_01', 'APPROVED', 'INR',
  28200.00, 3224.00, 4495.68, 29471.68, 29471.68,
  16800.00, 32.73, 0.00, 1, 0,
  1, 0, DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY)
)
ON DUPLICATE KEY UPDATE `quotation_number` = VALUES(`quotation_number`);

INSERT INTO `quotation_items` (
  `id`, `quotation_id`, `product_id`, `variant_id`, `quantity`, 
  `unit_price`, `unit_list_price`, `unit_cost_price`, 
  `product_discount_pct`, `bulk_discount_pct`, `consistency_discount_pct`, `premium_discount_pct`, `variant_discount_pct`, 
  `cumulative_discount_pct`, `ceiling_pct`, `is_over_limit`, `over_limit_pct`, 
  `pool_assignment`, `is_recurring`, `subscription_plan_id`, 
  `line_total`, `net_total`, `margin_pct`
) VALUES
('qi_01', 'q_demo_01', 'prd_srv_x1', 'var_srv_win', 2, 12500.00, 12500.00, 7500.00, 5.00, 0.00, 2.00, 5.00, 0.00, 12.00, 25.00, 0, 0.00, 'NORMAL', 0, NULL, 25000.00, 22000.00, 31.82),
('qi_02', 'q_demo_01', 'prd_sw_48p', NULL, 1, 3200.00, 3200.00, 1800.00, 0.00, 0.00, 2.00, 5.00, 0.00, 7.00, 25.00, 0, 0.00, 'NORMAL', 0, NULL, 3200.00, 2976.00, 39.52)
ON DUPLICATE KEY UPDATE `line_total` = VALUES(`line_total`);

-- ----------------------------------------------------------------------------
-- 9. Approvals (Tied to Revision 1)
-- ----------------------------------------------------------------------------
INSERT INTO `approvals` (`id`, `quotation_id`, `quote_revision`, `stage`, `level`, `approver_id`, `status`, `comments`, `decided_at`) VALUES
('apr_01', 'q_demo_01', 1, 'SALES_MANAGER', 2, 'usr_mgr_01', 'APPROVED', 'Standard discount structure for Platinum account verified.', CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- ----------------------------------------------------------------------------
-- 10. Invoices & Invoice Line Items
-- ----------------------------------------------------------------------------
INSERT INTO `invoices` (
  `id`, `invoice_number`, `quotation_id`, `customer_id`, `type`, 
  `amount`, `deposit_deducted`, `amount_due`, `one_time_total`, `recurring_total`, 
  `status`, `due_date`, `issued_at`
) VALUES (
  'inv_demo_01', 'INV-2026-0001', 'q_demo_01', 'cust_01', 'ONE_TIME',
  29471.68, 0.00, 29471.68, 29471.68, 0.00,
  'SENT', DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY), CURRENT_TIMESTAMP
)
ON DUPLICATE KEY UPDATE `invoice_number` = VALUES(`invoice_number`);

INSERT INTO `invoice_items` (`id`, `invoice_id`, `quotation_item_id`, `product_id`, `subscription_id`, `description`, `quantity`, `unit_price`, `discount_amount`, `tax_amount`, `line_total`) VALUES
('ii_01', 'inv_demo_01', 'qi_01', 'prd_srv_x1', NULL, 'Enterprise Cloud Server X1 (Qty: 2)', 2, 12500.00, 3000.00, 3960.00, 25960.00),
('ii_02', 'inv_demo_01', 'qi_02', 'prd_sw_48p', NULL, 'High-Density Switch 48-Port (Qty: 1)', 1, 3200.00, 224.00, 535.68, 3511.68)
ON DUPLICATE KEY UPDATE `line_total` = VALUES(`line_total`);

-- ----------------------------------------------------------------------------
-- 11. Allocations & Product Holds (Atomic Pairing)
-- ----------------------------------------------------------------------------
INSERT INTO `allocations` (`id`, `quotation_id`, `warehouse_id`, `product_id`, `quantity`, `pool_type`, `distance_km`, `shipping_cost`, `status`) VALUES
('alc_01', 'q_demo_01', 'wh_east', 'prd_srv_x1', 2, 'NORMAL', 250.00, 150.00, 'ALLOCATED'),
('alc_02', 'q_demo_01', 'wh_east', 'prd_sw_48p', 1, 'NORMAL', 250.00, 45.00, 'ALLOCATED')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- ----------------------------------------------------------------------------
-- 12. Audit Logs & Notifications
-- ----------------------------------------------------------------------------
INSERT INTO `audit_logs` (`id`, `quotation_id`, `entity_type`, `entity_id`, `action`, `performed_by_id`, `performed_by_name`, `performed_by_role`, `description`, `reason`) VALUES
('aud_01', 'q_demo_01', 'QUOTATION', 'q_demo_01', 'CREATED', 'usr_rep_01', 'Sarah Jenkins', 'SALES_REP', 'Quotation Q-2026-0001 (Rev 1) created for Apex Global Technologies', 'Initial deal creation'),
('aud_02', 'q_demo_01', 'APPROVAL', 'apr_01', 'APPROVED', 'usr_mgr_01', 'David Keller', 'SALES_MANAGER', 'Manager approval granted for Rev 1', 'Within policy limit')
ON DUPLICATE KEY UPDATE `action` = VALUES(`action`);

INSERT INTO `notifications` (`id`, `user_id`, `type`, `message`, `related_quote_id`, `is_read`) VALUES
('notif_01', 'usr_rep_01', 'APPROVAL_DECISION', 'Quotation Q-2026-0001 has been approved by David Keller', 'q_demo_01', 0)
ON DUPLICATE KEY UPDATE `message` = VALUES(`message`);

SET FOREIGN_KEY_CHECKS = 1;
