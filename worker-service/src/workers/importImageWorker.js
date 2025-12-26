const db = require('../config/database');
const googleDriveService = require('../services/googleDriveService');
const minioService = require('../services/minioService'); // This is your Cloudinary Adapter
const cloudinary = require('cloudinary').v2; // Import Cloudinary directly for deletion

// Ensure Cloudinary is configured (reads from .env)
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

module.exports = async (job) => {
    
    // ==========================================
    // CASE 1: DELETE JOB
    // ==========================================
    if (job.name === 'delete-image') {
        const { publicId } = job.data;
        console.log(`🗑️ Processing Delete Job: ${publicId}`);

        try {
            // destroy() is the Cloudinary API to delete a file
            const result = await cloudinary.uploader.destroy(publicId);
            
            if (result.result === 'ok' || result.result === 'not found') {
                console.log(`✅ Successfully deleted from Cloudinary: ${publicId}`);
            } else {
                console.error(`⚠️ Cloudinary delete warning: ${JSON.stringify(result)}`);
            }
        } catch (err) {
            console.error(`❌ Failed to delete from Cloudinary:`, err.message);
            // We don't throw error here because the DB record is already gone, 
            // so failing the job would just make it retry uselessly.
        }
        return; // <--- STOP HERE for delete jobs
    }


    // ==========================================
    // CASE 2: IMPORT JOB (Your existing code)
    // ==========================================
    const { dbJobId, folderId, maxImages } = job.data;
    console.log(`🚀 Processing Job ${job.id} (DB ID: ${dbJobId})`);

    try {
        // 1. Update Status to PROCESSING
        await db.query(`UPDATE import_jobs SET status = 'PROCESSING', created_at = NOW() WHERE id = $1`, [dbJobId]);

        // 2. Fetch List from Google Drive
        const files = await googleDriveService.listImagesInFolder(folderId, maxImages);
        console.log(`📂 Found ${files.length} images.`);

        let processedCount = 0;

        // 3. Loop through files
        for (const file of files) {
            try {
                // A. Download
                const buffer = await googleDriveService.downloadImage(file.id);
                
                // B. Upload to Cloudinary (via your minioService adapter)
                const uploadResult = await minioService.uploadImage(buffer, file.name, dbJobId);

                // C. Save to DB
                // Note: We use uploadResult.key because we added that to the adapter earlier
                await db.query(
                    `INSERT INTO images (import_job_id, file_name, minio_bucket, minio_object_key, minio_url, size, format)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [dbJobId, file.name, uploadResult.bucket || 'cloudinary', uploadResult.key, uploadResult.url, buffer.length, file.mimeType]
                );

                processedCount++;
                // Report progress
                await job.updateProgress(Math.round((processedCount / files.length) * 100));

            } catch (err) {
                console.error(`❌ Failed to process file ${file.name}:`, err.message);
            }
        }

        // 4. Update Status to COMPLETED
        await db.query(
            `UPDATE import_jobs SET status = 'COMPLETED', imported_count = $1, completed_at = NOW() WHERE id = $2`,
            [processedCount, dbJobId]
        );
        console.log(`✅ Job ${job.id} Completed!`);

    } catch (err) {
        console.error(`🔥 Job Failed:`, err);
        await db.query(`UPDATE import_jobs SET status = 'FAILED', error_message = $1 WHERE id = $2`, [err.message, dbJobId]);
        throw err;
    }
};