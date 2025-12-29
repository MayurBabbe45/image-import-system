const { Worker } = require('bullmq');
const redisConnection = require('./config/redis');
const importImageWorker = require('./workers/importImageWorker');
const express = require('express');

console.log('👷 Worker Service Starting...');

// 1. Initialize BullMQ Worker
const worker = new Worker('image-imports', importImageWorker, {
    connection: redisConnection,
    concurrency: 5 
});

worker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
    console.log(`❌ Job ${job.id} has failed with ${err.message}`);
});

// 2. Health Check Server to prevent Render Spin-down
const app = express();
const port = process.env.PORT || 10000; // Render usually uses 10000

app.get('/', (req, res) => {
    console.log('👀 Worker received a health check ping');
    res.send('Worker is awake and running');
});

app.listen(port, () => {
    console.log(`🚀 Worker health check server listening on port ${port}`);
});