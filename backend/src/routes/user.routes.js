/**
 * User routes
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/kyc/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed'));
    }
  }
});

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, userController.getProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('phone').optional().isMobilePhone('en-IN')
], userController.updateProfile);

// @route   POST /api/users/kyc
// @desc    Submit KYC documents
// @access  Private
router.post('/kyc', protect, upload.fields([
  { name: 'aadhaar', maxCount: 1 },
  { name: 'pan', maxCount: 1 },
  { name: 'photo', maxCount: 1 }
]), userController.submitKYC);

// @route   GET /api/users/addresses
// @desc    Get user addresses
// @access  Private
router.get('/addresses', protect, userController.getAddresses);

// @route   POST /api/users/addresses
// @desc    Add new address
// @access  Private
router.post('/addresses', protect, [
  body('type').isIn(['HOME', 'OFFICE', 'OTHER']),
  body('line1').trim().notEmpty(),
  body('city').trim().notEmpty(),
  body('state').trim().notEmpty(),
  body('pincode').trim().notEmpty()
], userController.addAddress);

// @route   PUT /api/users/addresses/:id
// @desc    Update address
// @access  Private
router.put('/addresses/:id', protect, userController.updateAddress);

// @route   DELETE /api/users/addresses/:id
// @desc    Delete address
// @access  Private
router.delete('/addresses/:id', protect, userController.deleteAddress);

// @route   GET /api/users/referrals
// @desc    Get user referrals
// @access  Private
router.get('/referrals', protect, userController.getReferrals);

module.exports = router;
