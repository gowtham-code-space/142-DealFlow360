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
    console.error(`[Database] Connection failed in '${DB_MODE}' mode:`, error.message);
    process.exit(1);
  }
};

prisma.connectDB = connectDB;
prisma.prisma = prisma;

module.exports = prisma;
