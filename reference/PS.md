# DealFlow360 — Official Problem Statement

## An Intelligent, Self-Governing Sales Operations Platform

DealFlow360 is a Sales Operations platform designed to handle:

- Multi-tier discount governance and automated approval routing
- Live upsell and cross-sell recommendations while building a quotation
- Multi-warehouse fulfillment splitting and backorder handling
- Hybrid billing (one-time products mixed with recurring subscription lines)
- Deal health monitoring and anomaly alerts
- Customer-facing portal negotiation on live quotations
- Sales backend configuration and reporting dashboards

Most simple sales tools handle the basics well: create a quote, confirm an order, and invoice it.

Real B2B sales teams operate in more complex conditions, such as:

- Multi-level discount approvals
- Partial stock spread across warehouses
- Bundled subscriptions mixed with one-time hardware
- Customers who want to negotiate inside a portal instead of over email
- Managers who only find out a deal is stuck after it has already lost momentum

The goal of DealFlow360 is to build a sales platform that goes beyond a quote-to-invoice system and becomes a **self-governing deal engine**.

The system should:

- Enforce pricing discipline
- React to inventory reality in real time
- Keep subscriptions and one-time sales reconciled on a single order
- Give sales representatives and customers a living, negotiable document instead of a static PDF

---

# 1. Project Overview

Teams are free to use any programming language, framework, or database technology to build this solution.

The focus is on:

- Business logic
- Data model
- End-to-end workflow

The solution is not restricted to a specific platform or vendor.

## Main Goal

Build a complete sales flow including:

- Backend configuration
- Frontend quotation experience
- Quote-to-cash workflow

## Key Outcomes

The completed platform should allow:

1. A sales representative to log in, build a quotation, and have it automatically routed for the correct approval based on discount and customer tier.

2. A sales representative to receive live upsell and cross-sell suggestions with real-time margin impact while building the quote.

3. An order to be automatically split across warehouses based on stock availability, with the ability to manually override the suggested split.

4. A single order to mix one-time products and recurring subscription lines with correct proration and billing schedules.

5. A dashboard to show deal health, stalled quotes, and discount anomalies in real time.

6. A customer to view and negotiate a quotation directly from a customer-facing portal without email back-and-forth.

---

# 2. Goals & Scope

The system should provide a complete sales workflow from quotation through approval, negotiation, fulfillment, billing, and reporting.

The solution should focus on real business logic rather than only creating UI screens.

---

# 3. User Roles

## 3.1 Sales Representative

The Sales Representative can:

- Build quotations
- Apply discounts
- Add upsell items
- Track approval status
- Track fulfillment progress
- Respond to customer negotiation requests

---

## 3.2 Sales Manager / Approver

The Sales Manager / Approver can:

- Review quotations that exceed discount thresholds
- Approve quotations
- Reject quotations
- Configure discount tiers
- Configure approval chains
- Monitor the deal health dashboard
- Monitor at-risk deals

---

## 3.3 Finance / Operations User

The Finance / Operations User can:

- Handle second-level approvals for high-risk discounts
- Manage warehouse fulfillment splits
- Handle backorder decisions
- Reconcile recurring billing
- Handle credit notes

---

## 3.4 Customer / Portal User

The Customer can:

- View quotations online
- Request changes
- Ask line-level questions
- Counter a discount
- Confirm final terms with one click

The customer must use a separate customer-facing portal view.

---

## 3.5 Administrator

The Administrator can manage backend setup, including:

- Products
- Price lists
- Discount tiers
- Warehouses
- Subscription plans

The Administrator can also view:

- Platform-wide analytics
- Reporting

---

# 4. Modules / Features Breakdown

# A. Sales Backend — Configuration Area

## A1. Authentication — Login / Signup

The system must support authentication for internal users and customers.

### Internal Users

Internal users can:

- Sign up
- Log in
- Use standard credentials

### Customers

Customers can access their quotations through a customer portal using:

- Magic link
- OR email and password

### After Login

Internal users can:

- Access the backend configuration
- Open the sales workspace

---

# A2. Product & Price List Management

The backend must support product and price list management.

## General Product Information

Products should support:

- Name
- Category
- Price
- Unit
- Tax
- Product description

## Product Variants

Variants should support:

- Attribute
- Attribute values
- Extra prices

Examples of attributes:

- Size
- Pack

## Price Lists

Price lists should support:

- Customer-tier-based pricing
- Currency-specific pricing rules

---

# A3. Discount Tier & Approval Chain Setup

The backend must allow administrators/managers to configure discount governance.

## Customer-Tier Discount Ceilings

The system must support discount ceilings per customer tier.

Example:

- Bronze: up to 5%
- Silver: up to 10%
- Gold: up to 15%

