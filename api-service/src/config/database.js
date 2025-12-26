const { Pool } = require('pg');
require('dotenv').config(); // Load vars from .env (make sure .env is in root or handled)

// Note: When running locally (outside Docker), we use localhost.
// When running inside Docker, we would use 'postgres'.
// For this phase, we assume you are running 'npm run dev' on your local machine.
const pool = new Pool({
  user: process.env.DB_USER || 'imageuser',
  host: 'localhost', // External access to Docker container
  database: process.env.DB_NAME || 'image_imports',
  password: process.env.DB_PASSWORD || 'imagepass',
  port: process.env.DB_PORT || 5432,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};