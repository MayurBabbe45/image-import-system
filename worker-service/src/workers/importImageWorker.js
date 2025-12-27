const { google } = require('googleapis');
const cloudinary = require('cloudinary').v2;
// 👇 Note the double dot ".." to go up to src, then down to config
const pool = require('../config/database'); 

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Configure Google Drive
const drive = google.drive({ version: 'v3', auth: process.env.GOOGLE_API_KEY });

// This function handles BOTH imports and deletes
module.exports = async (job) => {
  
  // ==========================
  // LOGIC A: DELETE IMAGE
  // ==========================
  if (job.name === 'delete-image') {
    const { publicId } = job.data;
    console.log(`🗑️ Deleting image: ${publicId}`);
    try {
      if (publicId) await cloudinary.uploader.destroy(publicId);
      console.log(`✅ Deleted: ${publicId}`);
    } catch (err) {
      console.error(`❌ Delete Failed: ${err.message}`);
    }
    return;
  }

  // ==========================
  // LOGIC B: IMPORT IMAGES
  // ==========================
  // API sends 'jobId', but we handle 'dbJobId' just in case
  const { jobId, folderId } = job.data;
  const currentJobId = jobId || job.data.dbJobId;

  try {
    console.log(`🚀 Starting Import for Folder: ${folderId}`);
    
    // 1. Update DB Status
    await pool.query('UPDATE import_jobs SET status = $1 WHERE id = $2', ['PROCESSING', currentJobId]);

    // 2. Get Files from Drive
    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: 'files(id, name, mimeType, size)',
    });

    const files = res.data.files || [];
    if (files.length === 0) {
      console.log('⚠️ No images found.');
      await pool.query('UPDATE import_jobs SET status = $1, error_message = $2 WHERE id = $3', ['FAILED', 'No images found', currentJobId]);
      return;
    }

    // 3. Update Total Count
    await pool.query('UPDATE import_jobs SET total_files = $1 WHERE id = $2', [files.length, currentJobId]);

    // 4. Process Loop
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const driveUrl = `https://drive.google.com/uc?export=download&id=${file.id}`;

      // Upload
      const uploadResult = await cloudinary.uploader.upload(driveUrl, {
        folder: 'image-import-app',
        public_id: file.name.split('.')[0]
      });

      // Save to DB
      await pool.query(
        'INSERT INTO images (import_job_id, file_name, minio_url, minio_object_key, size, format) VALUES ($1, $2, $3, $4, $5, $6)',
        [currentJobId, file.name, uploadResult.secure_url, uploadResult.public_id, file.size, uploadResult.format]
      );

      // Report Progress
      const progress = Math.round(((i + 1) / files.length) * 100);
      await job.updateProgress(progress);
      
      // Update Count
      await pool.query('UPDATE import_jobs SET imported_count = $1 WHERE id = $2', [i + 1, currentJobId]);
    }

    // 5. Complete
    await pool.query('UPDATE import_jobs SET status = $1, completed_at = NOW() WHERE id = $2', ['COMPLETED', currentJobId]);
    console.log(`✅ Job Finished Successfully!`);

  } catch (err) {
    console.error(`🔥 Job Failed:`, err);
    await pool.query('UPDATE import_jobs SET status = $1, error_message = $2 WHERE id = $3', ['FAILED', err.message, currentJobId]);
    throw err;
  }
};