These values are examples and can be configured.

## Category-Specific Discount Ceilings

Different product categories can have different discount ceilings.

Some categories may allow higher discount discretion than others.

## Approval Chain

The system must allow configuration of which discount ranges require:

- Sales Manager approval only
- Sales Manager followed by Finance approval

## Blended Risk

When a quotation contains categories with different discount ceilings, the system must:

1. Evaluate each line against its applicable ceiling.
2. Calculate a blended risk score for the quotation.
3. Route the quotation to the highest required approval level.

## Audit

The system must log:

- Approvals
- Rejections
- Edits

Each relevant log must include:

- User
- Timestamp
- Reason

---

# A4. Warehouse & Fulfillment Setup

The backend must support warehouse configuration.

## Warehouses

Users should be able to:

- Create warehouses
- Manage warehouses

Example warehouses:

- Main Warehouse
- East Depot

## Stock

The system should support:

- Stock levels per warehouse
- Replenishment rules per warehouse

## Shipping Cost Weighting

The system must support shipping cost weighting used by the automatic split logic.

The purpose is to minimize the number of shipments.

---

# A5. Subscription / Recurring Plan Setup

The backend must support recurring subscription plans.

## Recurring Plans

Plans can be:

- Monthly
- Quarterly
- Yearly

Plans can be attached to specific:

- Products
- Services

## Proration

The system must support configurable proration rules for:

- Mid-cycle quantity changes
- Mid-cycle plan changes

## Cancellation and Refund

The system must support configurable rules for:

- Cancellation
- Partial refunds

---

# A6. Upsell / Cross-Sell Rule Setup

This feature is optional according to the Problem Statement.

The system can support:

## Product Pairings

Define product pairings based on:

- Historical co-purchase data

## Promotions

Products can be marked as currently promoted so they rank higher in recommendations.

## Minimum Margin

Configure minimum margin thresholds so that only healthy-margin suggestions are shown.

---

# A7. Reporting & Dashboard Configuration

The backend must provide:

- Dashboard
- Reporting menu

The purpose is to monitor sales performance.

## Export

Reports should support:

- PDF
- XLS

## Reporting Filters

### Period

Users can view quotations and orders within:

- Today
- Week
- Custom date range

### Sales Team / Sales Representative

Reports can be filtered by:

- Responsible sales representative
- Sales team

This allows analysis of individual and team performance.

### Approval Status

Reports can be filtered by:

- Pending
- Approved
- Rejected

### Product / Category

Reports can be filtered to track:

- Best-selling products
- Most-discounted products

---

# B. Sales Frontend — Sales Representative Workspace

# B1. Sales Workspace — Top Menu

The sales workspace should provide top-level navigation.

## Quotations

Opens:

- Active quotations
- Draft quotations

## Pipeline

Opens:

- Kanban-style deal pipeline

## Actions

### Reload Data

Refresh:

- Pricing
- Stock
- Approval data

from the backend.

### Go to Backend

Opens:

- Configuration
- Settings

### Close Workspace

Ends the current working session/view.

---

# B2. Quotation List / Pipeline View

Quotations should appear as selectable cards.

Each card should show:

- Customer
- Amount
- Stage

Example:

- Acme Corp — Draft
- Beta Industries — Pending Approval

Selecting a quotation opens the:

- Quotation Builder

for that deal.

---

# B3. Quotation Builder — Products + Cart

The quotation builder should allow the Sales Representative to:

- Pick products across categories
- Adjust quantities using +/-
- Apply line-level discounts
- Apply order-level discounts
- View order lines
- View price totals
- View a live margin indicator

Product categories can include:

- Hardware
- Services
- Subscriptions

The Sales Representative can:

- Confirm the quotation
- Move it to approval
- OR move directly to fulfillment if no approval is required

---

# B4. Discount Approval Screen

The approval screen must display:

- Blended risk score for the quotation
- Approval steps

Possible approval steps:

- Sales Manager
- Finance

Finance should only be shown when required.

## Approval Actions

After reviewing the quotation, an approver can:

- Approve
- Reject
- Return for revision

## Audit Trail

The approval screen must provide a confirmation view containing the full audit trail entry.

---

# B5. Upsell & Cross-Sell Panel

When building a quotation, the recommendation panel appears alongside the cart.

## Recommendation Ranking

Suggestions are ranked using:

- Co-purchase history
- Active promotions

## Suggested Product Information

Each suggestion displays:

- Suggested product
- Margin delta if added
- Promotion tag, if applicable

## Actions

The Sales Representative can:

- Add to Quote
- Dismiss

After adding a suggestion:

- The quotation margin indicator must update immediately.

---

# B6. Fulfillment & Warehouse Split Screen

The fulfillment screen must show the recommended warehouse split.

