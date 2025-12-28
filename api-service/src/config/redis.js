const Redis = require('ioredis');

let connection;


if (process.env.REDIS_URL) {

  connection = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null
  });
} else {

  connection = new Redis({
    host: '127.0.0.1',
    port: 6379,
    maxRetriesPerRequest: null 
  });
}

module.exports = connection;