const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'imageuser',
  host: 'localhost',
  database: process.env.DB_NAME || 'image_imports',
  password: process.env.DB_PASSWORD || 'imagepass',
  port: process.env.DB_PORT || 5432,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};