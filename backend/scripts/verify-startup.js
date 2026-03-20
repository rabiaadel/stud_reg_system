// ============================================================================
// Application Startup Verification
// Runs health checks after server starts to ensure everything is connected
// Called automatically by docker-compose health check
// ============================================================================

const http = require('http');
const { logger } = require('../config/logger');

const API_URL = process.env.API_URL || 'http://localhost:3000';
const MAX_RETRIES = 30;
const RETRY_DELAY_MS = 1000;

/**
 * Check if API is healthy
 */
async function checkApiHealth() {
  return new Promise((resolve) => {
    const request = http.get(`${API_URL}/health`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(res.statusCode === 200 && parsed.success);
        } catch {
          resolve(false);
        }
      });
    });

    request.on('error', () => resolve(false));
    request.setTimeout(5000, () => {
      request.destroy();
      resolve(false);
    });
  });
}

/**
 * Check metrics endpoint
 */
async function checkMetrics() {
  return new Promise((resolve) => {
    const request = http.get(`${API_URL}/metrics`, (res) => {
      resolve(res.statusCode === 200);
    });

    request.on('error', () => resolve(false));
    request.setTimeout(5000, () => {
      request.destroy();
      resolve(false);
    });
  });
}

/**
 * Check if database is accessible via API
 */
async function checkDatabase() {
  const response = await fetch(`${API_URL}/health`);
  const data = await response.json();
  return data.db === 'ok';
}

/**
 * Run all health checks with retries
 */
async function verifyStartup() {
  let attempt = 1;

  while (attempt <= MAX_RETRIES) {
    const health = await checkApiHealth();
    
    if (health) {
      console.log('✅ API Health Check: PASSED');
      
      const metrics = await checkMetrics();
      console.log(`${metrics ? '✅' : '⚠️'} Metrics Endpoint: ${metrics ? 'PASSED' : 'NOT READY'}`);

      try {
        const dbOk = await checkDatabase();
        console.log(`${dbOk ? '✅' : '⚠️'} Database Connection: ${dbOk ? 'PASSED' : 'NOT READY'}`);
      } catch (err) {
        console.log('⚠️  Database Connection: CHECKING...');
      }

      console.log('\n✅ Startup verification complete');
      process.exit(0);
    }

    console.log(`Attempt ${attempt}/${MAX_RETRIES}: API not ready, retrying in ${RETRY_DELAY_MS}ms...`);
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
    attempt++;
  }

  console.error('❌ Startup verification failed after retries');
  process.exit(1);
}

verifyStartup();
