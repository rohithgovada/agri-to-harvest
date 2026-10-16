const express = require('express');
const router = express.Router();
const wasteController = require('../controllers/wasteController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Public listing browsing
router.get('/', wasteController.getPublicListings);
router.get('/:id', wasteController.getListingById);

// Shopkeeper routes
router.post('/', authenticateToken, authorizeRoles('shopkeeper', 'admin'), wasteController.createListing);
router.get('/shopkeeper/my-listings', authenticateToken, authorizeRoles('shopkeeper', 'admin'), wasteController.getShopkeeperListings);
router.put('/:id', authenticateToken, authorizeRoles('shopkeeper', 'admin'), wasteController.updateListing);
router.delete('/:id', authenticateToken, authorizeRoles('shopkeeper', 'admin'), wasteController.deleteListing);
router.get('/shopkeeper/requests', authenticateToken, authorizeRoles('shopkeeper', 'admin'), wasteController.getRequestsForShopkeeper);

// Compost Producer routes
router.post('/request-collection', authenticateToken, authorizeRoles('compost_producer', 'admin'), wasteController.requestCollection);
router.get('/producer/my-requests', authenticateToken, authorizeRoles('compost_producer', 'admin'), wasteController.getRequestsForProducer);

// Shared status updates
router.put('/requests/:id/status', authenticateToken, wasteController.updateRequestStatus);

module.exports = router;
