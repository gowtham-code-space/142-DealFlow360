# DealFlow360 Requirements Document

## Executive Summary

DealFlow360 is a B2B sales platform that guides a quotation from creation through negotiation, approval, fulfillment, and billing.

It enforces configurable business rules such as:

- Discount limits
- Risk scoring
- Warehouse allocation
- Billing policies

The system automatically:

- Calculates when discounts require approval
- Suggests upsell products
- Allocates inventory
- Handles mixed one-time/recurring billing

A separate customer portal allows buyers to request changes.

All actions are audited.

This document consolidates **all required features** from the problem statement, acceptance criteria, and additional inferred or optional enhancements.

Each requirement is marked as:

- **Specified in PS**
- **Inferred**
- **Team decision**

Detailed functional requirements, data entities, workflows, and priority backlogs are provided for leader review.

---

# Actors and Roles

| Actor | Description / Permissions |
|---|---|
| **Sales Representative (Sales Rep)** | Creates and edits quotations, adds products/discounts, views recommendations, tracks approval and fulfillment status. *(Specified in PS)* |
| **Sales Manager** | Configures discount and approval policies; reviews and approves/rejects quotes. *(Specified in PS)* |
| **Finance / Operations** | Handles second-level approvals, manages warehouses/fulfillment, processes backorders and recurring billing. *(Specified in PS)* |
| **Customer (via Portal)** | Views assigned quotations, comments on line items, requests changes, counters discounts, and ultimately confirms orders. *(Separate, restricted customer view – Specified in PS)* |
| **Administrator** | System configuration: defines products, pricelists, customer tiers, discount policies, approval chains, warehouses, and subscription plans. *(Inferred from PS description of configuration tasks.)* |

---

# Acceptance Criteria (Quick Test Flow)

The following end-to-end scenarios must work in the final demo.

## 1. System Configuration

Administrator sets up:

- Products
- Customer tiers
- Discount limits
- Approval chain
- Warehouses
- Subscription plans

*(Implied from PS initialization step.)*

## 2. High-Discount Quote

Sales Rep creates a new quote for a Gold customer with a product/service discount exceeding allowed limits.

The system **automatically flags it for manager approval** with no manual toggle.

*(Specified in PS.)*

## 3. Manager Approval

Sales Manager views the pending quote, sees line-item details, and **approves** it.

The approval action, including comments, is recorded in the audit log.

*(Specified in PS.)*

## 4. Upsell Suggestion

The system suggests related products, such as accessories or higher-end options, based on purchase history and margin criteria.

The Sales Rep adds an upsell line.

**Margin and total update in real time.**

*(Margin update upon suggestion is Specified in PS; recommendation logic is Inferred/Team decision.)*

## 5. Warehouse Allocation

The platform calculates how to split order quantities across multiple warehouses.

The calculation considers:

- Stock
- Shipping cost
- Shipment minimization

It proposes an allocation.

Operations can:

- Accept the default allocation
- Manually override the allocation

*(Allocation logic Specified in PS; manual override capability Inferred.)*

## 6. Hybrid Billing

The quote contains:

- One-time products
- A subscription product

Upon confirmation:

- The system generates an immediate invoice for one-time items.
- The system schedules recurring invoices for the subscription.

*(Specified in PS.)*

## 7. Customer Negotiation

Customer logs into their portal to request changes, such as a higher discount.

The backend recalculates:

- Totals
- Risk

If the new discount violates limits:

- The quote returns to approval.
- Previous approvals are invalidated.

*(Specified in PS.)*

## 8. Final Confirmation & Payment

After approvals, the customer confirms the quote.

The order is processed:

- Items are fulfilled.
- Some items may be backordered.
- Invoices are sent.
- Payment, including one-time and first subscription payment, is recorded.

*(Implied in PS final step.)*

---

# Functional Requirements

Each function is described with:

- Inputs
- Outputs
- Trigger conditions

Sources indicate whether the requirement was:

- **Specified in PS**
- **Inferred**
- **Team decision**

---

## User Authentication and Access Control

### Inputs

- Login credentials
- User role

### Outputs

- User session with role-based access

Supported roles:

- Sales Rep
- Manager
- Finance
- Customer
- Admin

### Trigger

User logs in.

### Notes

