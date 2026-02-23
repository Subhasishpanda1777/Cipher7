#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const dotenv = require('dotenv');

const backendRoot = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(backendRoot, '.env') });

const migrationsDir = path.join(backendRoot, 'db', 'migrations');

async function run() {
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('No migration files found.');
    process.exit(0);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD?.replace(/^"|"$/g, ''),
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true',
    max: process.env.DB_POOL_MAX ? Number(process.env.DB_POOL_MAX) : undefined,
    idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT_MS
      ? Number(process.env.DB_IDLE_TIMEOUT_MS)
      : undefined,
  });

  const client = await pool.connect();

  try {
    for (const file of files) {
      const fullPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(fullPath, 'utf-8');
      console.log(`Running migration ${file}...`);
      await client.query(sql);
    }
    console.log('All migrations executed successfully.');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
