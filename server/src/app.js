const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const errorMiddleware = require('./middleware/error.middleware');
const { notFoundResponse } = require('./utils/response');
const { CORS_ORIGIN } = require('./config/env');

// Feature Routers
const authRoutes = require('./features/auth/auth.routes');
const usersRoutes = require('./features/users/users.routes');
const customersRoutes = require('./features/customers/customers.routes');
const productsRoutes = require('./features/products/products.routes');
const priceListsRoutes = require('./features/products/pricelists.routes');
const configRoutes = require('./features/config/config.routes');
const warehousesRoutes = require('./features/warehouses/warehouses.routes');
const inventoryRoutes = require('./features/inventory/inventory.routes');
const quotationsRoutes = require('./features/quotations/quotations.routes');
const approvalsRoutes = require('./features/approvals/approvals.routes');
const fulfillmentRoutes = require('./features/fulfillment/fulfillment.routes');
const billingRoutes = require('./features/billing/billing.routes');
const negotiationRoutes = require('./features/negotiation/negotiation.routes');
const dashboardRoutes = require('./features/dashboard/dashboard.routes');
const auditRoutes = require('./features/audit/audit.routes');
const notificationsRoutes = require('./features/notifications/notifications.routes');
const recommendationsRoutes = require('./features/recommendations/recommendations.routes');
const reportsRoutes = require('./features/reports/reports.routes');
const portalRoutes = require('./features/portal/portal.routes');

const app = express();

// Restricted CORS Configuration
const allowedOrigins = CORS_ORIGIN;

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or Postman) or matched allowed origins
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy restriction: Origin '${origin}' is not allowed`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Mount API Routers (supporting both /api/v1 and /api)
const mountRouters = (prefix) => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/users`, usersRoutes);
  app.use(`${prefix}/customers`, customersRoutes);
  app.use(`${prefix}/products`, productsRoutes);
  app.use(`${prefix}/price-lists`, priceListsRoutes);
  app.use(`${prefix}/config`, configRoutes);
  app.use(`${prefix}/warehouses`, warehousesRoutes);
  app.use(`${prefix}/inventory`, inventoryRoutes);
  app.use(`${prefix}/quotes`, quotationsRoutes);
  app.use(`${prefix}/approvals`, approvalsRoutes);
  app.use(prefix, fulfillmentRoutes);
  app.use(prefix, billingRoutes);
  app.use(prefix, negotiationRoutes);
  app.use(prefix, dashboardRoutes);
  app.use(prefix, auditRoutes);
  app.use(prefix, notificationsRoutes);
  app.use(prefix, recommendationsRoutes);
  app.use(prefix, reportsRoutes);
  app.use(prefix, portalRoutes);
};

mountRouters('/api/v1');
mountRouters('/api');

// Serve OpenAPI / Swagger Documentation
app.use('/docs', express.static(path.join(__dirname, '../docs')));

app.get('/api-docs/swagger.yaml', (req, res) => {
  res.sendFile(path.join(__dirname, '../docs/swagger.yaml'));
});

app.get(['/api-docs', '/docs-ui'], (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>DealFlow360 API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin:0; background: #fafafa; }
    .topbar { display: none !important; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: "/api-docs/swagger.yaml",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>`);
});

app.get('/redoc', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
  <head>
    <title>DealFlow360 API - ReDoc</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
    <style>body { margin: 0; padding: 0; }</style>
  </head>
  <body>
    <redoc spec-url='/api-docs/swagger.yaml'></redoc>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
  </body>
</html>`);
});

// Health check endpoint
app.get(['/api/v1/health', '/api/health'], (req, res) => {
  res.json({
    status: 'ok',
    service: 'DealFlow360 Backend API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    docs: '/api-docs'
  });
});

app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// 404 Handler for undefined routes
app.use((req, res) => {
  return notFoundResponse(res, `Route ${req.method} ${req.originalUrl} not found`);
});

// Centralized Error Handling Middleware
app.use(errorMiddleware);

module.exports = app;
