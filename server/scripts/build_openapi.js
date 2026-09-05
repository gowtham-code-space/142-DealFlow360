const fs = require('fs');
const path = require('path');

const docsDir = path.resolve(__dirname, '..', 'docs');
const pathsDir = path.join(docsDir, 'paths');
const schemasDir = path.join(docsDir, 'schemas');

const pathFiles = fs.readdirSync(pathsDir);
const schemaFiles = fs.readdirSync(schemasDir);

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
  '    - Internal users: POST /auth/login',
  '    - Customers: POST /auth/signup then POST /auth/portal/login',
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
  '  - url: http://localhost:5000/api/v1',
  '    description: Local Development',
  '  - url: https://api.dealflow360.com/v1',
  '    description: Production',
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

pathFiles.forEach(file => {
  const content = fs.readFileSync(path.join(pathsDir, file), 'utf8');
  const pathMatches = content.match(/^(\/[a-zA-Z0-9_\-\/{}]+):/gm);
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
lines.push('      description: JWT Access Token');
lines.push('');
lines.push('  schemas:');

const forbiddenKeys = ['type', 'properties', 'required', 'example', 'description', 'enum', 'items', 'nullable', 'format', 'default', 'minimum', 'maximum'];

schemaFiles.forEach(file => {
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
