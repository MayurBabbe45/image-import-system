const Redis = require('ioredis');
require('dotenv').config();

// Max retries null means it will keep trying to connect forever (good for workers)
const connection = new Redis({
  host: 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null, 
});

module.exports = connection;