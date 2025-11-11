/**
 * Admin routes
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminController = require('../controllers/admin.controller');
const { protect, adminOnly } = require('../middleware/auth');

// All routes require admin authentication
router.use(protect, adminOnly);

// ===== DASHBOARD =====
router.get('/dashboard', adminController.getDashboard);

// ===== USERS =====
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id/kyc', adminController.updateKYCStatus);
router.put('/users/:id/status', adminController.updateUserStatus);

// ===== ORDERS =====
router.get('/orders', adminController.getAllOrders);
router.get('/orders/:id', adminController.getOrderById);
router.put('/orders/:id/status', adminController.updateOrderStatus);
router.put('/orders/:id/assign', adminController.assignPartner);

// ===== RATES =====
router.post('/rates', [
  body('currencyCode').notEmpty(),
  body('currencyName').notEmpty(),
  body('buyRate').isFloat({ min: 0 }),
  body('sellRate').isFloat({ min: 0 }),
  body('baseRate').isFloat({ min: 0 })
], adminController.createRate);

router.put('/rates/:currencyCode', adminController.updateRate);
router.delete('/rates/:currencyCode', adminController.deleteRate);
router.post('/rates/bulk-update', adminController.bulkUpdateRates);

// ===== PARTNERS =====
router.get('/partners', adminController.getAllPartners);
router.post('/partners', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('phone').notEmpty(),
  body('city').notEmpty(),
  body('state').notEmpty()
], adminController.createPartner);
router.put('/partners/:id', adminController.updatePartner);
router.delete('/partners/:id', adminController.deletePartner);

// ===== OFFERS =====
router.get('/offers', adminController.getAllOffers);
router.post('/offers', [
  body('title').notEmpty(),
  body('code').notEmpty(),
  body('discountType').isIn(['PERCENTAGE', 'FLAT', 'CASHBACK']),
  body('discountValue').isFloat({ min: 0 }),
  body('validFrom').isISO8601(),
  body('validUntil').isISO8601()
], adminController.createOffer);
router.put('/offers/:id', adminController.updateOffer);
router.delete('/offers/:id', adminController.deleteOffer);

// ===== AUDIT LOGS =====
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
