const { Worker } = require('bullmq');
const redisConnection = require('../config/redis');
const { processImportJob } = require('./processors/importProcessor');

// 👇 THIS NAME MUST MATCH YOUR API ('image-imports')
const worker = new Worker('image-imports', async (job) => {
  console.log(`⚡ WORKER: Picked up job ${job.id} (Name: ${job.name})`);

  if (job.name === 'import-images') {
    // Call your logic to download/upload images
    await processImportJob(job);
  } 
  else if (job.name === 'delete-image') {
    console.log(`🗑️ Processing delete request for: ${job.data.fileId}`);
    // Add delete logic here if you have it
  }

}, {
  connection: redisConnection,
  concurrency: 5 // Optional: Process 5 imports at once
});

// Logs to help us debug on Render
worker.on('active', (job) => {
  console.log(`🏃 Job ${job.id} is now ACTIVE!`);
});

worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} COMPLETED!`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} FAILED: ${err.message}`);
});

console.log('👷 Worker Service is running and listening to "image-imports"...');