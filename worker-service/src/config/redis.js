
const Redis = require('ioredis');

const connection = new Redis(process.env.REDIS_URL || {
  host: '127.0.0.1',
  port: 6379,
}, {
  maxRetriesPerRequest: null 
});

module.exports = connection;