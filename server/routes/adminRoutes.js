const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/overview', authenticateToken, authorizeRoles('admin'), adminController.getAdminOverview);
router.get('/users', authenticateToken, authorizeRoles('admin'), adminController.getAllUsers);
router.put('/users/:id/status', authenticateToken, authorizeRoles('admin'), adminController.toggleUserStatus);
router.get('/complaints', authenticateToken, authorizeRoles('admin'), adminController.getAllComplaints);
router.put('/complaints/:id', authenticateToken, authorizeRoles('admin'), adminController.updateComplaint);
router.post('/complaints', authenticateToken, adminController.createComplaint);
router.get('/audit-logs', authenticateToken, authorizeRoles('admin'), adminController.getAuditLogs);
router.get('/export/:type', authenticateToken, authorizeRoles('admin'), adminController.exportCSV);

module.exports = router;
