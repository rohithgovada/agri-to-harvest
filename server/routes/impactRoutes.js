const express = require('express');
const router = express.Router();
const impactController = require('../controllers/impactController');

router.get('/', impactController.getImpactStats);

module.exports = router;
