/**
 * Admin controller
 */

const { validationResult } = require('express-validator');
const prisma = require('../config/database');
const { triggerRateBroadcast } = require('../services/websocket.service');

// ===== DASHBOARD =====
const getDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      pendingKYC
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: { in: ['CREATED', 'PAYMENT_PENDING', 'PROCESSING'] } } }),
      prisma.order.count({ where: { status: 'COMPLETED' } }),
      prisma.order.aggregate({
        where: { paymentStatus: 'SUCCESS' },
        _sum: { totalAmount: true }
      }),
      prisma.user.count({ where: { kycStatus: 'SUBMITTED' } })
    ]);

    // Recent orders
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalOrders,
          pendingOrders,
          completedOrders,
          totalRevenue: totalRevenue._sum.totalAmount || 0,
          pendingKYC
        },
        recentOrders
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ===== USERS =====
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, kycStatus } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ];
    }
    if (kycStatus) {
      where.kycStatus = kycStatus;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          kycStatus: true,
          walletBalance: true,
          isActive: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        addresses: true,
        referrals: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove password
    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: { user: userWithoutPassword }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const updateKYCStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { kycStatus, notes } = req.body;

    if (!['PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED'].includes(kycStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid KYC status'
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { kycStatus }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'KYC_STATUS_UPDATED',
        entity: 'User',
        entityId: id,
        metadata: { kycStatus, notes }
      }
    });

    res.json({
      success: true,
      message: 'KYC status updated successfully',
      data: { kycStatus: user.kycStatus }
    });
  } catch (error) {
    console.error('Update KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { isActive }
    });

    res.json({
      success: true,
      message: 'User status updated successfully',
      data: { isActive: user.isActive }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ===== ORDERS =====
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.orderNumber = { contains: search, mode: 'insensitive' };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true, phone: true }
          },
          rate: {
            select: { currencyCode: true, currencyName: true }
          },
          partner: {
            select: { name: true, city: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        rate: true,
        partner: true,
        address: true,
        transactions: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.update({
      where: { id },
      data: { status }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'ORDER_STATUS_UPDATED',
        entity: 'Order',
        entityId: id,
        metadata: { status, orderNumber: order.orderNumber }
      }
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const assignPartner = async (req, res) => {
  try {
    const { id } = req.params;
    const { partnerId } = req.body;

    const order = await prisma.order.update({
      where: { id },
      data: { partnerId }
    });

    res.json({
      success: true,
      message: 'Partner assigned successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Assign partner error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ===== RATES =====
const createRate = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { currencyCode, currencyName, buyRate, sellRate, baseRate, markup } = req.body;

    const rate = await prisma.rate.create({
      data: {
        currencyCode: currencyCode.toUpperCase(),
        currencyName,
        buyRate,
        sellRate,
        baseRate,
        markup: markup || 0
      }
    });

    // Broadcast rate update
    triggerRateBroadcast();

    res.status(201).json({
      success: true,
      message: 'Rate created successfully',
      data: { rate }
    });
  } catch (error) {
    console.error('Create rate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const updateRate = async (req, res) => {
  try {
    const { currencyCode } = req.params;
    const { currencyName, buyRate, sellRate, baseRate, markup, isActive } = req.body;

    const updateData = {};
    if (currencyName) updateData.currencyName = currencyName;
    if (buyRate) updateData.buyRate = buyRate;
    if (sellRate) updateData.sellRate = sellRate;
    if (baseRate) updateData.baseRate = baseRate;
    if (markup !== undefined) updateData.markup = markup;
    if (isActive !== undefined) updateData.isActive = isActive;
    updateData.lastUpdated = new Date();

    const rate = await prisma.rate.update({
      where: { currencyCode: currencyCode.toUpperCase() },
      data: updateData
    });

    // Broadcast rate update
    triggerRateBroadcast();

    res.json({
      success: true,
      message: 'Rate updated successfully',
      data: { rate }
    });
  } catch (error) {
    console.error('Update rate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const deleteRate = async (req, res) => {
  try {
    const { currencyCode } = req.params;

    await prisma.rate.delete({
      where: { currencyCode: currencyCode.toUpperCase() }
    });

    // Broadcast rate update
    triggerRateBroadcast();

    res.json({
      success: true,
      message: 'Rate deleted successfully'
    });
  } catch (error) {
    console.error('Delete rate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const bulkUpdateRates = async (req, res) => {
  try {
    const { rates } = req.body;

    if (!Array.isArray(rates) || rates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rates data'
      });
    }

    const updatePromises = rates.map(rate =>
      prisma.rate.update({
        where: { currencyCode: rate.currencyCode.toUpperCase() },
        data: {
          buyRate: rate.buyRate,
          sellRate: rate.sellRate,
          baseRate: rate.baseRate,
          lastUpdated: new Date()
        }
      })
    );

    await Promise.all(updatePromises);

    // Broadcast rate update
    triggerRateBroadcast();

    res.json({
      success: true,
      message: 'Rates updated successfully'
    });
  } catch (error) {
    console.error('Bulk update rates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ===== PARTNERS =====
const getAllPartners = async (req, res) => {
  try {
    const partners = await prisma.partner.findMany({
      orderBy: { createdAt: 'desc' }
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

const createPartner = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, phone, city, state, commissionRate, deliveryEnabled } = req.body;

    const partner = await prisma.partner.create({
      data: {
        name,
        email,
        phone,
        city,
        state,
        commissionRate: commissionRate || 0,
        deliveryEnabled: deliveryEnabled !== false
      }
    });

    res.status(201).json({
      success: true,
      message: 'Partner created successfully',
      data: { partner }
    });
  } catch (error) {
    console.error('Create partner error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const updatePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, city, state, rating, commissionRate, deliveryEnabled, isActive } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (city) updateData.city = city;
    if (state) updateData.state = state;
    if (rating !== undefined) updateData.rating = rating;
    if (commissionRate !== undefined) updateData.commissionRate = commissionRate;
    if (deliveryEnabled !== undefined) updateData.deliveryEnabled = deliveryEnabled;
    if (isActive !== undefined) updateData.isActive = isActive;

    const partner = await prisma.partner.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Partner updated successfully',
      data: { partner }
    });
  } catch (error) {
    console.error('Update partner error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const deletePartner = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.partner.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Partner deleted successfully'
    });
  } catch (error) {
    console.error('Delete partner error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ===== OFFERS =====
const getAllOffers = async (req, res) => {
  try {
    const offers = await prisma.offer.findMany({
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

const createOffer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      code,
      discountType,
      discountValue,
      minAmount,
      maxDiscount,
      validFrom,
      validUntil,
      usageLimit
    } = req.body;

    const offer = await prisma.offer.create({
      data: {
        title,
        description,
        code: code.toUpperCase(),
        discountType,
        discountValue,
        minAmount: minAmount || 0,
        maxDiscount,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        usageLimit
      }
    });

    res.status(201).json({
      success: true,
      message: 'Offer created successfully',
      data: { offer }
    });
  } catch (error) {
    console.error('Create offer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }
    if (updateData.validFrom) {
      updateData.validFrom = new Date(updateData.validFrom);
    }
    if (updateData.validUntil) {
      updateData.validUntil = new Date(updateData.validUntil);
    }

    const offer = await prisma.offer.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Offer updated successfully',
      data: { offer }
    });
  } catch (error) {
    console.error('Update offer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.offer.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Offer deleted successfully'
    });
  } catch (error) {
    console.error('Delete offer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ===== AUDIT LOGS =====
const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, userId } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (action) where.action = action;
    if (userId) where.userId = userId;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.auditLog.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getDashboard,
  getAllUsers,
  getUserById,
  updateKYCStatus,
  updateUserStatus,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  assignPartner,
  createRate,
  updateRate,
  deleteRate,
  bulkUpdateRates,
  getAllPartners,
  createPartner,
  updatePartner,
  deletePartner,
  getAllOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  getAuditLogs
};
