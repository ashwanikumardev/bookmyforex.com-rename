/**
 * User controller
 */

const { validationResult } = require('express-validator');
const prisma = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

// @desc    Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        kycStatus: true,
        kycDocuments: true,
        walletBalance: true,
        referralCode: true,
        referredBy: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user profile
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { firstName, lastName, phone } = req.body;
    const updateData = {};

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Submit KYC documents
const submitKYC = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload KYC documents'
      });
    }

    const documents = {};
    
    if (req.files.aadhaar) {
      documents.aadhaar = `/uploads/kyc/${req.files.aadhaar[0].filename}`;
    }
    if (req.files.pan) {
      documents.pan = `/uploads/kyc/${req.files.pan[0].filename}`;
    }
    if (req.files.photo) {
      documents.photo = `/uploads/kyc/${req.files.photo[0].filename}`;
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        kycDocuments: documents,
        kycStatus: 'SUBMITTED'
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'KYC_SUBMITTED',
        entity: 'User',
        entityId: req.user.id,
        metadata: { documents }
      }
    });

    res.json({
      success: true,
      message: 'KYC documents submitted successfully',
      data: { kycStatus: user.kycStatus }
    });
  } catch (error) {
    console.error('Submit KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user addresses
const getAddresses = async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: { isDefault: 'desc' }
    });

    res.json({
      success: true,
      data: { addresses }
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add new address
const addAddress = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { type, line1, line2, city, state, pincode, country, isDefault } = req.body;

    // If this is default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user.id,
        type,
        line1,
        line2,
        city,
        state,
        pincode,
        country: country || 'India',
        isDefault: isDefault || false
      }
    });

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: { address }
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update address
const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if address belongs to user
    const existingAddress = await prisma.address.findUnique({
      where: { id }
    });

    if (!existingAddress || existingAddress.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    const { type, line1, line2, city, state, pincode, country, isDefault } = req.body;

    // If this is default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { 
          userId: req.user.id,
          id: { not: id }
        },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        type,
        line1,
        line2,
        city,
        state,
        pincode,
        country,
        isDefault
      }
    });

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: { address }
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete address
const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if address belongs to user
    const address = await prisma.address.findUnique({
      where: { id }
    });

    if (!address || address.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    await prisma.address.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user referrals
const getReferrals = async (req, res) => {
  try {
    const referrals = await prisma.referral.findMany({
      where: { referrerId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { referrals }
    });
  } catch (error) {
    console.error('Get referrals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  submitKYC,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getReferrals
};
