const fs = require('fs');
const path = require('path');

const docsDir = path.resolve(__dirname, '..', 'docs');
const pathsDir = path.join(docsDir, 'paths');
const schemasDir = path.join(docsDir, 'schemas');
const componentsDir = path.join(docsDir, 'components');

// 1. Update all path files to have /api/v1/ prefix
const pathFiles = fs.readdirSync(pathsDir);
pathFiles.forEach(file => {
  const filePath = path.join(pathsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace /v1/ or / with /api/v1/
  content = content.replace(/^(\/(?:api\/v1\/|v1\/|(?=[a-zA-Z0-9_\-\/{}])))/gm, (match) => {
    return '/api/v1/';
  });
  // Clean up any double /api/v1//api/v1/
  content = content.replace(/\/api\/v1\/(?:api\/v1\/|v1\/)/g, '/api/v1/');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated to /api/v1/ for:', file);
});

// 2. Build root openapi.yaml
const buildOpenApiRoot = () => {
  const allPathFiles = fs.readdirSync(pathsDir);
  const allSchemaFiles = fs.readdirSync(schemasDir);

  let lines = [
    'openapi: 3.0.3',
    '',
    'info:',
    '  title: DealFlow360 API',
    '  version: 2.0.0',
    '  description: |',
    '    Complete REST API for **DealFlow360** — an intelligent, self-governing B2B Sales Operations Platform.',
    '',
    '    ## Key Capabilities',
    '    - Multi-type stacking discount governance (product + bulk + consistency + premium + variant)',
    '    - Automatic approval routing (Sales Rep only OR Sales Rep + Manager)',
    '    - Normal pool vs Premium/Bulk pool inventory management with refundable deposit',
    '    - Nearest-warehouse fulfillment allocation for hardware products',
    '    - SaaS/software license products with recurring subscription billing',
    '    - Customer portal negotiation via formal ticket system (hold -> accept/reject -> deadline)',
    '    - Deal health dashboard and region-based demand recommendations for Finance/Ops',
    '    - Full audit trail',
    '',
    '    ## Authentication',
    '    - Google OAuth: POST /api/v1/auth/google',
    '    - Internal users: POST /api/v1/auth/login',
    '    - Customers: POST /api/v1/auth/signup or POST /api/v1/auth/portal/login',
    '    - Access token in response body (in-memory only)',
    '    - Refresh token in HttpOnly SameSite=Strict cookie',
    '',
    '    ## Product Types',
    '    - hardware: Physical goods with inventory, warehouse allocation, pool management',
    '    - software: SaaS/license, no warehouse, recurring subscription plans',
    '',
    '  contact:',
    '    name: DealFlow360 Team',
    '',
    'servers:',
    '  - url: http://localhost:5000',
    '    description: Local Development Server',
    '  - url: https://api.dealflow360.com',
    '    description: Production Server',
    '',
    'tags:',
    '  - name: Auth',
    '  - name: Users',
    '  - name: Customers',
    '  - name: Products',
    '  - name: Config',
    '  - name: Warehouses',
    '  - name: Quotations',
    '  - name: QuoteLines',
    '  - name: Approvals',
    '  - name: Recommendations',
    '  - name: Fulfillment',
    '  - name: Billing',
    '  - name: Negotiation',
    '  - name: Portal',
    '  - name: Dashboard',
    '  - name: Reports',
    '  - name: AuditLogs',
    '  - name: Notifications',
    '',
    'paths:'
  ];

  allPathFiles.forEach(file => {
    const content = fs.readFileSync(path.join(pathsDir, file), 'utf8');
    const pathMatches = content.match(/^(\/api\/v1\/[a-zA-Z0-9_\-\/{}]+):/gm);
    if (pathMatches) {
      pathMatches.forEach(p => {
        const endpoint = p.replace(':', '').trim();
        lines.push('  ' + endpoint + ':');
        lines.push('    $ref: ' + JSON.stringify('./paths/' + file + '#' + endpoint));
      });
    }
  });

  lines.push('');
  lines.push('components:');
  lines.push('  securitySchemes:');
  lines.push('    BearerAuth:');
  lines.push('      type: http');
  lines.push('      scheme: bearer');
  lines.push('      bearerFormat: JWT');
  lines.push('      description: JWT Access Token (contains userId and roleId)');
  lines.push('');
  lines.push('  schemas:');

  const forbiddenKeys = ['type', 'properties', 'required', 'example', 'description', 'enum', 'items', 'nullable', 'format', 'default', 'minimum', 'maximum'];

  allSchemaFiles.forEach(file => {
    const content = fs.readFileSync(path.join(schemasDir, file), 'utf8');
    const schemaMatches = content.match(/^([a-zA-Z0-9_]+):/gm);
    if (schemaMatches) {
      schemaMatches.forEach(s => {
        const schemaName = s.replace(':', '').trim();
        if (!forbiddenKeys.includes(schemaName)) {
          lines.push('    ' + schemaName + ':');
          lines.push('      $ref: ' + JSON.stringify('./schemas/' + file + '#' + schemaName));
        }
      });
    }
  });

  lines.push('');
  lines.push('security:');
  lines.push('  - BearerAuth: []');

  fs.writeFileSync(path.join(docsDir, 'openapi.yaml'), lines.join('\n'), 'utf8');
  console.log('openapi.yaml generated successfully! Total lines:', lines.length);
};

buildOpenApiRoot();

// 3. Build standalone bundled swagger.yaml
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
    - **Google OAuth Login / Signup**: \`POST /api/v1/auth/google\`
    - **Internal users**: \`POST /api/v1/auth/login\`
    - **Customers**: \`POST /api/v1/auth/signup\` or \`POST /api/v1/auth/portal/login\`
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
  - url: http://localhost:5000
    description: Local Development Server
  - url: https://api.dealflow360.com
    description: Production Server

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
  console.log('Built bundled docs/swagger.yaml with /api/v1/ paths successfully!');
};

buildBundledSwagger();
