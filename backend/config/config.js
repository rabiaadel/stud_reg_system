require('dotenv').config();

const parseList = (value, fallback) =>
  (value || fallback || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

module.exports = {
  server: {
    port: parseInt(process.env.PORT || process.env.SERVER_PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
    corsOrigins: parseList(process.env.CORS_ORIGINS, 'http://localhost:3000,http://localhost:3001'),
    rateLimitWindowMinutes: parseInt(process.env.RATE_LIMIT_WINDOW || '15', 10),
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000', 10),
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'student_registration_system',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  },
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiry: process.env.JWT_EXPIRY || '7d',
  },
};
