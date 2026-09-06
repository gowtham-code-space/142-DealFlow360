const app = require('./src/app');
const { PORT, DB_MODE } = require('./src/config/env');
const { connectDB, prisma } = require('./src/config/db');
const { initSocket } = require('./src/socket');

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`[Server] DealFlow360 API running on port ${PORT} (${DB_MODE} mode)`);
      console.log(`[Docs] Interactive Swagger UI: http://localhost:${PORT}/api-docs`);
      console.log(`[Docs] ReDoc Viewer: http://localhost:${PORT}/redoc`);
    });

    initSocket(server);

    const shutdown = async () => {
      console.log('\n[Server] Shutting down gracefully...');
      server.close(async () => {
        await prisma.$disconnect();
        console.log('[Server] Database disconnected. Process terminated.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('[Server] Fatal startup error:', error.message);
    process.exit(1);
  }
};

startServer();
