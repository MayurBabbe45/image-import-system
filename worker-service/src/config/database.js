const { Pool } = require('pg');

// Check if we are in production (Render) or local
const isProduction = process.env.NODE_ENV === 'production';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ FATAL: DATABASE_URL is missing! Worker cannot connect to DB.');
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false // Required for Render Postgres
});

// Test the connection immediately on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error acquiring client', err.stack);
  } else {
    console.log('✅ Database connected successfully');
    release();
  }
});

module.exports = pool;