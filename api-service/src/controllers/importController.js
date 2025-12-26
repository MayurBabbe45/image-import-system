const pool = require('../config/database');
const db = require('../config/database');
const queueService = require('../services/queueService');

// Helper to extract Folder ID from URL
function extractFolderId(url) {
    if (!url) return null;
    const match = url.match(/\/folders\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
}

// 1. IMPORT FUNCTION (POST)
exports.importFromGoogleDrive = async (req, res) => {
    try {
        const { driveUrl, importName, maxImages, tags } = req.body;

        // Validation
        const folderId = extractFolderId(driveUrl);
        if (!folderId) {
            return res.status(400).json({ success: false, error: 'Invalid Google Drive URL' });
        }

        // Save to Database (Status: QUEUED)
        const result = await db.query(
            `INSERT INTO import_jobs (folder_id, import_name, max_images, tags, status)
             VALUES ($1, $2, $3, $4, 'QUEUED') RETURNING id`,
            [folderId, importName, maxImages || 1000, JSON.stringify(tags || [])]
        );
        const dbJobId = result.rows[0].id;

        // Add to Queue
        const job = await queueService.enqueueImportJob({
            dbJobId,      // The ID in Postgres
            folderId,     // The ID in Google Drive
            importName,
            maxImages,
            tags
        });

        // Respond
        res.status(202).json({
            success: true,
            message: 'Import job queued',
            jobId: job.id,
            dbJobId: dbJobId
        });

    } catch (err) {
        console.error("Import Controller Error:", err);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

// 2. JOB STATUS FUNCTION (GET) - This was missing!
exports.getJobStatus = async (req, res) => {
    try {
        const { jobId } = req.params;
        // Ask the Queue Service for the status
        const job = await queueService.getJobStatus(jobId);
        
        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found' });
        }

        res.json({
            success: true,
            jobId: job.id,
            state: job.state,       // 'waiting', 'active', 'completed', 'failed'
            progress: job.progress, // number 0-100
            failedReason: job.failedReason
        });
    } catch (err) {
        console.error("Job Status Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// 3. GET IMAGES FUNCTION (GET)
exports.getImages = async (req, res) => {
    try {
        const limit = req.query.limit || 20;
        // Simple query to fetch latest images
        const result = await db.query(
            `SELECT * FROM images ORDER BY uploaded_at DESC LIMIT $1`, 
            [limit]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error("Get Images Error:", err);
        res.status(500).json({ error: err.message });
    }



};



exports.deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Get image details to find the Cloudinary ID
    const result = await pool.query('SELECT * FROM images WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    const image = result.rows[0];

    // 2. Add a "Delete Job" to the queue 
    // (We do this async so the UI is fast)
    await queueService.enqueueDeleteJob({
      publicId: image.minio_object_key, // This is the Cloudinary ID
      dbId: id
    });

    // 3. Remove from DB immediately so UI updates instantly
    await pool.query('DELETE FROM images WHERE id = $1', [id]);

    res.json({ success: true, message: 'Deletion started' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
};