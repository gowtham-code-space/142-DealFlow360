-- ============================================================================
-- DealFlow360 — SaaS-Grade Enterprise MySQL Database Schema
-- Architecture: Quote-to-Cash (Q2C) Deal Engine & Sales Operations Platform
-- Storage Engine: InnoDB (ACID Compliant, Row-Level Locking, High Concurrency)
-- Character Set: utf8mb4 / Collation: utf8mb4_unicode_ci
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `dealflow360` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `dealflow360`;

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- 1. CLEANUP / DROP TABLES (Reverse Dependency Order)
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS `vw_deal_health_kpis`;
DROP VIEW IF EXISTS `vw_inventory_pool_status`;
DROP VIEW IF EXISTS `vw_quotation_details`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `line_comments`;
DROP TABLE IF EXISTS `negotiations`;
DROP TABLE IF EXISTS `product_holds`;
DROP TABLE IF EXISTS `negotiation_tickets`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `invoice_items`;
DROP TABLE IF EXISTS `invoices`;
DROP TABLE IF EXISTS `subscriptions`;
DROP TABLE IF EXISTS `backorders`;
DROP TABLE IF EXISTS `allocations`;
DROP TABLE IF EXISTS `approvals`;
DROP TABLE IF EXISTS `deposit_records`;
DROP TABLE IF EXISTS `quotation_items`;
DROP TABLE IF EXISTS `quotations`;
DROP TABLE IF EXISTS `region_demand_records`;
DROP TABLE IF EXISTS `inventories`;
DROP TABLE IF EXISTS `warehouses`;
DROP TABLE IF EXISTS `upsell_rules`;
DROP TABLE IF EXISTS `subscription_plans`;
DROP TABLE IF EXISTS `pool_configs`;
DROP TABLE IF EXISTS `approval_chain_rules`;
DROP TABLE IF EXISTS `discount_type_rules`;
DROP TABLE IF EXISTS `discount_policies`;
DROP TABLE IF EXISTS `price_list_rules`;
DROP TABLE IF EXISTS `price_lists`;
DROP TABLE IF EXISTS `product_variants`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `roles`;
DROP TABLE IF EXISTS `customers`;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 2. CORE IDENTITY & CUSTOMER ENTITIES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: roles
-- Description: System & RBAC permission roles
-- ----------------------------------------------------------------------------
CREATE TABLE `roles` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: customers
-- Description: B2B Accounts, tiers, credit metrics, and subscription terms
-- ----------------------------------------------------------------------------
CREATE TABLE `customers` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `location_lat` DECIMAL(10, 7) DEFAULT NULL,
  `location_lng` DECIMAL(10, 7) DEFAULT NULL,
  `tier` ENUM('FREE', 'STANDARD', 'PREMIUM', 'GOLD', 'PLATINUM') NOT NULL DEFAULT 'STANDARD',
  `credit_limit` DECIMAL(12, 2) DEFAULT NULL COMMENT 'NULL for premium accounts without credit restrictions',
  `risk_score` INT NOT NULL DEFAULT 20 COMMENT 'Baseline customer risk assessment (0-100)',
  `payment_terms` VARCHAR(50) NOT NULL DEFAULT 'Net-30',
  `subscription_duration_days` INT DEFAULT NULL COMMENT 'Active premium duration in days',
  `subscription_expires_at` DATETIME DEFAULT NULL,
  `order_count` INT NOT NULL DEFAULT 0 COMMENT 'Total historical confirmed orders for consistency discounts',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_customers_email` (`email`),
  KEY `idx_customers_tier` (`tier`),
  KEY `idx_customers_is_active` (`is_active`),
  KEY `idx_customers_order_count` (`order_count`),
  KEY `idx_customers_created_at` (`created_at`),
  CONSTRAINT `chk_customers_risk_score` CHECK (`risk_score` BETWEEN 0 AND 100),
  CONSTRAINT `chk_customers_credit_limit` CHECK (`credit_limit` IS NULL OR `credit_limit` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: users
-- Description: Canonical role representation across Internal Staff & Customer Portal
-- ----------------------------------------------------------------------------
-- Table: users
-- Description: Canonical role representation linked to roles table
-- ----------------------------------------------------------------------------
CREATE TABLE `users` (
  `id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL COMMENT 'Argon2 / BCrypt hashed credentials',
  `name` VARCHAR(255) NOT NULL,
  `role_id` VARCHAR(50) NOT NULL DEFAULT 'SALES_REP',
  `customer_id` VARCHAR(36) DEFAULT NULL COMMENT 'Set for customer portal users; NULL for internal staff',
  `refresh_token_hash` VARCHAR(255) DEFAULT NULL COMMENT 'Hashed active refresh token for rotation & revocation',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `idx_users_role_id` (`role_id`),
  KEY `idx_users_customer_id` (`customer_id`),
  KEY `idx_users_is_active` (`is_active`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_users_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- 3. PRODUCT CATALOG, PRICING & VARIANTS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: products
-- Description: Hardware (physical stock), Software (licenses), Services (SLAs/Consulting)
-- ----------------------------------------------------------------------------
CREATE TABLE `products` (
  `id` VARCHAR(36) NOT NULL,
  `sku` VARCHAR(100) DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `category` VARCHAR(100) NOT NULL COMMENT 'e.g. Hardware, Software, Services, Infrastructure',
  `product_type` ENUM('HARDWARE', 'SOFTWARE', 'SERVICE') NOT NULL DEFAULT 'HARDWARE',
  `list_price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `cost` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'Internal COGS - hidden from customer portal',
  `tax` DECIMAL(5, 2) NOT NULL DEFAULT 18.00 COMMENT 'Tax percentage',
  `product_discount_pct` DECIMAL(5, 2) NOT NULL DEFAULT 0.00 COMMENT 'Inherent baseline product discount %',
  `min_margin` DECIMAL(5, 2) NOT NULL DEFAULT 20.00 COMMENT 'Minimum healthy margin threshold %',
  `weight` DECIMAL(10, 2) DEFAULT NULL COMMENT 'Physical weight in kg (for hardware freight calculation)',
  `is_recurring` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Software/Service recurring subscription flag',
  `is_upsell` TINYINT(1) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_products_sku` (`sku`),
  KEY `idx_products_category` (`category`),
  KEY `idx_products_type` (`product_type`),
  KEY `idx_products_is_recurring` (`is_recurring`),
  KEY `idx_products_is_active` (`is_active`),
  KEY `idx_products_list_price` (`list_price`),
  CONSTRAINT `chk_products_list_price` CHECK (`list_price` >= 0),
  CONSTRAINT `chk_products_cost` CHECK (`cost` >= 0),
  CONSTRAINT `chk_products_tax` CHECK (`tax` >= 0),
  CONSTRAINT `chk_products_product_discount` CHECK (`product_discount_pct` BETWEEN 0 AND 100),
  CONSTRAINT `chk_products_min_margin` CHECK (`min_margin` BETWEEN -100 AND 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: product_variants
-- Description: Attributes/options with price increments or downgrade discounts
-- ----------------------------------------------------------------------------
CREATE TABLE `product_variants` (
  `id` VARCHAR(36) NOT NULL,
  `product_id` VARCHAR(36) NOT NULL,
  `attribute` VARCHAR(100) NOT NULL COMMENT 'e.g. OS, Storage, RAM, Form Factor',
  `value` VARCHAR(100) NOT NULL COMMENT 'e.g. Windows Server, Ubuntu LTS, 64GB DDR5',
  `extra_price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'Negative for spec downgrade',
  `variant_discount_pct` DECIMAL(5, 2) NOT NULL DEFAULT 0.00 COMMENT 'Negative for spec downgrade discount',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_variants_product_id` (`product_id`),
  KEY `idx_variants_attribute` (`attribute`),
  CONSTRAINT `fk_variants_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: price_lists
-- Description: Custom tier-specific and currency-specific price list matrices
-- ----------------------------------------------------------------------------
CREATE TABLE `price_lists` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `tier` VARCHAR(50) NOT NULL DEFAULT 'STANDARD',
  `currency` VARCHAR(10) NOT NULL DEFAULT 'INR',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_price_lists_tier` (`tier`),
  KEY `idx_price_lists_currency` (`currency`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: price_list_rules
-- Description: Product price overrides linked to specific price lists
-- ----------------------------------------------------------------------------
CREATE TABLE `price_list_rules` (
  `id` VARCHAR(36) NOT NULL,
  `price_list_id` VARCHAR(36) NOT NULL,
  `product_id` VARCHAR(36) NOT NULL,
  `price` DECIMAL(12, 2) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_price_list_product` (`price_list_id`, `product_id`),
  KEY `idx_price_rules_product` (`product_id`),
  CONSTRAINT `chk_price_list_rule_price` CHECK (`price` >= 0),
  CONSTRAINT `fk_price_rules_list` FOREIGN KEY (`price_list_id`) REFERENCES `price_lists` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_price_rules_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. GOVERNANCE, SUBSCRIPTION PLANS & RECOMMENDATIONS CONFIGURATION
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: discount_policies
-- Description: Category & Tier based discount ceilings for governance engine
-- ----------------------------------------------------------------------------
CREATE TABLE `discount_policies` (
  `id` VARCHAR(36) NOT NULL,
  `customer_tier` VARCHAR(50) NOT NULL COMMENT 'FREE, STANDARD, PREMIUM, GOLD, PLATINUM',
  `product_category` VARCHAR(100) NOT NULL,
  `max_discount_pct` DECIMAL(5, 2) NOT NULL COMMENT 'Ceiling % before triggering approval routing',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_discount_policy_tier_category` (`customer_tier`, `product_category`),
  KEY `idx_discount_policies_tier` (`customer_tier`),
  KEY `idx_discount_policies_category` (`product_category`),
  CONSTRAINT `chk_discount_policies_max_pct` CHECK (`max_discount_pct` BETWEEN 0 AND 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: discount_type_rules
-- Description: Config rules for 5-tier stacking discount calculations
-- ----------------------------------------------------------------------------
CREATE TABLE `discount_type_rules` (
  `id` VARCHAR(36) NOT NULL,
  `type` ENUM('BULK', 'CONSISTENCY', 'PREMIUM', 'VARIANT') NOT NULL,
  `bulk_threshold_qty` INT DEFAULT NULL,
  `bulk_discount_pct` DECIMAL(5, 2) DEFAULT NULL,
  `consistency_order_count` INT DEFAULT NULL,
  `consistency_discount_pct` DECIMAL(5, 2) DEFAULT NULL,
  `premium_discount_pct` DECIMAL(5, 2) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_discount_type_rules_type` (`type`),
  KEY `idx_discount_type_rules_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: approval_chain_rules
-- Description: Threshold limits determining Level 1 (Sales Rep) vs Level 2 (Sales Manager) vs Level 3 (Finance Ops)
-- ----------------------------------------------------------------------------
CREATE TABLE `approval_chain_rules` (
  `id` VARCHAR(36) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `sales_rep_only_max_over_ceiling_pct` DECIMAL(5, 2) NOT NULL DEFAULT 5.00 COMMENT '<= threshold: Level 1 only. > threshold: Level 2 Manager',
  `finance_threshold_over_ceiling_pct` DECIMAL(5, 2) NOT NULL DEFAULT 15.00 COMMENT '> threshold: Requires Level 3 Finance Ops approval',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: pool_configs
-- Description: System inventory split parameters (Normal vs Premium/Bulk) & deposit %
-- ----------------------------------------------------------------------------
CREATE TABLE `pool_configs` (
  `id` VARCHAR(36) NOT NULL,
  `normal_pool_pct` DECIMAL(5, 2) NOT NULL DEFAULT 50.00,
  `premium_bulk_pool_pct` DECIMAL(5, 2) NOT NULL DEFAULT 50.00,
  `deposit_pct` DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
  `hold_duration_hours` INT NOT NULL DEFAULT 48 COMMENT 'Negotiation ticket inventory lock window',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_pool_configs_pct` CHECK ((`normal_pool_pct` + `premium_bulk_pool_pct`) = 100.00)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: subscription_plans
-- Description: SaaS recurring billing packages with proration models
-- ----------------------------------------------------------------------------
CREATE TABLE `subscription_plans` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `billing_period` ENUM('MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL DEFAULT 'MONTHLY',
  `proration_type` ENUM('DAILY', 'NONE') NOT NULL DEFAULT 'DAILY',
  `price` DECIMAL(12, 2) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sub_plans_billing_period` (`billing_period`),
  KEY `idx_sub_plans_is_active` (`is_active`),
  CONSTRAINT `chk_sub_plans_price` CHECK (`price` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: upsell_rules
-- Description: Real-time upsell/cross-sell suggestions with margin filters
-- ----------------------------------------------------------------------------
CREATE TABLE `upsell_rules` (
  `id` VARCHAR(36) NOT NULL,
  `source_product_id` VARCHAR(36) NOT NULL,
  `suggested_product_id` VARCHAR(36) NOT NULL,
  `reason` VARCHAR(255) NOT NULL,
  `min_margin_pct` DECIMAL(5, 2) NOT NULL DEFAULT 20.00,
  `is_promotion` TINYINT(1) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_upsell_source_product` (`source_product_id`),
  KEY `idx_upsell_suggested_product` (`suggested_product_id`),
  KEY `idx_upsell_is_promotion` (`is_promotion`),
  CONSTRAINT `fk_upsell_source` FOREIGN KEY (`source_product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_upsell_suggested` FOREIGN KEY (`suggested_product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. WAREHOUSES & DUAL-POOL INVENTORY CONCURRENCY ENGINE
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: warehouses
-- Description: Multi-region fulfillment hubs with geospatial coordinates & freight factor
-- ----------------------------------------------------------------------------
CREATE TABLE `warehouses` (
  `id` VARCHAR(36) NOT NULL,
  `code` VARCHAR(50) DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `region` VARCHAR(100) NOT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  `location_lat` DECIMAL(10, 7) NOT NULL,
  `location_lng` DECIMAL(10, 7) NOT NULL,
  `shipping_cost_factor` DECIMAL(4, 2) NOT NULL DEFAULT 1.00,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_warehouses_code` (`code`),
  KEY `idx_warehouses_region` (`region`),
  KEY `idx_warehouses_is_active` (`is_active`),
  CONSTRAINT `chk_warehouses_shipping_factor` CHECK (`shipping_cost_factor` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: inventories
-- Description: Real-time stock partitioned into Normal and Premium/Bulk pools.
-- Supports transactional row locking (SELECT ... FOR UPDATE) for atomic reservations.
-- ----------------------------------------------------------------------------
CREATE TABLE `inventories` (
  `id` VARCHAR(36) NOT NULL,
  `warehouse_id` VARCHAR(36) NOT NULL,
  `product_id` VARCHAR(36) NOT NULL,
  `normal_pool_qty` INT UNSIGNED NOT NULL DEFAULT 0,
  `premium_bulk_pool_qty` INT UNSIGNED NOT NULL DEFAULT 0,
  `reserved_normal` INT UNSIGNED NOT NULL DEFAULT 0,
  `reserved_premium` INT UNSIGNED NOT NULL DEFAULT 0,
  -- Stored generated columns for fast, consistent availability queries
  `available_normal` INT GENERATED ALWAYS AS (GREATEST(0, CAST(`normal_pool_qty` AS SIGNED) - CAST(`reserved_normal` AS SIGNED))) STORED,
  `available_premium_bulk` INT GENERATED ALWAYS AS (GREATEST(0, CAST(`premium_bulk_pool_qty` AS SIGNED) - CAST(`reserved_premium` AS SIGNED))) STORED,
  `quantity_available` INT GENERATED ALWAYS AS (GREATEST(0, (CAST(`normal_pool_qty` AS SIGNED) + CAST(`premium_bulk_pool_qty` AS SIGNED)) - (CAST(`reserved_normal` AS SIGNED) + CAST(`reserved_premium` AS SIGNED)))) STORED,
  `quantity_reserved` INT GENERATED ALWAYS AS (`reserved_normal` + `reserved_premium`) STORED,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_inventory_warehouse_product` (`warehouse_id`, `product_id`),
  KEY `idx_inventory_product` (`product_id`),
  KEY `idx_inventory_available` (`quantity_available`),
  KEY `idx_inventory_normal_avail` (`available_normal`),
  KEY `idx_inventory_prem_avail` (`available_premium_bulk`),
  CONSTRAINT `chk_inventory_reserved_normal` CHECK (`reserved_normal` <= `normal_pool_qty`),
  CONSTRAINT `chk_inventory_reserved_premium` CHECK (`reserved_premium` <= `premium_bulk_pool_qty`),
  CONSTRAINT `fk_inventory_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_inventory_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: region_demand_records
-- Description: Historical and forecast regional demand for smart inventory routing
-- ----------------------------------------------------------------------------
CREATE TABLE `region_demand_records` (
  `id` VARCHAR(36) NOT NULL,
  `region` VARCHAR(100) NOT NULL,
  `product_id` VARCHAR(36) NOT NULL,
  `demand_count` INT NOT NULL DEFAULT 0,
  `period_start` DATE NOT NULL,
  `period_end` DATE NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_region_demand_lookup` (`region`, `product_id`, `period_start`, `period_end`),
  CONSTRAINT `fk_region_demand_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. QUOTATIONS & LINE ITEMS (THE CORE DEAL ENGINE)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: quotations
-- Description: Complete deal lifecycle, quote revision tracking, margin & risk scoring
-- ----------------------------------------------------------------------------
CREATE TABLE `quotations` (
  `id` VARCHAR(36) NOT NULL,
  `quotation_number` VARCHAR(100) NOT NULL,
  `quote_revision` INT NOT NULL DEFAULT 1 COMMENT 'Incremented on quote edit or negotiation to invalidate stale approvals',
  `customer_id` VARCHAR(36) NOT NULL,
  `rep_id` VARCHAR(36) NOT NULL,
  `status` ENUM(
    'DRAFT', 
    'SALES_REP_REVIEW', 
    'MANAGER_REVIEW', 
    'FINANCE_REVIEW',
    'PENDING_APPROVAL', 
    'RETURNED', 
    'APPROVED', 
    'SENT_TO_CUSTOMER', 
    'UNDER_NEGOTIATION', 
    'CUSTOMER_NEGOTIATION', 
    'CUSTOMER_ACCEPTED', 
    'CONFIRMED', 
    'FULFILLING', 
    'PARTIALLY_FULFILLED', 
    'FULFILLED', 
    'BILLED', 
    'INVOICED', 
    'PAID', 
    'CANCELLED', 
    'REJECTED'
  ) NOT NULL DEFAULT 'DRAFT',
  `currency` VARCHAR(10) NOT NULL DEFAULT 'INR',
  
  -- Financial Lifecycle Amounts (Explicitly Disambiguated)
  `subtotal` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'Sum of item undiscounted list prices * quantities',
  `discount_total` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'Total monetary discount deducted across all lines',
  `tax_total` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'Calculated tax amount',
  `estimated_net_total` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'Pre-approval tentative total (subtotal - discount_total + tax_total)',
  `confirmed_net_total` DECIMAL(12, 2) DEFAULT NULL COMMENT 'Final locked total post-approval and customer confirmation',
  `cogs` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'Total Cost of Goods Sold',
  `margin_pct` DECIMAL(5, 2) NOT NULL DEFAULT 0.00 COMMENT 'Gross Margin % = ((Pre-tax Net Total - COGS) / Pre-tax Net Total) * 100',
  `blended_risk_score` DECIMAL(5, 2) NOT NULL DEFAULT 0.00 COMMENT 'Aggregated discount over-ceiling risk score across all lines',
  
  -- Governance & Routing
  `approval_level` INT DEFAULT NULL COMMENT '1 = Sales Rep; 2 = Sales Manager; 3 = Finance Ops',
  `requires_approval` TINYINT(1) NOT NULL DEFAULT 0,
  `approval_reason` TEXT DEFAULT NULL,
  
  -- Product Composition Flags (Maintained by Backend on Line Item Changes)
  `has_hardware_lines` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'True if quotation contains >= 1 hardware item',
  `has_software_lines` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'True if quotation contains >= 1 software/service item',
  
  `notes` TEXT DEFAULT NULL,
  `valid_until` DATE DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_quotations_number` (`quotation_number`),
  KEY `idx_quotations_customer_status` (`customer_id`, `status`),
  KEY `idx_quotations_rep_status` (`rep_id`, `status`),
  KEY `idx_quotations_status_risk` (`status`, `blended_risk_score`),
  KEY `idx_quotations_created_status` (`created_at`, `status`),
  KEY `idx_quotations_valid_until` (`valid_until`),
  CONSTRAINT `chk_quotations_margin_pct` CHECK (`margin_pct` BETWEEN -100.00 AND 100.00),
  CONSTRAINT `chk_quotations_risk_score` CHECK (`blended_risk_score` >= 0),
  CONSTRAINT `fk_quotations_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_quotations_rep` FOREIGN KEY (`rep_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: quotation_items
-- Description: Individual quote line items with 5-tier discount calculation breakdown
-- ----------------------------------------------------------------------------
CREATE TABLE `quotation_items` (
  `id` VARCHAR(36) NOT NULL,
  `quotation_id` VARCHAR(36) NOT NULL,
  `product_id` VARCHAR(36) NOT NULL,
  `variant_id` VARCHAR(36) DEFAULT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'Effective base list price per unit',
  `unit_list_price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'Original catalog list price',
  `unit_cost_price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'COGS per unit',
  
  -- 5-Tier Stacking Discount Breakdown
  `product_discount_pct` DECIMAL(5, 2) NOT NULL DEFAULT 0.00 COMMENT 'Tier 1: Inherent product discount %',
  `bulk_discount_pct` DECIMAL(5, 2) NOT NULL DEFAULT 0.00 COMMENT 'Tier 2: Bulk volume tier discount %',
  `consistency_discount_pct` DECIMAL(5, 2) NOT NULL DEFAULT 0.00 COMMENT 'Tier 3: Customer loyalty/order count discount %',
  `premium_discount_pct` DECIMAL(5, 2) NOT NULL DEFAULT 0.00 COMMENT 'Tier 4: Customer account tier discount %',
  `variant_discount_pct` DECIMAL(5, 2) NOT NULL DEFAULT 0.00 COMMENT 'Tier 5: Variant adjustment discount %',
  `cumulative_discount_pct` DECIMAL(5, 2) NOT NULL DEFAULT 0.00 COMMENT 'Sum of applicable stacking discounts %',
  `ceiling_pct` DECIMAL(5, 2) NOT NULL DEFAULT 0.00 COMMENT 'Governing discount policy ceiling for tier + category',
  `is_over_limit` TINYINT(1) NOT NULL DEFAULT 0,
  `over_limit_pct` DECIMAL(5, 2) NOT NULL DEFAULT 0.00 COMMENT 'Excess above allowed ceiling %',
  
  `pool_assignment` ENUM('NORMAL', 'PREMIUM_BULK') NOT NULL DEFAULT 'NORMAL',
  `is_recurring` TINYINT(1) NOT NULL DEFAULT 0,
  `subscription_plan_id` VARCHAR(36) DEFAULT NULL,
  `line_total` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'Line list subtotal before discounts (unit_price * qty)',
  `net_total` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'Line total after discount (before tax)',
  `margin_pct` DECIMAL(5, 2) NOT NULL DEFAULT 0.00 COMMENT 'Line gross margin %',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_quote_items_quotation` (`quotation_id`),
  KEY `idx_quote_items_product` (`product_id`),
  KEY `idx_quote_items_variant` (`variant_id`),
  KEY `idx_quote_items_plan` (`subscription_plan_id`),
  KEY `idx_quote_items_pool` (`pool_assignment`),
  CONSTRAINT `chk_quote_items_qty` CHECK (`quantity` >= 1),
  CONSTRAINT `fk_quote_items_quotation` FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_quote_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_quote_items_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_quote_items_plan` FOREIGN KEY (`subscription_plan_id`) REFERENCES `subscription_plans` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: deposit_records
-- Description: Refundable upfront deposits collected for premium/bulk pool deals
-- ----------------------------------------------------------------------------
CREATE TABLE `deposit_records` (
  `id` VARCHAR(36) NOT NULL,
  `quotation_id` VARCHAR(36) NOT NULL,
  `customer_id` VARCHAR(36) NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `deposit_pct` DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
  `status` ENUM('PENDING', 'PAID', 'REFUNDED', 'DEDUCTED_FROM_INVOICE') NOT NULL DEFAULT 'PENDING',
  `method` VARCHAR(50) DEFAULT NULL,
  `paid_at` DATETIME DEFAULT NULL,
  `refunded_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_deposits_quotation` (`quotation_id`),
  KEY `idx_deposits_customer` (`customer_id`),
  KEY `idx_deposits_status` (`status`),
  CONSTRAINT `chk_deposits_amount` CHECK (`amount` >= 0),
  CONSTRAINT `fk_deposits_quotation` FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_deposits_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. APPROVALS WORKFLOW & REVISION INVALIDATION
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: approvals
-- Description: Multi-stage discount approvals tied to specific quote revisions.
-- If quote is revised or negotiated, previous approvals are marked 'INVALIDATED'.
-- ----------------------------------------------------------------------------
CREATE TABLE `approvals` (
  `id` VARCHAR(36) NOT NULL,
  `quotation_id` VARCHAR(36) NOT NULL,
  `quote_revision` INT NOT NULL DEFAULT 1 COMMENT 'The specific revision of the quotation evaluated',
  `stage` ENUM('SALES_REP', 'SALES_MANAGER', 'FINANCE_OPS') NOT NULL DEFAULT 'SALES_MANAGER',
  `level` INT NOT NULL DEFAULT 1 COMMENT '1 = Level 1 (Sales Rep); 2 = Level 2 (Sales Manager); 3 = Level 3 (Finance)',
  `approver_id` VARCHAR(36) DEFAULT NULL,
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'RETURNED', 'INVALIDATED') NOT NULL DEFAULT 'PENDING',
  `comments` TEXT DEFAULT NULL,
  `decided_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_approvals_quote_rev_stage` (`quotation_id`, `quote_revision`, `stage`, `status`),
  KEY `idx_approvals_approver_status` (`approver_id`, `status`),
  CONSTRAINT `fk_approvals_quotation` FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_approvals_approver` FOREIGN KEY (`approver_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 8. FULFILLMENT, WAREHOUSE SPLITS & BACKORDERS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: allocations
-- Description: Line item warehouse splits optimized by proximity, stock, and shipping cost
-- ----------------------------------------------------------------------------
CREATE TABLE `allocations` (
  `id` VARCHAR(36) NOT NULL,
  `quotation_id` VARCHAR(36) NOT NULL,
  `warehouse_id` VARCHAR(36) NOT NULL,
  `product_id` VARCHAR(36) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `pool_type` ENUM('NORMAL', 'PREMIUM_BULK') NOT NULL DEFAULT 'NORMAL',
  `distance_km` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `shipping_cost` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `status` ENUM('PENDING', 'PROPOSED', 'ACCEPTED', 'OVERRIDDEN', 'ALLOCATED', 'DISPATCHED', 'DELIVERED') NOT NULL DEFAULT 'PENDING',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_allocations_quote_wh` (`quotation_id`, `warehouse_id`, `status`),
  KEY `idx_allocations_product` (`product_id`),
  CONSTRAINT `chk_allocations_quantity` CHECK (`quantity` >= 1),
  CONSTRAINT `fk_allocations_quotation` FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_allocations_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_allocations_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: backorders
-- Description: Unmet demand queue triggered on warehouse stock deficit with auto-consolidation
-- ----------------------------------------------------------------------------
CREATE TABLE `backorders` (
  `id` VARCHAR(36) NOT NULL,
  `quotation_id` VARCHAR(36) NOT NULL,
  `product_id` VARCHAR(36) NOT NULL,
  `warehouse_id` VARCHAR(36) DEFAULT NULL,
  `quantity_unfulfilled` INT NOT NULL,
  `status` ENUM('CREATED', 'STOCK_ARRIVED', 'FULFILLED', 'CANCELLED') NOT NULL DEFAULT 'CREATED',
  `expected_date` DATE DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_backorders_quote_status` (`quotation_id`, `status`),
  KEY `idx_backorders_product_status` (`product_id`, `status`),
  KEY `idx_backorders_warehouse` (`warehouse_id`),
  CONSTRAINT `chk_backorders_quantity` CHECK (`quantity_unfulfilled` >= 1),
  CONSTRAINT `fk_backorders_quotation` FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_backorders_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_backorders_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 9. HYBRID BILLING, INVOICES & SUBSCRIPTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: subscriptions
-- Description: Active SaaS licenses with price snapshots to prevent historical pricing mutations
-- ----------------------------------------------------------------------------
CREATE TABLE `subscriptions` (
  `id` VARCHAR(36) NOT NULL,
  `quotation_id` VARCHAR(36) DEFAULT NULL,
  `quote_line_id` VARCHAR(36) DEFAULT NULL,
  `customer_id` VARCHAR(36) NOT NULL,
  `plan_id` VARCHAR(36) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'Snapshot of unit price at purchase time',
  `discount_pct` DECIMAL(5, 2) NOT NULL DEFAULT 0.00 COMMENT 'Snapshot of recurring discount %',
  `amount_per_cycle` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'Recurring billing amount per period',
  `currency` VARCHAR(10) NOT NULL DEFAULT 'INR',
  `status` ENUM('ACTIVE', 'MODIFIED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
  `start_date` DATE NOT NULL,
  `next_billing_date` DATE NOT NULL,
  `billing_period` ENUM('MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL DEFAULT 'MONTHLY',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_subscriptions_customer_status_due` (`customer_id`, `status`, `next_billing_date`),
  KEY `idx_subscriptions_plan` (`plan_id`),
  KEY `idx_subscriptions_quote` (`quotation_id`),
  KEY `idx_subscriptions_line` (`quote_line_id`),
  CONSTRAINT `chk_subscriptions_qty` CHECK (`quantity` >= 1),
  CONSTRAINT `fk_subscriptions_quote` FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_subscriptions_line` FOREIGN KEY (`quote_line_id`) REFERENCES `quotation_items` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_subscriptions_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_subscriptions_plan` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: invoices
-- Description: Header records for one-time hardware and recurring subscription billing
-- ----------------------------------------------------------------------------
CREATE TABLE `invoices` (
  `id` VARCHAR(36) NOT NULL,
  `invoice_number` VARCHAR(100) NOT NULL,
  `quotation_id` VARCHAR(36) NOT NULL,
  `customer_id` VARCHAR(36) NOT NULL,
  `type` ENUM('ONE_TIME', 'RECURRING') NOT NULL DEFAULT 'ONE_TIME',
  `amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'Total invoice amount before deposit deduction',
  `deposit_deducted` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'Refundable deposit credited against this invoice',
  `amount_due` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'Net amount due (amount - deposit_deducted)',
  `one_time_total` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `recurring_total` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `billing_cycle` VARCHAR(50) DEFAULT NULL,
  `status` ENUM('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED', 'CLOSED') NOT NULL DEFAULT 'DRAFT',
  `due_date` DATETIME NOT NULL,
  `issued_at` DATETIME DEFAULT NULL,
  `paid_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_invoices_number` (`invoice_number`),
  KEY `idx_invoices_quote` (`quotation_id`),
  KEY `idx_invoices_customer_status_due` (`customer_id`, `status`, `due_date`),
  KEY `idx_invoices_status` (`status`),
  CONSTRAINT `chk_invoices_amount` CHECK (`amount` >= 0),
  CONSTRAINT `fk_invoices_quotation` FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_invoices_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: invoice_items
-- Description: Line item breakdown for invoices (identifies billed hardware, services & subscriptions)
-- ----------------------------------------------------------------------------
CREATE TABLE `invoice_items` (
  `id` VARCHAR(36) NOT NULL,
  `invoice_id` VARCHAR(36) NOT NULL,
  `quotation_item_id` VARCHAR(36) DEFAULT NULL,
  `product_id` VARCHAR(36) NOT NULL,
  `subscription_id` VARCHAR(36) DEFAULT NULL,
  `description` VARCHAR(255) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `discount_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `tax_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `line_total` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_invoice_items_invoice` (`invoice_id`),
  KEY `idx_invoice_items_quote_line` (`quotation_item_id`),
  KEY `idx_invoice_items_product` (`product_id`),
  KEY `idx_invoice_items_sub` (`subscription_id`),
  CONSTRAINT `chk_invoice_items_qty` CHECK (`quantity` >= 1),
  CONSTRAINT `fk_invoice_items_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_invoice_items_quote_line` FOREIGN KEY (`quotation_item_id`) REFERENCES `quotation_items` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_invoice_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_invoice_items_sub` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: payments
-- Description: Payment transaction records against invoices with status lifecycle
-- ----------------------------------------------------------------------------
CREATE TABLE `payments` (
  `id` VARCHAR(36) NOT NULL,
  `invoice_id` VARCHAR(36) NOT NULL,
  `customer_id` VARCHAR(36) DEFAULT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `status` ENUM('PENDING', 'SUCCESSFUL', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'SUCCESSFUL',
  `method` VARCHAR(50) NOT NULL DEFAULT 'CREDIT_CARD',
  `reference` VARCHAR(255) DEFAULT NULL,
  `recorded_by_user_id` VARCHAR(36) DEFAULT NULL,
  `recorded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_payments_invoice` (`invoice_id`),
  KEY `idx_payments_customer` (`customer_id`),
  KEY `idx_payments_status` (`status`),
  KEY `idx_payments_recorded_at` (`recorded_at`),
  CONSTRAINT `chk_payments_amount` CHECK (`amount` >= 0),
  CONSTRAINT `fk_payments_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_payments_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_payments_user` FOREIGN KEY (`recorded_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 10. CUSTOMER PORTAL, NEGOTIATION TICKETS & PRODUCT HOLDS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: negotiation_tickets
-- Description: In-portal negotiation requests with counter discounts and deadlines
-- ----------------------------------------------------------------------------
CREATE TABLE `negotiation_tickets` (
  `id` VARCHAR(36) NOT NULL,
  `quote_id` VARCHAR(36) NOT NULL,
  `customer_id` VARCHAR(36) NOT NULL,
  `requested_discount_pct` DECIMAL(5, 2) NOT NULL,
  `counter_discount_pct` DECIMAL(5, 2) DEFAULT NULL,
  `comments` TEXT DEFAULT NULL,
  `status` ENUM('OPEN', 'ACCEPTED', 'REJECTED', 'COUNTERED', 'EXPIRED') NOT NULL DEFAULT 'OPEN',
  `purchase_deadline` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_neg_tickets_quote_status` (`quote_id`, `status`),
  KEY `idx_neg_tickets_customer_status` (`customer_id`, `status`),
  KEY `idx_neg_tickets_deadline` (`purchase_deadline`),
  CONSTRAINT `fk_neg_tickets_quote` FOREIGN KEY (`quote_id`) REFERENCES `quotations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_neg_tickets_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: product_holds
-- Description: Temporary inventory locks placed during active negotiation tickets.
-- Must be created/released/consumed in the same transaction with inventories.reserved_*.
-- ----------------------------------------------------------------------------
CREATE TABLE `product_holds` (
  `id` VARCHAR(36) NOT NULL,
  `ticket_id` VARCHAR(36) NOT NULL,
  `quotation_id` VARCHAR(36) DEFAULT NULL,
  `product_id` VARCHAR(36) NOT NULL,
  `warehouse_id` VARCHAR(36) DEFAULT NULL,
  `pool_type` ENUM('NORMAL', 'PREMIUM_BULK') NOT NULL DEFAULT 'NORMAL',
  `quantity_held` INT NOT NULL,
  `status` ENUM('ACTIVE', 'RELEASED', 'CONSUMED', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
  `expires_at` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_holds_ticket` (`ticket_id`),
  KEY `idx_product_holds_status_expiry` (`status`, `expires_at`),
  KEY `idx_product_holds_product` (`product_id`),
  CONSTRAINT `chk_product_holds_qty` CHECK (`quantity_held` >= 1),
  CONSTRAINT `fk_product_holds_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `negotiation_tickets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_product_holds_quote` FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_product_holds_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_product_holds_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: line_comments
-- Description: Line-level contextual discussions between Buyer and Sales Rep
-- ----------------------------------------------------------------------------
CREATE TABLE `line_comments` (
  `id` VARCHAR(36) NOT NULL,
  `quote_line_id` VARCHAR(36) NOT NULL,
  `ticket_id` VARCHAR(36) DEFAULT NULL,
  `author_id` VARCHAR(36) NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_line_comments_line` (`quote_line_id`),
  KEY `idx_line_comments_ticket` (`ticket_id`),
  KEY `idx_line_comments_author` (`author_id`),
  CONSTRAINT `fk_line_comments_line` FOREIGN KEY (`quote_line_id`) REFERENCES `quotation_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_line_comments_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `negotiation_tickets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_line_comments_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: negotiations
-- Description: Quote-level message thread between buyer and sales rep
-- ----------------------------------------------------------------------------
CREATE TABLE `negotiations` (
  `id` VARCHAR(36) NOT NULL,
  `quotation_id` VARCHAR(36) NOT NULL,
  `sender_id` VARCHAR(36) NOT NULL,
  `sender_role` ENUM('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE_OPS', 'CUSTOMER') NOT NULL,
  `message` TEXT NOT NULL,
  `proposed_discount` DECIMAL(5, 2) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_negotiations_quotation` (`quotation_id`),
  KEY `idx_negotiations_sender` (`sender_id`),
  CONSTRAINT `fk_negotiations_quotation` FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_negotiations_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 11. AUDIT TRAIL, SECURITY LOGS & IN-APP NOTIFICATIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: audit_logs
-- Description: Immutable audit trail tracking quotation revisions, discount changes & approvals
-- ----------------------------------------------------------------------------
CREATE TABLE `audit_logs` (
  `id` VARCHAR(36) NOT NULL,
  `quotation_id` VARCHAR(36) DEFAULT NULL,
  `entity_type` VARCHAR(50) NOT NULL COMMENT 'e.g. QUOTATION, QUOTE_LINE, APPROVAL, ALLOCATION, POLICY',
  `entity_id` VARCHAR(36) NOT NULL,
  `action` VARCHAR(100) NOT NULL COMMENT 'e.g. CREATED, DISCOUNT_CHANGED, APPROVED, REVISION_INVALIDATED',
  `performed_by_id` VARCHAR(36) DEFAULT NULL,
  `performed_by_name` VARCHAR(255) DEFAULT NULL,
  `performed_by_role` VARCHAR(50) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `old_values` JSON DEFAULT NULL COMMENT 'Structured before state snapshot',
  `new_values` JSON DEFAULT NULL COMMENT 'Structured after state snapshot',
  `reason` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_logs_quote` (`quotation_id`, `created_at`),
  KEY `idx_audit_logs_entity` (`entity_type`, `entity_id`, `created_at`),
  KEY `idx_audit_logs_performer` (`performed_by_id`, `created_at`),
  KEY `idx_audit_logs_action` (`action`),
  CONSTRAINT `fk_audit_quotation` FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`performed_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: notifications
-- Description: Targeted real-time alerts for approvals, negotiations, and inventory changes
-- ----------------------------------------------------------------------------
CREATE TABLE `notifications` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `type` ENUM(
    'APPROVAL_REQUIRED', 
    'APPROVAL_DECISION', 
    'APPROVAL_INVALIDATED',
    'NEGOTIATION_TICKET_RAISED', 
    'NEGOTIATION_DECISION', 
    'BACKORDER_FULFILLED', 
    'QUOTE_SENT', 
    'QUOTE_CONFIRMED', 
    'DEPOSIT_RECEIVED', 
    'DEPOSIT_REFUNDED', 
    'SYSTEM_ALERT'
  ) NOT NULL,
  `message` TEXT NOT NULL,
  `related_quote_id` VARCHAR(36) DEFAULT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user_unread` (`user_id`, `is_read`, `created_at`),
  KEY `idx_notifications_quote` (`related_quote_id`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_notifications_quote` FOREIGN KEY (`related_quote_id`) REFERENCES `quotations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 12. HIGH-PERFORMANCE SAAS VIEWS FOR REAL-TIME ANALYTICS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- View: vw_quotation_details
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW `vw_quotation_details` AS
SELECT 
  q.id AS quote_id,
  q.quotation_number,
  q.quote_revision,
  q.status,
  q.currency,
  q.subtotal,
  q.discount_total,
  q.tax_total,
  q.estimated_net_total,
  q.confirmed_net_total,
  q.cogs,
  q.margin_pct,
  q.blended_risk_score,
  q.approval_level,
  q.requires_approval,
  q.has_hardware_lines,
  q.has_software_lines,
  c.id AS customer_id,
  c.name AS customer_name,
  c.tier AS customer_tier,
  u.id AS sales_rep_id,
  u.name AS sales_rep_name,
  q.valid_until,
  q.created_at,
  q.updated_at
FROM `quotations` q
JOIN `customers` c ON q.customer_id = c.id
JOIN `users` u ON q.rep_id = u.id;

-- ----------------------------------------------------------------------------
-- View: vw_inventory_pool_status
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW `vw_inventory_pool_status` AS
SELECT 
  w.id AS warehouse_id,
  w.name AS warehouse_name,
  w.region,
  p.id AS product_id,
  p.name AS product_name,
  p.category,
  p.product_type,
  i.normal_pool_qty,
  i.premium_bulk_pool_qty,
  i.reserved_normal,
  i.reserved_premium,
  i.available_normal,
  i.available_premium_bulk,
  i.quantity_available,
  i.quantity_reserved,
  i.updated_at
FROM `inventories` i
JOIN `warehouses` w ON i.warehouse_id = w.id
JOIN `products` p ON i.product_id = p.id;

-- ----------------------------------------------------------------------------
-- View: vw_deal_health_kpis
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW `vw_deal_health_kpis` AS
SELECT 
  COUNT(CASE WHEN status IN ('DRAFT', 'SALES_REP_REVIEW', 'UNDER_NEGOTIATION') AND updated_at < DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) AS stalled_deals_count,
  COUNT(CASE WHEN requires_approval = 1 AND status IN ('SALES_REP_REVIEW', 'MANAGER_REVIEW', 'FINANCE_REVIEW', 'PENDING_APPROVAL') THEN 1 END) AS pending_approvals_count,
  COUNT(CASE WHEN status = 'CONFIRMED' THEN 1 END) AS confirmed_deals_count,
  COALESCE(SUM(CASE WHEN status = 'CONFIRMED' THEN confirmed_net_total ELSE 0 END), 0) AS total_confirmed_revenue,
  COALESCE(AVG(margin_pct), 0) AS avg_pipeline_margin_pct
FROM `quotations`;

-- ============================================================================
-- 13. SEED / BASELINE CONFIGURATION DATA
-- ============================================================================

-- Default Inventory Pool Configuration
INSERT INTO `pool_configs` (`id`, `normal_pool_pct`, `premium_bulk_pool_pct`, `deposit_pct`, `hold_duration_hours`)
VALUES ('pool_cfg_01', 50.00, 50.00, 10.00, 48)
ON DUPLICATE KEY UPDATE `normal_pool_pct` = VALUES(`normal_pool_pct`);

-- Approval Chain Governance Rules
INSERT INTO `approval_chain_rules` (`id`, `description`, `sales_rep_only_max_over_ceiling_pct`, `finance_threshold_over_ceiling_pct`, `is_active`)
VALUES ('apr_chain_01', '0-5% over ceiling -> Sales Rep; 5-15% -> Sales Manager; >15% -> Finance Ops', 5.00, 15.00, 1)
ON DUPLICATE KEY UPDATE `sales_rep_only_max_over_ceiling_pct` = VALUES(`sales_rep_only_max_over_ceiling_pct`);

-- 5-Tier Discount Policies by Category
INSERT INTO `discount_policies` (`id`, `customer_tier`, `product_category`, `max_discount_pct`, `is_active`) VALUES
('dp_free_hw', 'FREE', 'Hardware', 10.00, 1),
('dp_free_sw', 'FREE', 'Software', 15.00, 1),
('dp_free_srv', 'FREE', 'Services', 10.00, 1),
('dp_std_hw', 'STANDARD', 'Hardware', 12.00, 1),
('dp_std_sw', 'STANDARD', 'Software', 18.00, 1),
('dp_std_srv', 'STANDARD', 'Services', 15.00, 1),
('dp_prem_hw', 'PREMIUM', 'Hardware', 15.00, 1),
('dp_prem_sw', 'PREMIUM', 'Software', 25.00, 1),
('dp_prem_srv', 'PREMIUM', 'Services', 20.00, 1),
('dp_gold_hw', 'GOLD', 'Hardware', 20.00, 1),
('dp_gold_sw', 'GOLD', 'Software', 30.00, 1),
('dp_gold_srv', 'GOLD', 'Services', 25.00, 1),
('dp_plat_hw', 'PLATINUM', 'Hardware', 25.00, 1),
('dp_plat_sw', 'PLATINUM', 'Software', 35.00, 1),
('dp_plat_srv', 'PLATINUM', 'Services', 30.00, 1)
ON DUPLICATE KEY UPDATE `max_discount_pct` = VALUES(`max_discount_pct`);

-- Discount Stacking Rules
INSERT INTO `discount_type_rules` (`id`, `type`, `bulk_threshold_qty`, `bulk_discount_pct`, `consistency_order_count`, `consistency_discount_pct`, `premium_discount_pct`, `is_active`) VALUES
('dtr_bulk_01', 'BULK', 10, 3.00, NULL, NULL, NULL, 1),
('dtr_cons_01', 'CONSISTENCY', NULL, NULL, 5, 2.00, NULL, 1),
('dtr_prem_01', 'PREMIUM', NULL, NULL, NULL, NULL, 5.00, 1)
ON DUPLICATE KEY UPDATE `is_active` = VALUES(`is_active`);

-- Subscription Plans
INSERT INTO `subscription_plans` (`id`, `name`, `billing_period`, `proration_type`, `price`, `is_active`) VALUES
('plan_cloud_monthly', 'CloudDB Pro Monthly', 'MONTHLY', 'DAILY', 5000.00, 1),
('plan_cloud_quarterly', 'CloudDB Pro Quarterly', 'QUARTERLY', 'DAILY', 13500.00, 1),
('plan_cloud_yearly', 'CloudDB Pro Annual', 'YEARLY', 'DAILY', 48000.00, 1)
ON DUPLICATE KEY UPDATE `price` = VALUES(`price`);

-- Admin User Seed
INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`, `role_id`, `customer_id`, `is_active`)
VALUES ('usr_admin_01', 'admin@dealflow360.com', '$2b$10$wT8vIq59A08Dcl96Xz1bUe.j95c/v1zNeqN4uN5r2a5l7XF7N2d7C', 'System Administrator', 'ADMIN', 'role_admin_01', NULL, 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
