const fs = require('fs');
const path = require('path');

const docsDir = path.resolve(__dirname, '..', 'docs');
const pathsDir = path.join(docsDir, 'paths');
const schemasDir = path.join(docsDir, 'schemas');
const componentsDir = path.join(docsDir, 'components');

// 1. Update Auth Paths
const authYamlContent = `# ═══════════════════════════════════════════
# AUTH
# ═══════════════════════════════════════════

/v1/auth/signup:
  post:
    tags: [Auth]
    summary: Customer self-registration
    description: |
      Creates a new Customer account with \`free\` tier. No admin involvement needed.
      Returns \`accessToken\` (JWT with \`userId\` and \`roleId\`) in response body.
      Sets \`refreshToken\` as an HttpOnly SameSite cookie.
    operationId: authSignup
    security: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [name, email, password]
            properties:
              name:
                type: string
                example: Arjun Mehta
              email:
                type: string
                format: email
                example: arjun@company.com
              password:
                type: string
                minLength: 8
                example: SecurePass@123
              phone:
                type: string
                example: "+919876543210"
    responses:
      '201':
        description: Customer account created successfully
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/ApiSuccessResponse'
                - type: object
                  properties:
                    data:
                      $ref: '#/components/schemas/TokenResponse'
      '400':
        $ref: '#/components/responses/BadRequest'
      '409':
        description: Email already registered
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ApiErrorResponse'
            example:
              success: false
              message: "An account with this email already exists"
              data: null
      '500':
        $ref: '#/components/responses/InternalError'

/v1/auth/google:
  post:
    tags: [Auth]
    summary: Login / Signup with Google OAuth
    description: |
      Authenticates user or customer using Google OAuth ID token (Google Sign-In / One Tap).
      - If user exists, logs them in.
      - If user is new and authenticating as customer, automatically registers them with \`free\` tier.
      - Returns \`accessToken\` (JWT containing \`userId\` and \`roleId\`) in response body.
      - Sets \`refreshToken\` in HttpOnly SameSite=Strict cookie.
    operationId: authGoogle
    security: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [idToken]
            properties:
              idToken:
                type: string
                description: Google OAuth 2.0 ID Token obtained from Google Identity Services
                example: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMyJ9..."
              accountType:
                type: string
                enum: [customer, internal]
                default: customer
                description: Requested account type for first-time Google signups
    responses:
      '200':
        description: Google authentication successful
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/ApiSuccessResponse'
                - type: object
                  properties:
                    data:
                      $ref: '#/components/schemas/TokenResponse'
      '400':
        $ref: '#/components/responses/BadRequest'
      '401':
        description: Invalid or expired Google token
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ApiErrorResponse'
            example:
              success: false
              message: "Invalid Google OAuth ID Token"
              data: null
      '500':
        $ref: '#/components/responses/InternalError'

/v1/auth/login:
  post:
    tags: [Auth]
    summary: Internal user login
    description: |
      Login for admin / manager / sales_rep / finance users.
      Returns \`accessToken\` (JWT containing \`userId\` and \`roleId\`) in response body.
      Sets \`refreshToken\` as an HttpOnly SameSite cookie.
    operationId: authLogin
    security: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [email, password]
            properties:
              email:
                type: string
                format: email
                example: manager@dealflow360.com
              password:
                type: string
                example: MyPassword@123
    responses:
      '200':
        description: Login successful — access token alone in body, refresh token in HttpOnly cookie
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/ApiSuccessResponse'
                - type: object
                  properties:
                    data:
                      $ref: '#/components/schemas/TokenResponse'
      '400':
        $ref: '#/components/responses/BadRequest'
      '401':
        description: Invalid credentials
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ApiErrorResponse'
            example:
              success: false
              message: "Invalid email or password"
              data: null
      '500':
        $ref: '#/components/responses/InternalError'

/v1/auth/portal/login:
  post:
    tags: [Auth]
    summary: Customer portal login
    description: |
      Login for customers accessing the portal.
      Returns \`accessToken\` (JWT containing \`userId\` and \`roleId\`) in response body.
      Sets \`refreshToken\` cookie (HttpOnly, SameSite=Strict).
    operationId: authPortalLogin
    security: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [email, password]
            properties:
              email:
                type: string
                format: email
              password:
                type: string
    responses:
      '200':
        description: Portal login successful — access token returned
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/ApiSuccessResponse'
                - type: object
                  properties:
                    data:
                      $ref: '#/components/schemas/TokenResponse'
      '400':
        $ref: '#/components/responses/BadRequest'
      '401':
        $ref: '#/components/responses/Unauthorized'
      '500':
        $ref: '#/components/responses/InternalError'

/v1/auth/refresh:
  post:
    tags: [Auth]
    summary: Refresh access token
    description: Reads refresh token from HttpOnly cookie, returns new access token (with \`userId\` and \`roleId\`) in body.
    operationId: authRefresh
    security: []
    responses:
      '200':
        description: New access token issued
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/ApiSuccessResponse'
                - type: object
                  properties:
                    data:
                      $ref: '#/components/schemas/TokenResponse'
      '401':
        description: Refresh token missing, invalid, or revoked
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ApiErrorResponse'
            example:
              success: false
              message: "Refresh token not found or has been revoked — please log in again"
              data: null
      '500':
        $ref: '#/components/responses/InternalError'

/v1/auth/logout:
  post:
    tags: [Auth]
    summary: Logout — clear refresh cookie
    description: Server-side invalidation of refresh token. Clears the HttpOnly cookie.
    operationId: authLogout
    security:
      - BearerAuth: []
    responses:
      '200':
        description: Logged out successfully
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ApiSuccessResponse'
      '401':
        $ref: '#/components/responses/Unauthorized'
      '500':
        $ref: '#/components/responses/InternalError'

/v1/auth/me:
  get:
    tags: [Auth]
    summary: Get current user profile
    operationId: authMe
    security:
      - BearerAuth: []
    responses:
      '200':
        description: Current user profile and role details
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/ApiSuccessResponse'
                - type: object
                  properties:
                    data:
                      oneOf:
                        - $ref: '#/components/schemas/UserPublic'
                        - $ref: '#/components/schemas/CustomerPublic'
      '401':
        $ref: '#/components/responses/Unauthorized'

/v1/auth/me/password:
  patch:
    tags: [Auth]
    summary: Change own password
    operationId: authChangePassword
    security:
      - BearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [currentPassword, newPassword]
            properties:
              currentPassword:
                type: string
              newPassword:
                type: string
                minLength: 8
    responses:
      '200':
        description: Password changed successfully
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ApiSuccessResponse'
      '400':
        $ref: '#/components/responses/BadRequest'
      '401':
        $ref: '#/components/responses/Unauthorized'
      '500':
        $ref: '#/components/responses/InternalError'
`;

