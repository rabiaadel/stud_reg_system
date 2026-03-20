// ============================================================================
// Database Seeding Script
// Runs all seed files in order (database/seeds/*.sql)
// Called by: npm run seed
// ============================================================================

const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');
const { logger } = require('../config/logger');

// Try both possible seed locations
const SEEDS_DIR = fs.existsSync(path.join(__dirname, '../../database/seeds'))
  ? path.join(__dirname, '../../database/seeds')
  : path.join(__dirname, '../database/seeds');

async function runSeeds() {
  try {
    logger.info('🌱 Starting database seeding...');

    // Create seeds tracking table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS seed_logs (
        id SERIAL PRIMARY KEY,
        seed_name VARCHAR(255) NOT NULL UNIQUE,
        seeded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get list of seed files
    if (!fs.existsSync(SEEDS_DIR)) {
      logger.warn('⚠️  Seeds directory not found, skipping seeding');
      await pool.end();
      process.exit(0);
    }

    const seedFiles = fs.readdirSync(SEEDS_DIR)
      .filter(file => file.endsWith('.sql'))
      .sort();

    if (seedFiles.length === 0) {
      logger.warn('⚠️  No seed files found');
      await pool.end();
      process.exit(0);
    }

    // Get already executed seeds (only run on fresh DB)
    const result = await pool.query('SELECT seed_name FROM seed_logs');
    const executedSeeds = new Set(result.rows.map(r => r.seed_name));

    let seededCount = 0;

    // Run seeds in order
    for (const seedFile of seedFiles) {
      if (executedSeeds.has(seedFile)) {
        logger.info(`✓ ${seedFile} (already seeded)`);
        continue;
      }

      const filePath = path.join(SEEDS_DIR, seedFile);
      const sql = fs.readFileSync(filePath, 'utf8');

      try {
        await pool.query(sql);
        await pool.query(
          'INSERT INTO seed_logs (seed_name) VALUES ($1)',
          [seedFile]
        );
        logger.info(`✅ ${seedFile} (seeded)`);
        seededCount++;
      } catch (err) {
        logger.error(`❌ Seed failed: ${seedFile}`, err.message);
        // Don't exit on seed failure, some seeds may have conflicts
        logger.warn(`   Continuing with next seed...`);
      }
    }

    logger.info(`\n✅ Seeding complete (${seededCount} new, ${executedSeeds.size} existing)`);
    await pool.end();
    process.exit(0);
  } catch (err) {
    logger.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

runSeeds();
