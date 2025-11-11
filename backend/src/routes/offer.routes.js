/**
 * Offer routes
 */

const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offer.controller');

// @route   GET /api/offers
// @desc    Get all active offers
// @access  Public
router.get('/', offerController.getAllOffers);

// @route   GET /api/offers/:code
// @desc    Get offer by code
// @access  Public
router.get('/:code', offerController.getOfferByCode);

// @route   POST /api/offers/validate
// @desc    Validate offer code
// @access  Public
router.post('/validate', offerController.validateOffer);

module.exports = router;
