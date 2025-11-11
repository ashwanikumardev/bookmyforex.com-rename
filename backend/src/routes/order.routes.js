/**
 * Order routes
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const orderController = require('../controllers/order.controller');
const { protect, kycVerified } = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Create new order
// @access  Private (KYC verified)
router.post('/', protect, kycVerified, [
  body('productType').isIn(['BUY_CURRENCY', 'SELL_CURRENCY', 'FOREX_CARD', 'CARD_RELOAD', 'CARD_UNLOAD', 'SEND_MONEY', 'TRAVEL_SIM', 'TRAVEL_INSURANCE']),
  body('currencyCode').notEmpty(),
  body('amountForeign').isFloat({ min: 0 }),
  body('deliveryType').optional().isIn(['DOORSTEP', 'PICKUP'])
], orderController.createOrder);

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', protect, orderController.getMyOrders);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', protect, orderController.getOrderById);

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.put('/:id/cancel', protect, orderController.cancelOrder);

module.exports = router;
