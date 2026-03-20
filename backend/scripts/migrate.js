// ============================================================================
// Database Migration Runner
// Runs all SQL migration files in order
// Called by: npm run migrate
// ============================================================================

const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');
const { logger } = require('../config/logger');

// Try both possible migration locations
const MIGRATIONS_DIR = fs.existsSync(path.join(__dirname, '../../database/migrations'))
  ? path.join(__dirname, '../../database/migrations')
  : path.join(__dirname, '../database/migrations');

async function runMigrations() {
  try {
    logger.info('🔄 Starting database migrations...');

    // Create migrations tracking table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get list of migration files
    const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
      .filter(file => file.endsWith('.sql'))
      .sort();

    if (migrationFiles.length === 0) {
      logger.warn('⚠️  No migration files found (schema already loaded by Docker)');
      await pool.end();
      process.exit(0);
    }

    // Get already executed migrations
    const result = await pool.query('SELECT name FROM schema_migrations');
    const executedMigrations = new Set(result.rows.map(r => r.name));

    let executedCount = 0;

    // Run migrations in order
    for (const migrationFile of migrationFiles) {
      if (executedMigrations.has(migrationFile)) {
        logger.info(`✓ ${migrationFile} (already applied)`);
        continue;
      }

      const filePath = path.join(MIGRATIONS_DIR, migrationFile);
      const sql = fs.readFileSync(filePath, 'utf8');

      // Skip empty migration files
      if (!sql.trim()) {
        logger.warn(`⊘ ${migrationFile} (empty, skipping)`);
        await pool.query(
          'INSERT INTO schema_migrations (name) VALUES ($1)',
          [migrationFile]
        );
        continue;
      }

      try {
        await pool.query(sql);
        await pool.query(
          'INSERT INTO schema_migrations (name) VALUES ($1)',
          [migrationFile]
        );
        logger.info(`✅ ${migrationFile} (applied)`);
        executedCount++;
      } catch (err) {
        logger.error(`❌ Migration failed: ${migrationFile}`, err);
        process.exit(1);
      }
    }

    logger.info(`\n✅ Migrations complete (${executedCount} new, ${executedMigrations.size} existing)`);
    await pool.end();
    process.exit(0);
  } catch (err) {
    logger.error('❌ Migration error:', err);
    process.exit(1);
  }
}

runMigrations();
