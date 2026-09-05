const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

// Placeholder for routes
// app.use("/api/auth", require("./auth/auth.routes"));

app.use(errorHandler);

module.exports = app;
