/**
 * Offer controller
 */

const prisma = require('../config/database');

// @desc    Get all active offers
const getAllOffers = async (req, res) => {
  try {
    const now = new Date();
    
    const offers = await prisma.offer.findMany({
      where: {
        isActive: true,
        validFrom: { lte: now },
        validUntil: { gte: now }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { offers }
    });
  } catch (error) {
    console.error('Get offers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get offer by code
const getOfferByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const offer = await prisma.offer.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    res.json({
      success: true,
      data: { offer }
    });
  } catch (error) {
    console.error('Get offer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Validate offer code
const validateOffer = async (req, res) => {
  try {
    const { code, amount } = req.body;

    if (!code || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Code and amount are required'
      });
    }

    const offer = await prisma.offer.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Invalid offer code'
      });
    }

    // Check if offer is active
    if (!offer.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Offer is not active'
      });
    }

    // Check validity period
    const now = new Date();
    if (now < offer.validFrom || now > offer.validUntil) {
      return res.status(400).json({
        success: false,
        message: 'Offer has expired'
      });
    }

    // Check minimum amount
    if (amount < offer.minAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum amount required: ₹${offer.minAmount}`
      });
    }

    // Check usage limit
    if (offer.usageLimit && offer.usageCount >= offer.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Offer usage limit reached'
      });
    }

    // Calculate discount
    let discount = 0;
    if (offer.discountType === 'PERCENTAGE') {
      discount = (amount * offer.discountValue) / 100;
      if (offer.maxDiscount && discount > offer.maxDiscount) {
        discount = offer.maxDiscount;
      }
    } else if (offer.discountType === 'FLAT') {
      discount = offer.discountValue;
    }

    res.json({
      success: true,
      message: 'Offer is valid',
      data: {
        offer: {
          code: offer.code,
          title: offer.title,
          description: offer.description,
          discountType: offer.discountType,
          discountValue: offer.discountValue
        },
        discount: parseFloat(discount.toFixed(2)),
        finalAmount: parseFloat((amount - discount).toFixed(2))
      }
    });
  } catch (error) {
    console.error('Validate offer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getAllOffers,
  getOfferByCode,
  validateOffer
};
