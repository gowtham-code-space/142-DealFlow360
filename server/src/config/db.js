const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('[Database] ✅ Prisma connected to MySQL successfully');
  } catch (err) {
    console.warn(`[Database] ⚠️ Prisma connection warning: ${err.message}. Check your DATABASE_URL in .env`);
  }
};

module.exports = { prisma, connectDB };
