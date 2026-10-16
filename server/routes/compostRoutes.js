const express = require('express');
const router = express.Router();
const compostController = require('../controllers/compostController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/my-batches', authenticateToken, authorizeRoles('compost_producer', 'admin'), compostController.getProducerBatches);
router.post('/batches', authenticateToken, authorizeRoles('compost_producer', 'admin'), compostController.createBatch);
router.put('/batches/:id', authenticateToken, authorizeRoles('compost_producer', 'admin'), compostController.updateBatch);
router.get('/dashboard-stats', authenticateToken, authorizeRoles('compost_producer', 'admin'), compostController.getProducerDashboardStats);

module.exports = router;