- Customer portal users can only see their own quotes. *(Specified in PS)*
- Admins can configure all settings. *(Inferred)*

---

## Quotation Creation & Editing

### Inputs

- Customer
- Currency
- Products
- Quantities
- Unit prices
- Discount percentages or amounts

### Outputs

Saved quotation draft containing:

- Line totals
- Subtotal
- Tax
- Discounts
- Net total
- Dynamic margin indicator
- Risk indicators

### Trigger

Sales Rep creates or updates a quote line.

### Details

The quote should accumulate line information into overall totals and margins in real time.

Margin update is **Specified in PS**.

### Source

Discount and margin logic are central to the PS.

---

## Discount Governance & Risk Scoring

### Inputs

- Customer tier
- Product category or margin type
- Applied discount percentage or amount on each line

### Outputs

- Decision flag indicating whether approval is required
- Risk score

### Trigger

Whenever the Sales Rep applies or changes a discount on any line.

### Details

For each quote line:

1. Compare discount against the allowed ceiling based on:
   - Customer tier
   - Product category
2. If a line exceeds its limit, mark that line as over-limit.
3. Compute a blended risk score for the entire quote.
4. Based on thresholds, determine the approval path:
   - None
   - Manager
   - Manager + Finance

### Source

**Specified in PS:**

- Rule per line
- Need for approval

**Team decision:**

- Exact blended score formula
- Exact threshold values

---

## Approval Workflow

### Inputs

Quote containing:

- Calculated risk score
- Required approvers

### Outputs

- Approval requests to the correct roles
- Updated quote status

### Trigger

After:

- Quote submission
- Any revision that changes approval status
- Customer negotiation

### Details

The system automatically routes quotes requiring approval.

Possible paths:

- Low risk → finalize quote
- Medium risk → Sales Manager
- High risk → Sales Manager → Finance

Each approver can:

- Approve
- Reject
- Return for Revision

Approvals and actions are recorded.

The quote's approval status and overall status should update accordingly.

### Source

**Specified in PS:**

- Automatic routing
- Multi-stage approval
- Manager/Finance approval

**Inferred:**

- Exact distinction between manager and finance levels must be defined.

---

## Upsell / Cross-sell Recommendation

### Inputs

- Current quote contents
- Products
- Categories
- Margin

### Outputs

List of suggested additional products with reasons, such as:

- Commonly paired
- Promotion
- Higher margin

### Trigger

Sales Rep:

- Views quote
- Adds items

### Details

Use:

- Historical co-purchase data
- Configured associations

to suggest add-ons.

Suggestions should be filtered to ensure minimum margin.

If the Sales Rep accepts a suggestion:

- Add it as a new quote line.
- Recalculate totals.

### Source

**Optional feature** according to the PS.

Team decision applies to the recommendation algorithm.

---

## Inventory / Warehouse Allocation

### Inputs

- Final confirmed quote
- Products
- Quantities
- Real-time inventory levels per warehouse
- Shipping cost/weight factors

### Outputs

Suggested split of each product quantity across one or more warehouses to optimize shipments.

The system should also indicate:

- Backorders needed

### Trigger

Once a quote is approved and confirmed/converted to an order.

Also re-evaluate if:

- Inventory changes
- Quote changes

### Details

Allocate stock from warehouses so that:

- Total shipments are minimized
- Available stock is considered
- Shipping cost is considered

Show an allocation proposal for review.

Allow Operations to manually override the proposal.

### Source

**Specified in PS:**

- Split across warehouses
- Cost-based logic

**Team decision:**

- Exact optimization algorithm

---

## Backorder Handling

### Inputs

- Allocation result
- Unmet quantities

### Outputs

- Backorder records for unfulfilled quantities
- Alerts when stock arrives

### Trigger

If allocation cannot fulfill the full order:

- Create a backorder.

When inventory is replenished:

- Identify relevant backorders.
- Notify users to ship.

### Details

The system should track incomplete fulfillment and automatically update order status once backordered items ship.

### Source

Implied by warehouse splitting scenario.

**Inferred from PS context.**

---

## Hybrid Billing — One-time + Recurring

### Inputs

Quote lines tagged as:

- One-time
- Recurring

Billing configuration:

- Billing period
- Proration rules

### Outputs

