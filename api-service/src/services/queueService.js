const { Queue } = require('bullmq'); // <--- This was missing!
const redisConnection = require('../config/redis');

// Create the Queue
const importQueue = new Queue('image-imports', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    // Keep the job in Redis after completion so the API can read the status
    removeOnComplete: false, 
    removeOnFail: false
  },
});

exports.enqueueImportJob = async (jobData) => {
  // Add job to the queue
  const job = await importQueue.add('import-images', jobData, {
    jobId: `job-${Date.now()}`, // Simple unique ID
  });
  return job;
};

exports.getJobStatus = async (jobId) => {
  const job = await importQueue.getJob(jobId);
  if (!job) return null;

  const state = await job.getState();
  // job.progress is a getter in some versions, or a property in others. 
  // We use the safe access pattern here.
  const progress = job.progress || 0; 

  return {
    id: job.id,
    state,
    progress,
    data: job.data,
    failedReason: job.failedReason,
  };
};

exports.enqueueDeleteJob = async (data) => {
  // reusing the same queue, but with a different name
  return await importQueue.add('delete-image', data);
}