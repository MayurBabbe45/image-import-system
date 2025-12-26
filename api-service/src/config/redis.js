const Redis = require('ioredis');

let connection;

if (process.env.REDIS_URL) {
  // ☁️ Production (Render)
  // Connects using the secure URL string provided by Render
  connection = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null // Required by BullMQ
  });
} else {
  // 💻 Local Development
  // Connects to localhost with options merged into one object
  connection = new Redis({
    host: '127.0.0.1',
    port: 6379,
    maxRetriesPerRequest: null // Required by BullMQ
  });
}

module.exports = connection;