const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const errorHandler = require("./middleware/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

// Serve static docs directory (swagger.yaml, openapi.yaml, paths, schemas)
app.use("/docs", express.static(path.join(__dirname, "../docs")));

// Raw swagger.yaml endpoint
app.get("/api-docs/swagger.yaml", (req, res) => {
  res.sendFile(path.join(__dirname, "../docs/swagger.yaml"));
});

// Interactive Swagger UI via CDN (no extra npm packages required)
app.get(["/api-docs", "/docs-ui"], (req, res) => {
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

// Interactive Redoc view
app.get("/redoc", (req, res) => {
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
app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "ok",
    service: "DealFlow360 Backend API",
    version: "2.0.0",
    docs: "/api-docs"
  });
});

app.get("/", (req, res) => {
  res.redirect("/api-docs");
});

app.use(errorHandler);

module.exports = app;

