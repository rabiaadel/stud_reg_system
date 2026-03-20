const { Pool } = require('pg');
const { db } = require('./config');

const pool = new Pool({
  host: db.host,
  port: db.port,
  database: db.name,
  user: db.user,
  password: db.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: db.ssl,
});

// Event handlers for monitoring
pool.on('connect', (client) => {
  console.log('New client connected to the database');
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

pool.on('remove', (client) => {
  console.log('Client removed from pool');
});

module.exports = { pool };
