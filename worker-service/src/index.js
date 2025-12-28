const { Worker } = require('bullmq');
const redisConnection = require('./config/redis');
const importImageWorker = require('./workers/importImageWorker');

console.log('👷 Worker Service Starting...');

const worker = new Worker('image-imports', importImageWorker, {
    connection: redisConnection,
    concurrency: 5 
});

worker.on('completed', (job) => {
    console.log(`Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
    console.log(`Job ${job.id} has failed with ${err.message}`);
});


const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

app.get('/', (req, res) => res.send('Worker is running'));

app.listen(port, () => {
    console.log(`Worker health check server listening on port ${port}`);
});