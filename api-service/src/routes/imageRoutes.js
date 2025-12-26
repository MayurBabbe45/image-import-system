const express = require('express');
const router = express.Router();
const importController = require('../controllers/importController');

router.get('/', importController.getImages);

module.exports = router;