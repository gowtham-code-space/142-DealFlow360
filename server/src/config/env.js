const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const DB_MODE = process.env.DB_MODE;

const getDatabaseUrl = () => {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') {
    return process.env.DATABASE_URL;
  }

  if (DB_MODE === 'local') {
    const host = process.env.LOCAL_DB_HOST;
    const port = process.env.LOCAL_DB_PORT;
    const user = process.env.LOCAL_DB_USER;
    const password = process.env.LOCAL_DB_PASSWORD;
    const database = process.env.LOCAL_DB_DATABASE;
    const auth = password ? `${user}:${encodeURIComponent(password)}` : user;
    return `mysql://${auth}@${host}:${port}/${database}`;
  }

  // Cloud TiDB Database
  const host = process.env.TIDB_HOST;
  const port = process.env.TIDB_PORT;
  const user = process.env.TIDB_USER;
  const password = process.env.TIDB_PASSWORD;
  const database = process.env.TIDB_DATABASE;
  return `mysql://${user}:${encodeURIComponent(password)}@${host}:${port}/${database}?sslaccept=strict`;
};

module.exports = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  DB_MODE,
  DATABASE_URL: getDatabaseUrl(),
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN
};
