const express = require('express');
const router = express.Router();
const importController = require('../controllers/importController');


router.post('/google-drive', importController.importFromGoogleDrive);
// ADD THIS LINE:
router.get('/status/:jobId', importController.getJobStatus);

router.delete('/images/:id', importController.deleteImage); // <--- ADD THIS LINE

module.exports = router;