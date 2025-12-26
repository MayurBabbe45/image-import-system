// api-service/src/services/importService.js
const queueService = require('./queueService');
const db = require('../config/database');

/**
 * Initiates an import workflow:
 * 1. Create ImportJob record in DB
 * 2. Enqueue BullMQ job
 * 3. Return job metadata
 */
exports.initiateImport = async (jobPayload) => {
  const { folderId, importName, maxImages, tags } = jobPayload;

  // Create database record
  const importJobRecord = await db.query(
    `
    INSERT INTO import_jobs 
    (folder_id, import_name, max_images, tags, status, created_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING id, created_at
    `,
    [folderId, importName, maxImages, JSON.stringify(tags), 'QUEUED']
  );

  const jobId = importJobRecord.rows[0].id;

  // Enqueue for worker
  const job = await queueService.enqueueImportJob({
    ...jobPayload,
    dbJobId: jobId
  });

  return {
    jobId,
    bullJobId: job.id,
    createdAt: importJobRecord.rows[0].created_at
  };
};

/**
 * Query images by import job ID
 */
exports.getImagesForJob = async (jobId, limit, offset) => {
  const result = await db.query(
    `
    SELECT id, file_name, minio_url, public_url, size, width, height, 
           format, uploaded_at, tags
    FROM images
    WHERE import_job_id = $1
    ORDER BY uploaded_at DESC
    LIMIT $2 OFFSET $3
    `,
    [jobId, limit, offset]
  );

  const countResult = await db.query(
    'SELECT COUNT(*) as total FROM images WHERE import_job_id = $1',
    [jobId]
  );

  return {
    images: result.rows,
    total: parseInt(countResult.rows[0].total),
    limit,
    offset
  };
};

module.exports = exports;
