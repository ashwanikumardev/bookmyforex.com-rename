/**
 * Partner routes
 */

const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partner.controller');

// @route   GET /api/partners
// @desc    Get all active partners
// @access  Public
router.get('/', partnerController.getAllPartners);

// @route   GET /api/partners/city/:city
// @desc    Get partners by city
// @access  Public
router.get('/city/:city', partnerController.getPartnersByCity);

module.exports = router;
