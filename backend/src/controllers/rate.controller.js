/**
 * Rate controller
 */

const { validationResult } = require('express-validator');
const prisma = require('../config/database');
const { sendRateAlertEmail } = require('../services/email.service');
const { sendRateAlertSMS } = require('../services/sms.service');

// @desc    Get all active rates
const getAllRates = async (req, res) => {
  try {
    const rates = await prisma.rate.findMany({
      where: { isActive: true },
      orderBy: { currencyName: 'asc' }
    });

    res.json({
      success: true,
      data: { rates }
    });
  } catch (error) {
    console.error('Get rates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get rate for specific currency
const getRateByCurrency = async (req, res) => {
  try {
    const { currencyCode } = req.params;

    const rate = await prisma.rate.findUnique({
      where: { currencyCode: currencyCode.toUpperCase() }
    });

    if (!rate) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found'
      });
    }

    res.json({
      success: true,
      data: { rate }
    });
  } catch (error) {
    console.error('Get rate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Calculate total amount for a transaction
const calculateAmount = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { currencyCode, amount, type } = req.body;

    // Get rate
    const rate = await prisma.rate.findUnique({
      where: { currencyCode: currencyCode.toUpperCase() }
    });

    if (!rate || !rate.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Currency not available'
      });
    }

    // Calculate based on type
    const exchangeRate = type === 'BUY' ? rate.sellRate : rate.buyRate;
    const baseAmount = amount * exchangeRate;
    
    // Calculate fees (example: 2% commission + 18% GST)
    const commission = baseAmount * 0.02;
    const subtotal = baseAmount + commission;
    const gst = subtotal * 0.18;
    const totalAmount = subtotal + gst;

    res.json({
      success: true,
      data: {
        currencyCode: rate.currencyCode,
        currencyName: rate.currencyName,
        amountForeign: amount,
        exchangeRate,
        baseAmount: parseFloat(baseAmount.toFixed(2)),
        commission: parseFloat(commission.toFixed(2)),
        gst: parseFloat(gst.toFixed(2)),
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        type
      }
    });
  } catch (error) {
    console.error('Calculate amount error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create rate alert
const createRateAlert = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { currencyCode, targetRate, alertType } = req.body;

    // Verify currency exists
    const rate = await prisma.rate.findUnique({
      where: { currencyCode: currencyCode.toUpperCase() }
    });

    if (!rate) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found'
      });
    }

    // Create alert
    const alert = await prisma.rateAlert.create({
      data: {
        userId: req.user.id,
        currencyCode: currencyCode.toUpperCase(),
        targetRate,
        alertType
      }
    });

    res.status(201).json({
      success: true,
      message: 'Rate alert created successfully',
      data: { alert }
    });
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user's rate alerts
const getMyAlerts = async (req, res) => {
  try {
    const alerts = await prisma.rateAlert.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { alerts }
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete rate alert
const deleteRateAlert = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if alert exists and belongs to user
    const alert = await prisma.rateAlert.findUnique({
      where: { id }
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    if (alert.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await prisma.rateAlert.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getAllRates,
  getRateByCurrency,
  calculateAmount,
  createRateAlert,
  getMyAlerts,
  deleteRateAlert
};
