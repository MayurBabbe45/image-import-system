const Redis = require('ioredis');

const connection = new Redis({
  host: 'localhost', // External access to Docker container
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
});

module.exports = connection;