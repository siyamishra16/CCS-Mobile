require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function runMigration() {
  const migrationPath = path.join(__dirname, 'migrations', 'create_certificates_table.sql');

  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Migration file not found: ${migrationPath}`);
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');
  await pool.query(sql);
  console.log('Migration applied: create_certificates_table.sql');
}

runMigration()
  .catch((err) => {
    console.error('Migration failed:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
