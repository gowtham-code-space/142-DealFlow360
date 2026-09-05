# DealFlow360 API Documentation

Welcome to the **DealFlow360 API** specification workspace. This folder contains the complete, modular OpenAPI 3.0 specification designed specifically for the DealFlow360 platform.

---

## 📁 Directory Structure

```text
server/docs/
├── openapi.yaml           # Modular OpenAPI 3.0 Entry Point (references path & schema modules)
├── swagger.yaml           # Bundled Standalone OpenAPI 3.0 Specification (ready for Swagger UI / Redoc / Postman)
├── README.md              # Documentation Overview and Guidelines
│
├── paths/                 # Individual API path definitions grouped by business domain
│   ├── auth.yaml          # Customer signup, user login, token refresh, profile & password
│   ├── users.yaml         # Internal user management, bulk upload, soft delete & reactivation
│   ├── customers.yaml     # Customer directory, tier management, customer quote history
│   ├── products.yaml      # Hardware/software catalog, variants, custom price lists
│   ├── config.yaml        # Discount policies, 5-tier rules, approval chains, pool & upsell rules
│   ├── warehouses.yaml    # Warehouse stock, normal/bulk pool breakdown, restock recommendations
│   ├── quotations.yaml    # Quote lifecycle: draft, submit, recalculate, risk score, refundable deposit
│   ├── quotelines.yaml    # Line item management & 5-tier stacking discount calculations
│   ├── approvals.yaml     # Level 1 (Sales Rep) & Level 2 (Manager) approval workflow
│   ├── recommendations.yaml # AI/Rule-based upsell & cross-sell suggestions
│   ├── fulfillment.yaml   # Nearest-warehouse allocation preview, accept/override, backorder queues
│   ├── billing.yaml       # Subscription billing schedules, invoices, proration previews, payments
│   ├── negotiation.yaml   # Internal negotiation ticket review, counter-offers, inventory hold status
│   ├── portal.yaml        # Customer-facing portal endpoints: restricted quote view, negotiate, deposit
│   ├── dashboard.yaml     # Real-time KPIs, stalled deals, discount anomalies, delivery slippage, pool health
│   ├── reports.yaml       # Filterable reports with PDF/XLSX export (quotations, performance, discounts)
│   ├── audit.yaml         # Full audit trails for quote state changes and global security logs
│   └── notifications.yaml # In-app notification delivery and read status
│
├── schemas/               # Data models and DTO schemas
│   ├── common.yaml        # Pagination metadata, standard success/error wrapper schemas
│   ├── auth_users.yaml    # Public user models, login/signup DTOs
│   ├── customers.yaml     # Customer profile and tier request/response models
│   ├── products.yaml      # Product, variant, and price list models
│   ├── config.yaml        # Discount policy, approval rule, subscription plan, upsell rule models
│   ├── warehouses.yaml    # Warehouse, inventory pool breakdown, regional demand models
│   ├── quotations.yaml    # Quotation entity, line items, 5-type discount breakdowns, deposit records
│   ├── approvals.yaml     # Approval requests and multi-tier approval step models
│   ├── recommendations.yaml # Upsell/cross-sell recommendation payload models
│   ├── fulfillment.yaml   # Warehouse allocation items and backorder records
│   ├── billing.yaml       # Billing schedule, invoice, subscription instance, payment models
│   ├── negotiation.yaml   # Negotiation tickets, inventory hold timers, line comments
│   ├── portal.yaml        # Sanitized customer-facing quote, line item, and ticket models
│   ├── dashboard.yaml     # Metric summaries, deal health indicators, pipeline counts
│   ├── audit.yaml         # Audit log records with before/after state diffs
│   └── notifications.yaml # In-app alert and notification payload models
│
└── components/            # Reusable OpenAPI building blocks
    ├── parameters.yaml    # Common query and path parameters (page, pageSize, quoteId, etc.)
    ├── responses.yaml     # Standard HTTP responses (200, 201, 400, 401, 403, 404, 409, 422, 500)
    └── securitySchemes.yaml # Bearer JWT authentication definition
```

---

## 🚀 Key Architectural Decisions

1. **Dual Auth Architecture**:
   - **Access Token**: Short-lived (15 min), returned in JSON payload for in-memory storage only (never stored in `localStorage` or `sessionStorage` to eliminate XSS token theft).
   - **Refresh Token**: Long-lived (7 days), stored in an `HttpOnly`, `SameSite=Strict`, `Secure` cookie.
   - **Customer Self-Registration**: Customer can sign up directly via `/api/v1/auth/signup` and access `/portal/*` routes. Internal roles (Admin, Sales Rep, Sales Manager, Finance/Ops) are managed/bulk-imported by Admins.

2. **Hardware vs. Software Separation**:
   - `hardware` products maintain multi-warehouse stock, normal/bulk pool allocations, nearest-warehouse routing, and backorder queues.
   - `software` products (SaaS) skip physical inventory/pools and instead link directly to recurring subscription plans (`monthly`, `quarterly`, `annual`) with proration preview calculations.

3. **5-Tier Discount Matrix & Approval Governance**:
   - Stacking formula: `List Price → Product Discount → Bulk Tier Discount → Consistency Discount → Customer Tier Discount → Variant Modifier`.
   - Automatic routing: Quotes exceeding discount ceiling or margin floor route to **Sales Rep only** or **Sales Rep + Sales Manager** as configured by Admin.

4. **Customer Portal & Ticket Negotiations**:
   - Interactive quote portal allows customers to raise negotiation tickets with requested discounts/quantities and auto-locks hardware inventory with hold deadlines.
   - Sales reps can accept, reject, or counter-offer before customer confirms and pays refundable deposits.

---

## 🛠 How to Run & View in Swagger UI

You can serve `swagger.yaml` with Express, Swagger UI Express, or Redoc:

```javascript
// Example Express integration
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const fs = require('fs');

const file = fs.readFileSync('./docs/swagger.yaml', 'utf8');
const swaggerDocument = YAML.parse(file);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
```
