require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/dealflow360',
  JWT_SECRET: process.env.JWT_SECRET || 'dealflow360_secret_key_secure'
};
