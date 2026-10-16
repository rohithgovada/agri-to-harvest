const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', productController.getPublicProducts);
router.get('/:id', productController.getProductById);
router.get('/producer/my-products', authenticateToken, authorizeRoles('compost_producer', 'admin'), productController.getProducerProducts);
router.post('/', authenticateToken, authorizeRoles('compost_producer', 'admin'), productController.createProduct);
router.put('/:id', authenticateToken, authorizeRoles('compost_producer', 'admin'), productController.updateProduct);
router.delete('/:id', authenticateToken, authorizeRoles('compost_producer', 'admin'), productController.deleteProduct);

module.exports = router;
