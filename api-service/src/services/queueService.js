const { Queue } = require('bullmq'); 
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
    
    removeOnComplete: false, 
    removeOnFail: false
  },
});

// Add job to queue
exports.enqueueImportJob = async (jobData) => {
  
  const job = await importQueue.add('import-images', jobData, {
    jobId: `job-${Date.now()}`,
  });
  return job;
};


//this is for getting job status
exports.getJobStatus = async (jobId) => {
  const job = await importQueue.getJob(jobId);
  if (!job) return null;

  const state = await job.getState();
  // progress is a number between 0 and 100.
  const progress = job.progress || 0; 

  return {
    id: job.id,
    state,
    progress,
    data: job.data,
    failedReason: job.failedReason,
  };
};

//this is for deleting images
exports.enqueueDeleteJob = async (data) => {
  return await importQueue.add('delete-image', data);
}