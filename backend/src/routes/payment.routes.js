/**
 * Payment routes
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth');

// @route   POST /api/payments/create-order
// @desc    Create Razorpay order
// @access  Private
router.post('/create-order', protect, paymentController.createPaymentOrder);

// @route   POST /api/payments/verify
// @desc    Verify Razorpay payment
// @access  Private
router.post('/verify', protect, paymentController.verifyPayment);

// @route   GET /api/payments/transactions
// @desc    Get user transactions
// @access  Private
router.get('/transactions', protect, paymentController.getTransactions);

module.exports = router;