- One-time invoice(s) for one-time items
- Active subscription order for recurring items
- Scheduled recurring invoices

### Trigger

Quote confirmation.

### Details

One-time product lines generate an immediate invoice.

Subscription lines create a subscription record.

The subscription should:

- Generate the first invoice now or from the configured first billing date.
- Generate recurring invoices according to the schedule.

Supported schedules include:

- Monthly
- Quarterly
- Yearly

Mid-subscription changes to:

- Quantity
- Subscription

must apply proration.

### Source

**Specified in PS.**

---

## Subscription Proration and Credits

### Inputs

- Mid-cycle subscription changes
- Billing cycle details
- Quantity changes
- Cancellation

### Outputs

- Prorated invoice
- OR credit note
- OR applicable refund

### Trigger

Change or cancellation actions by:

- Sales Rep
- Customer

### Details

If a recurring line is upgraded or downgraded during a billing period:

- Charge or credit the remaining time appropriately.

If cancelled:

- Compute refund or credit for the remaining term.

The exact proration method must be defined.

### Source

PS requires proration.

**Specified:** Proration requirement.

**Team decision:** Exact calculation method, such as actual-day proration.

---

## Customer Portal / Negotiation

### Inputs

- Quotation details
- Customer requested changes
- New prices
- Quantities
- Comments

### Outputs

- Updated quote draft for Sales Rep/Manager review
- OR final confirmation

### Trigger

Customer:

- Submits a change request
- Accepts the quote

### Details

Customer sees a limited view.

The customer must not see:

- Internal costs
- Internal information

Customers can:

- Propose higher discounts
- Request other changes

The system:

1. Records the request.
2. Updates the quote draft.
3. Makes the request/comment visible to the Sales Rep.
4. Re-triggers discount/risk logic.

If the customer accepts:

- Mark the quote as confirmed.

### Source

**Specified in PS.**

Customer cannot see internal costs/margins.

---

## Audit Logging

### Inputs

All key actions, including:

- Quote edits
- Discount changes
- Approval decisions
- Portal requests

### Outputs

Audit log entries containing:

- Timestamp
- User
- Action
- Old values
- New values
- Comments

### Trigger

Any relevant state change, especially quote changes.

### Details

The log should be part of the quote record and visible to authorized users.

Examples:

> Sales Rep changed discount from 10% to 18%.

> Manager approved quote.

### Source

**Specified in PS.**

---

## Notifications & Alerts

### Inputs

Events such as:

- Approval needed
- Stock arrival for backorder
- Stalled deal

### Outputs

Potential notifications to relevant roles:

- Manager
- Operations
- Sales Rep

### Trigger

Significant events such as:

- Quote submitted for approval
- Backorder fulfillment ready
- Quote becoming stale

### Details

Examples:

- Email manager when approval is needed.
- Inform Sales Rep when stock is replenished.

### Source

**Inferred/Optional.**

The PS hints at automated nudges.

---

# Non-functional Requirements

## Usability

The interface should clearly separate:

- Sales user view
- Customer portal

Live updates should appear for:

- Margins
- Risk

without page reloads.

*(Inferred from PS emphasis on "live" data.)*

---

## Performance

Quote calculations should occur instantly for demo use, including:

- Discount calculation
- Allocation calculation
- Billing splits

---

## Security

Customer data and confidential costs must be protected.

Customers should:

- See only their own quotes.

Roles should:

- Not access unauthorized data.

Authentication should follow best practices.

Customer-restricted portal access is **Specified in PS**.

---

## Scalability

The system should handle:

- Multiple deals
- Multiple users
- Concurrent activity

However, high volume is not expected in the 8-hour hackathon MVP.

---

## Extensibility

Data models should allow future:

- Multi-currency
- Multi-company

support.

These are team decisions to mention but not necessarily implement due to time.

---

## Maintainability

Business rules should be configurable through UI or settings, including:

- Discount limits
- Approval chains
- Billing policies

---

## Reporting

The system should allow export of key reports to:

- PDF
- XLS

PDF/XLS reporting is **Specified as needed for final judging**.

---

# Data Entities — High-Level

## Quotation

The central aggregate.

Fields include:

- ID
- Customer
- Sales Rep
- Total amounts
- Margin
- Risk score
- Status
- Approval status

Related to:

