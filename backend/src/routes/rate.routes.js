/**
 * Rate routes
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const rateController = require('../controllers/rate.controller');
const { protect } = require('../middleware/auth');

// @route   GET /api/rates
// @desc    Get all active rates
// @access  Public
router.get('/', rateController.getAllRates);

// @route   GET /api/rates/:currencyCode
// @desc    Get rate for specific currency
// @access  Public
router.get('/:currencyCode', rateController.getRateByCurrency);

// @route   POST /api/rates/calculate
// @desc    Calculate total amount for a transaction
// @access  Public
router.post('/calculate', [
  body('currencyCode').notEmpty(),
  body('amount').isFloat({ min: 0 }),
  body('type').isIn(['BUY', 'SELL'])
], rateController.calculateAmount);

// @route   POST /api/rates/alert
// @desc    Create rate alert
// @access  Private
router.post('/alert', protect, [
  body('currencyCode').notEmpty(),
  body('targetRate').isFloat({ min: 0 }),
  body('alertType').isIn(['EMAIL', 'SMS', 'BOTH'])
], rateController.createRateAlert);

// @route   GET /api/rates/alerts/my
// @desc    Get user's rate alerts
// @access  Private
router.get('/alerts/my', protect, rateController.getMyAlerts);

// @route   DELETE /api/rates/alert/:id
// @desc    Delete rate alert
// @access  Private
router.delete('/alert/:id', protect, rateController.deleteRateAlert);

module.exports = router;
