const { PrismaClient } = require('@prisma/client');
const { DATABASE_URL, DB_MODE } = require('./env');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log(`[Database] Connected successfully in '${DB_MODE}' mode.`);
  } catch (error) {
    console.warn(`[Database] Initial connection notice in '${DB_MODE}' mode:`, error.message);
    console.warn(`[Database] Server proceeding to handle requests and will retry DB connection on demand.`);
  }
};

prisma.connectDB = connectDB;
prisma.prisma = prisma;

module.exports = prisma;