- Quotation lines
- Approvals
- Audit logs
- Billing schedule

---

## Quotation Line

Linked to a Quotation.

Contains:

- Product
- Quantity
- Unit price
- Discount
- Line total
- Margin
- Category
- Subscription plan if recurring

---

## Customer

Business customer record with:

- Tier
- Credit limit attributes

Example tiers:

- Bronze
- Silver
- Gold

---

## Product

Item being sold.

Contains:

- Category
- List price
- Cost
- Tax
- Weight

Categories may include:

- Hardware
- Service
- Subscription

Some products may be marked recurring and associated with a Subscription Plan.

---

## Discount Policy

Configuration per:

- Customer Tier
- Product Category

Defines allowed discount ceilings.

Example:

- Gold + Hardware → maximum 15%
- Gold + Service → maximum 10%

---

## Approval Chain

Defines which roles approve at each risk level.

Example:

- Discount > X%
- Risk > Y

---

## Approval Request

Tracks an approval step.

Contains:

- Quote
- Approver
- Role
- Status
- Comments

Possible statuses:

- Pending
- Approved
- Rejected
- Returned

---

## Audit Log

Records changes involving:

- User
- Action
- Timestamp
- Details

Audit logs are tied to a Quotation.

---

## Warehouse & Inventory

Warehouse entity contains:

- Name
- Location
- Shipping cost factor

Inventory links:

- Warehouse
- Product
- Quantity

---

## Allocation Record

Records the suggested or selected warehouse split for a quotation.

---

## Subscription Plan

Defines recurring services.

Examples:

- Monthly
- Quarterly

---

## Subscription Instance

Represents a customer's active subscription derived from a quote line.

May contain:

- Next billing date
- Subscription details

---

## Billing Schedule

Linked to a quote or subscription.

Contains:

- Upcoming invoice
- Due date
- Amount

---

## Invoice / Order

Represents actual billing documents resulting from a confirmed quote.

This includes:

- One-time invoice
- Recurring invoices

---

## Deal Alert

Used for monitoring:

- Stalled deals
- Discount anomalies
- Delivery slippage

Alerts are shown in the dashboard.

---

# Quotation Lifecycle State Machine

Quotation states and transitions may include:

- **Draft**
- **Pending Approval**
- **Manager Review**
- **Finance Review**
- **Returned**
- **Approved**
- **Sent to Customer**
- **Under Negotiation**
- **Confirmed**
- **Fulfilling**
- **Partially Fulfilled**
- **Fulfilled**
- **Billed**
- **Paid**

Each transition is triggered by actions such as:

- Submit
- Approve
- Reject
- Return for revision
- Customer action
- Confirmation

## Draft

Initial state.

Sales Rep can edit freely.

*(Specified as starting state.)*

## Pending Approval / Manager Review / Finance Review

Intermediate states when approvals are needed.

## Returned

Quote returned to Sales Rep for revision.

## Approved

All required approvals obtained.

## Sent to Customer

Quote forwarded to customer portal.

## Under Negotiation

Customer is making requests.

## Confirmed

Customer formally accepts the quote.

## Fulfilling / Partially Fulfilled / Fulfilled

Warehouse is shipping items.

## Billed

Invoicing is complete and both one-time and recurring billing have been initiated.

## Paid

Final payments have been received.

### Approval Invalidation

Each transition is triggered by an appropriate action.

The AI agent must enforce that **any change in price/discount after approval returns the quote to Pending Approval**, invalidating prior approvals.

*(Specified in PS.)*

---

# Business Rules — Core Logic

## Customer Tiers & Discount Ceilings

Each customer belongs to a tier.

Examples:

- Bronze
- Silver
- Gold

Each tier has base discount limits per category.

### Example

Gold customers:

- Hardware → up to 15%
- Services → up to 10%

### Rule

If a quote line's discount exceeds the applicable tier + category limit:

- Mark the line as over the limit.
- Require approval.

*(Specified in PS.)*

---

## Line-by-Line Checks

Evaluate each quote line independently against its allowed discount.

Overall approval requires checking all lines.

*(Specified.)*

---

## Blended Risk Score

Small over-discounts on multiple lines should aggregate into a deal-level risk.

Current proposed implementation:

```text
Risk = sum of line_over% for all over-limit lines