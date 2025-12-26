const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL;

const pool = new Pool({
  // 1. If DATABASE_URL exists (Render), use it. Otherwise use local config.
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER || 'imageuser'}:${process.env.DB_PASSWORD || 'imagepass'}@localhost:5432/${process.env.DB_NAME || 'image_imports'}`,
  
  // 2. SSL is REQUIRED for Render, but breaks localhost. This handles both.
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};