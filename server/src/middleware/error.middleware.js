const { NODE_ENV } = require('../config/env');

const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Prisma Error Handling
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        statusCode = 409;
        message = `Unique constraint violation on field(s): ${err.meta?.target || 'unknown'}`;
        break;
      case 'P2025':
        statusCode = 404;
        message = err.meta?.cause || 'Record not found';
        break;
      case 'P2003':
        statusCode = 400;
        message = `Foreign key constraint failed on field: ${err.meta?.field_name || 'unknown'}`;
        break;
      default:
        break;
    }
  }

  // Handle JSON body parse syntax errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON payload in request body';
  }

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorMiddleware;
