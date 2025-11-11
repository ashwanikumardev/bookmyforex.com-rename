/**
 * Partner controller
 */

const prisma = require('../config/database');

// @desc    Get all active partners
const getAllPartners = async (req, res) => {
  try {
    const partners = await prisma.partner.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        rating: true,
        deliveryEnabled: true
      },
      orderBy: { rating: 'desc' }
    });

    res.json({
      success: true,
      data: { partners }
    });
  } catch (error) {
    console.error('Get partners error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get partners by city
const getPartnersByCity = async (req, res) => {
  try {
    const { city } = req.params;

    const partners = await prisma.partner.findMany({
      where: {
        isActive: true,
        city: {
          contains: city,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        rating: true,
        deliveryEnabled: true
      },
      orderBy: { rating: 'desc' }
    });

    res.json({
      success: true,
      data: { partners }
    });
  } catch (error) {
    console.error('Get partners by city error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getAllPartners,
  getPartnersByCity
};
