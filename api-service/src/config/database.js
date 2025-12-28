const { Pool } = require('pg');
require('dotenv').config();


// Check if we are in production (Render) or local
const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL;

const pool = new Pool({
 
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER || 'imageuser'}:${process.env.DB_PASSWORD || 'imagepass'}@localhost:5432/${process.env.DB_NAME || 'image_imports'}`,
  
  
  ssl: isProduction ? { rejectUnauthorized: false } : false// Required for Render Postgres
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};