/**
 * Order controller
 */

const { validationResult } = require('express-validator');
const prisma = require('../config/database');
const { generateOrderNumber } = require('../utils/orderNumber');
const { sendOrderConfirmationEmail } = require('../services/email.service');
const { sendOrderConfirmationSMS } = require('../services/sms.service');

// @desc    Create new order
const createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      productType,
      currencyCode,
      amountForeign,
      addressId,
      deliveryType,
      notes,
      metadata
    } = req.body;

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

    // Determine exchange rate based on product type
    let exchangeRate;
    if (productType === 'SELL_CURRENCY' || productType === 'CARD_UNLOAD') {
      exchangeRate = rate.buyRate; // We buy from customer
    } else {
      exchangeRate = rate.sellRate; // We sell to customer
    }

    // Calculate amounts
    const baseAmount = amountForeign * exchangeRate;
    const commission = baseAmount * 0.02; // 2% commission
    const subtotal = baseAmount + commission;
    const taxes = subtotal * 0.18; // 18% GST
    const deliveryCharge = deliveryType === 'DOORSTEP' ? 50 : 0;
    const totalAmount = subtotal + taxes + deliveryCharge;

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: req.user.id,
        productType,
        currencyCode: currencyCode.toUpperCase(),
        amountForeign,
        amountINR: baseAmount,
        exchangeRate,
        commission,
        taxes,
        deliveryCharge,
        totalAmount,
        status: 'CREATED',
        paymentStatus: 'PENDING',
        addressId,
        deliveryType,
        notes,
        metadata: metadata || {}
      },
      include: {
        rate: true,
        address: true
      }
    });

    // Send confirmation email and SMS
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    sendOrderConfirmationEmail(user, order).catch(err => 
      console.error('Order confirmation email error:', err)
    );
    
    sendOrderConfirmationSMS(user.phone, order.orderNumber).catch(err =>
      console.error('Order confirmation SMS error:', err)
    );

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'ORDER_CREATED',
        entity: 'Order',
        entityId: order.id,
        metadata: { orderNumber: order.orderNumber }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user's orders
const getMyOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const where = { userId: req.user.id };
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          rate: {
            select: {
              currencyCode: true,
              currencyName: true
            }
          },
          address: true
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

// @desc    Get order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        rate: true,
        address: true,
        partner: true,
        transactions: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to user
    if (order.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
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

// @desc    Cancel order
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to user
    if (order.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if order can be cancelled
    const cancellableStatuses = ['CREATED', 'KYC_PENDING', 'PAYMENT_PENDING'];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'ORDER_CANCELLED',
        entity: 'Order',
        entityId: order.id,
        metadata: { orderNumber: order.orderNumber }
      }
    });

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order: updatedOrder }
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder
};