fs.writeFileSync(path.join(pathsDir, 'auth.yaml'), authYamlContent, 'utf8');
console.log('Updated auth.yaml');

// 2. Prepend /v1/ across all other path files if needed
const pathFiles = fs.readdirSync(pathsDir);
pathFiles.forEach(file => {
  if (file === 'auth.yaml') return;
  const filePath = path.join(pathsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  // Replace lines starting with `/` that do not start with `/v1/`
  content = content.replace(/^(\/(?!v1\/)[a-zA-Z0-9_\-\/{}]+):/gm, '/v1$1:');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated path prefix /v1 for:', file);
});

// 3. Update Auth/User Schemas with TokenResponse
const authUsersSchemaContent = `# ─── Auth & User Schemas ─────────────────

TokenResponse:
  type: object
  description: Authentication token payload. Decoded JWT contains userId and roleId.
  properties:
    accessToken:
      type: string
      description: Short-lived JWT (15 min). Encodes { userId, roleId } in token payload. Store in client memory only.
      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    tokenType:
      type: string
      example: "Bearer"
    expiresIn:
      type: integer
      description: Token expiration duration in seconds
      example: 900

UserPublic:
  type: object
  properties:
    id:
      type: string
      example: usr_01HXYZ123
    name:
      type: string
      example: David Keller
    email:
      type: string
      format: email
      example: david.keller@dealflow360.com
    role:
      type: string
      enum: [admin, sales_rep, sales_manager, finance_ops]
      example: sales_manager
    roleId:
      type: string
      description: Unique identifier for the assigned role
      example: role_mgr_01
    isActive:
      type: boolean
      example: true
    createdAt:
      type: string
      format: date-time

CreateUserRequest:
  type: object
  required: [name, email, password, role]
  properties:
    name:
      type: string
    email:
      type: string
      format: email
    password:
      type: string
      minLength: 8
    role:
      type: string
      enum: [admin, sales_rep, sales_manager, finance_ops]
`;
fs.writeFileSync(path.join(schemasDir, 'auth_users.yaml'), authUsersSchemaContent, 'utf8');
console.log('Updated auth_users.yaml');

// 4. Update Customers Schema for duration-based premium & creditLimit
const customersSchemaContent = `# ─── Customer Schemas ────────────────────

CustomerPublic:
  type: object
  properties:
    id:
      type: string
      example: cust_01HXYZ999
    name:
      type: string
      example: Apex Global Technologies
    email:
      type: string
      example: procurement@apextech.com
    tier:
      type: string
      enum: [free, premium]
      example: premium
    isActive:
      type: boolean
      example: true
    subscriptionDurationDays:
      type: integer
      nullable: true
      description: Total active subscription duration in days for premium accounts
      example: 365
    subscriptionExpiresAt:
      type: string
      format: date-time
      nullable: true
      description: Active subscription expiry date. Premium access remains valid for this duration without points/credit-limit restrictions.
      example: "2027-09-05T00:00:00Z"
    createdAt:
      type: string
      format: date-time

Customer:
  allOf:
    - $ref: '#/components/schemas/CustomerPublic'
    - type: object
      properties:
        phone:
          type: string
          example: "+1-555-0199"
        address:
          type: string
          example: "100 Innovation Way, Suite 400, Austin, TX"
        locationLat:
          type: number
          nullable: true
          example: 30.2672
        locationLng:
          type: number
          nullable: true
          example: -97.7431
        creditLimit:
          type: string
          nullable: true
          description: >-
            Applicable only to standard/credit accounts. For premium subscribers, creditLimit is null
            and access is active as per subscription duration (no points/credit limits involved).
          example: null
        orderCount:
          type: integer
          description: Total confirmed orders — used for consistency discount eligibility
          example: 12

CreateCustomerRequest:
  type: object
  required: [name, email]
  properties:
    name:
      type: string
      example: "Nexus Enterprises"
    email:
      type: string
      format: email
      example: "billing@nexus.com"
    password:
      type: string
      minLength: 8
    phone:
      type: string
    tier:
      type: string
      enum: [free, premium]
      default: free
    subscriptionDurationDays:
      type: integer
      description: Duration in days when creating or onboarding a premium tier customer
      example: 365
    creditLimit:
      type: string
      nullable: true
      description: Applicable only for non-premium/standard accounts. Leave null for premium subscribers.
      example: null
    address:
      type: string
    locationLat:
      type: number
    locationLng:
      type: number
`;
fs.writeFileSync(path.join(schemasDir, 'customers.yaml'), customersSchemaContent, 'utf8');
console.log('Updated customers.yaml');

// 5. Rebuild root openapi.yaml
require('./build_openapi.js');

// 6. Build bundled swagger.yaml with /v1/ paths
const buildBundledSwagger = () => {
  let bundled = `openapi: 3.0.3

info:
  title: DealFlow360 API
  version: 2.0.0
  description: |
    Complete REST API for **DealFlow360** — an intelligent, self-governing B2B Sales Operations Platform.

    ## Key Capabilities
    - Multi-type stacking discount governance (product + bulk + consistency + premium + variant)
    - Automatic approval routing (Sales Rep only OR Sales Rep + Manager)
    - Normal pool vs Premium/Bulk pool inventory management with refundable deposit
    - Nearest-warehouse fulfillment allocation for hardware products
    - SaaS/software license products with recurring subscription billing
    - Customer portal negotiation via formal ticket system (hold → accept/reject → deadline)
    - Deal health dashboard and region-based demand recommendations for Finance/Ops
    - Full audit trail

    ## Authentication
    - **Google OAuth Login / Signup**: \`POST /v1/auth/google\`
    - **Internal users**: \`POST /v1/auth/login\`
    - **Customers**: \`POST /v1/auth/signup\` or \`POST /v1/auth/portal/login\`
    - **Token Model**: Access token returned in response body (contains \`userId\` and \`roleId\`). Client stores in-memory only. Refresh token set in \`HttpOnly, SameSite=Strict\` cookie.

    ## Customer Tiers & Credit Model
    - **Free Tier**: Standard access, optional post-paid creditLimit.
    - **Premium Tier**: Active as per subscription duration (duration-based access, no points or creditLimit constraint).

    ## Product Types
    - \`hardware\` — Physical goods. Has inventory, warehouse allocation, pool management.
    - \`software\` — SaaS/license. No warehouse. Generates subscriptions. No pool logic.

  contact:
    name: DealFlow360 Team

servers:
  - url: http://localhost:5000/api
    description: Local Development (API Base)
  - url: https://api.dealflow360.com
    description: Production

tags:
  - name: Auth
    description: Login, Google OAuth, signup, token refresh, logout
  - name: Users
    description: Internal user management (admin only), soft delete, bulk upload
  - name: Customers
    description: Customer records and tier management
  - name: Products
    description: Hardware and software products, variants, price lists
  - name: Config
    description: System configuration — discount policies, approval chains, pool config, subscription plans, upsell rules
  - name: Warehouses
    description: Warehouse management, inventory stock levels, pool breakdown
  - name: Quotations
    description: Quote lifecycle — create, submit, approve, send to customer, deposit
  - name: QuoteLines
    description: Quote line management with full 5-type discount breakdown
  - name: Approvals
    description: Approval request management (Level 1 sales_rep, Level 2 manager)
  - name: Recommendations
    description: Upsell and cross-sell product suggestions
  - name: Fulfillment
    description: Nearest-warehouse allocation and backorder management
  - name: Billing
    description: Invoices, subscriptions, proration previews, payments
  - name: Negotiation
    description: Negotiation ticket management (internal team view)
  - name: Portal
    description: Customer-facing portal — restricted view, negotiation tickets, deposit, confirmation
  - name: Dashboard
    description: Deal health, KPIs, pool health, region demand
  - name: Reports
    description: Filterable reports with PDF/XLS export
  - name: AuditLogs
    description: Full audit trail per quote and globally
  - name: Notifications
    description: In-app notification management

paths:
`;

  // Append each path file indented by 2 spaces
  const pathFilesList = fs.readdirSync(pathsDir);
  pathFilesList.forEach(file => {
    const pContent = fs.readFileSync(path.join(pathsDir, file), 'utf8');
    const pLines = pContent.split('\n');
    pLines.forEach(l => {
      if (l.trim() === '') {
        bundled += '\n';
      } else {
        bundled += '  ' + l + '\n';
      }
    });
  });

  bundled += `
components:

  # ═══════════════════════════════════════════
  # SECURITY SCHEMES
  # ═══════════════════════════════════════════
`;

  const secContent = fs.readFileSync(path.join(componentsDir, 'securitySchemes.yaml'), 'utf8');
  secContent.split('\n').forEach(l => {
    bundled += (l.trim() === '' ? '\n' : '    ' + l + '\n');
  });

  bundled += `
  # ═══════════════════════════════════════════
  # REUSABLE PARAMETERS
  # ═══════════════════════════════════════════
`;

  const paramContent = fs.readFileSync(path.join(componentsDir, 'parameters.yaml'), 'utf8');
  paramContent.split('\n').forEach(l => {
    bundled += (l.trim() === '' ? '\n' : '    ' + l + '\n');
  });

  bundled += `
  # ═══════════════════════════════════════════
  # REUSABLE RESPONSES
  # ═══════════════════════════════════════════
`;

  const respContent = fs.readFileSync(path.join(componentsDir, 'responses.yaml'), 'utf8');
  respContent.split('\n').forEach(l => {
    bundled += (l.trim() === '' ? '\n' : '    ' + l + '\n');
  });

  bundled += `
  # ═══════════════════════════════════════════
  # SCHEMAS
  # ═══════════════════════════════════════════
`;

  const schemaFilesList = fs.readdirSync(schemasDir);
  schemaFilesList.forEach(file => {
    const sContent = fs.readFileSync(path.join(schemasDir, file), 'utf8');
    sContent.split('\n').forEach(l => {
      bundled += (l.trim() === '' ? '\n' : '    ' + l + '\n');
    });
  });

  bundled += `
security:
  - BearerAuth: []
`;

  fs.writeFileSync(path.join(docsDir, 'swagger.yaml'), bundled, 'utf8');
  console.log('Built bundled docs/swagger.yaml successfully!');
};

buildBundledSwagger();