The recommendation is based on:

- Live stock

## Display

The screen should show:

- Warehouse name
- Quantity fulfilled from that warehouse
- Estimated shipment count
- Estimated shipment cost

## Actions

The user can:

- Accept Suggested Split
- Manually Override

## Backorder Consolidation

If stock arrives during fulfillment, the system should automatically display:

- "Consolidate Remaining Backorder"

---

# B7. Subscription & Billing Screen

The billing screen must show one-time and recurring lines separately within the same order.

## One-Time Lines

Show:

- One-time products

## Recurring Lines

Show:

- Recurring subscription products/services
- Upcoming billing schedule

## Subscription Changes

The system must handle:

- Mid-cycle proration when quantity changes
- Subscription cancellation
- Subscription modification

When applicable, cancellation or modification should trigger:

- Automatic partial refund
- OR credit note

---

# B8. Customer Portal Negotiation Screen

The customer-facing negotiation screen must be:

- Separate from the internal workspace
- Restricted to the customer

## Display

The customer can see:

- Quotation details
- Current status

Possible statuses include:

- Sent
- Under Negotiation
- Confirmed

## Negotiation

The customer can:

- Add line-level comments
- Request changes
- Propose a counter discount

## Actions

The customer has:

- Submit Request
- Confirm Quotation

## After Confirmation

The system checks the final terms.

### If terms exceed approval thresholds

The quotation:

- Automatically re-enters the approval flow

### If terms do not exceed approval thresholds

The order:

- Moves directly to fulfillment

---

# B9. Deal Health & Anomaly Dashboard

The dashboard must show:

## Stalled Deals

Show quotations that have been active for more than a configured number of days.

## Discount Anomaly Alerts

Show discounts that are well above the Sales Representative's historical average.

## Delivery Promise Slippage

Show indicators where delivery promises are slipping.

## Alert Navigation

Clicking an alert should:

- Open the related quotation directly

## Automated Action

An alert can trigger:

- Automated nudge
- Escalation action

---

# 5. Complete Flow — End-to-End

The complete sales flow should work as follows:

1. Sales Representative signs up for the first time or logs in.

2. Administrator configures the backend:
   - Products
   - Price lists
   - Discount tiers
   - Approval chains
   - Warehouses
   - Subscription plans

3. Sales Representative opens the sales workspace.

4. Sales Representative creates a new quotation for a customer.

5. Sales Representative adds products.

6. Sales Representative applies discounts.

7. Sales Representative reviews upsell/cross-sell suggestions.

8. The system calculates the discount and blended risk score.

9. If the discount or blended risk score exceeds the configured threshold, the quotation is automatically routed for approval.

10. The approval chain can involve:
    - Sales Manager
    - Finance, if required

11. Once approved, or immediately if approval is not required, the system suggests a warehouse fulfillment split.

12. The order may contain recurring subscription lines.

13. Recurring lines generate a billing schedule alongside any one-time invoice.

14. The customer receives the quotation link.

15. The customer can negotiate directly through the portal.

16. If terms change beyond the configured approval threshold during negotiation, the quotation automatically re-enters the approval flow.

17. Once the quotation is confirmed, the order proceeds to:
    - Fulfillment
    - Billing

18. The Sales Manager monitors the Deal Health dashboard throughout the lifecycle.

19. Reports can be reviewed using filters such as:
    - Period
    - Sales Team
    - Approval Status
    - Product

---

# 6. Why This Hackathon Problem Is Important

## Real-World Business Workflow

The system demonstrates a complete B2B sales process:

**Quotation → Approval → Fulfillment → Billing → Customer Negotiation → Reporting**

## Business Logic Focus

The problem focuses on practical business rules such as:

- Discount approvals
- Warehouse splitting
- Subscription billing
- Margin impact
- Customer negotiation

The goal is not just to create UI screens.

## Industry-Ready System Thinking

The solution demonstrates:

- Role-based access
- Approval chains
- Inventory coordination
- Recurring billing
- Audit trails
- Deal analytics
- Portal-based customer collaboration

---

# 7. Technical Guidelines

Teams may use:

- Any backend language
- Any frontend framework
- Any relational database
- Any document database
- Any technology stack

The core business rules must be implemented as real application logic.

The following must not be:

- Hardcoded only for the demo
- Faked for the demo

Important business logic includes:

- Approval routing
- Discount governance
- Warehouse splitting
- Billing proration

## Customer Portal

The customer-facing negotiation screen must be:

- A real separate view
- Properly restricted

It must not simply be an internal screen with a different label.

## Multi-Currency / Multi-Company

Support for:

- Multi-currency
- Multi-company

is a bonus and is **not a requirement**.

---

# 8. Deliverables

The final submission should include:

## 8.1 Working Application

A working:

- Backend
- Frontend

with:

- Sample seed data

## 8.2 Live Demo

A five-minute live demo covering at least:

- Two complete end-to-end flows

Each flow should demonstrate the journey from:

- Quotation
- To fulfillment or billing

## 8.3 Architecture Diagram

Provide a one-page architecture diagram showing:

- Data model
- Major modules
- Connections between modules

## 8.4 Future Work Note

Provide a short note describing:

- What the team would build next with more time

---

# 9. Quick Test Flow — Login to Payment

This flow should be used to verify that the core business logic works, not only the screens.

Every step should produce a visible and correct result before moving to the next step.

## Step 1 — Login and Setup

Sign up or log in.

Set up basic backend data:

- Discount tier
- Warehouse
- Subscription plan

## Step 2 — Create High-Discount Quotation

Create a quotation.

Add a product line with a discount higher than normally allowed.

## Step 3 — Automatic Manager Approval

Confirm that the quotation automatically requests manager approval.

The Sales Representative must not have to manually request approval.

## Step 4 — Upsell and Margin

Accept one upsell suggestion.

Confirm that:

- Order total updates immediately
- Margin updates immediately

## Step 5 — Warehouse Allocation

Get the quotation approved.

Confirm that stock is pulled from the correct warehouse.

If necessary, confirm that stock is split across two warehouses.

## Step 6 — Hybrid Billing

Check that:

- One-time product
- Recurring subscription

on the same order are billed correctly and separately.

## Step 7 — Customer Negotiation

Open the customer portal.

Act as the customer.

Request a larger discount.

Confirm that the quotation automatically goes back for approval.

## Step 8 — Confirmation and Payment

Confirm the order.

Record a payment.

Check that the invoice status updates correctly.

## Core Flow Result

If all eight steps work smoothly and each result matches what is expected, the core flow is considered solid.

---

# 10. Understanding the Blended Discount Risk Score

The blended discount risk score determines:

- Whether a quotation needs manager approval
- Whether it also needs finance approval

The system should evaluate discounts at the individual product-line level.

Different products can have different discount limits.

The system should not only apply one overall discount limit to the entire quotation.

---

## Example

A Gold customer is normally allowed up to 15% discount.

Within the same order:

- Hardware is allowed up to 15%
- Services are allowed only up to 10%

Example quotation:

### Laptop — Hardware

- Discount given: 12%
- Allowed discount: 15%

Result:

- Within limit

### Setup Service — Service

- Discount given: 18%
- Allowed discount: 10%

Result:

- 8 percentage points above its limit

Therefore:

- The quotation is flagged for approval.

The overall Gold customer limit of 15% does not make the Service line acceptable because the Service category has its own stricter limit.

---

# 11. Why the Risk Score Is Blended

A quotation may contain several lines that are each slightly over their individual limits.

Example:

- Line 1: 2 points over
- Line 2: 3 points over
- Line 3: 2 points over

Individually, none may look very serious.

Together, they represent:

- 7 percentage points of excess discount

The blended score considers the overall pattern across the quotation.

This prevents a Sales Representative from spreading small violations across multiple lines while giving away significant margin overall.

---

# 12. Why Blended Risk Matters

The blended risk score helps:

- Decide who needs to review the deal
- Prevent managers from manually reviewing every quotation
- Prevent Sales Representatives from spreading small discount violations across many lines

---

# 13. Important Scope Notes

The Problem Statement requires:

- Blended risk scoring
- Approval routing based on the risk
- Different discount ceilings by customer tier and category

However, the Problem Statement does not define every mathematical detail of the risk calculation.

The implementation team must define the exact:

- Risk formula
- Risk thresholds
- Approval-level boundaries

These implementation decisions must not change the core business requirement.

---

# 14. Core Business Principles

The completed system should demonstrate the following principles:

1. **Business rules must drive the workflow.**

2. **Discount governance must be automatic.**

3. **Approval routing must happen automatically based on configured rules.**

4. **Different product categories may have different discount limits.**

5. **The entire quotation must be evaluated when calculating risk.**

6. **Inventory availability must influence fulfillment.**

7. **Warehouse splitting should minimize unnecessary shipments.**

8. **One-time and recurring products must coexist within the same order.**

9. **Subscription billing must support correct schedules and proration.**

10. **Customers must be able to negotiate through a restricted portal.**

11. **Negotiated changes must be re-evaluated against approval rules.**

12. **Deal health should be visible to management.**

13. **Important business actions must be auditable.**

14. **The application should demonstrate a complete quotation-to-cash workflow.**

---

# 15. Mockup

The Problem Statement provides the following UI mockup:

https://app.excalidraw.com/l/65VNwvy7c4X/7Fb5SR3WKu