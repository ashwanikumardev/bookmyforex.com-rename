/**
 * Payment controller - Razorpay integration
 */

const Razorpay = require('razorpay');
const crypto = require('crypto');
const prisma = require('../config/database');

// Initialize Razorpay
const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    })
  : null;

// @desc    Create Razorpay order
const createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: 'Payment gateway not configured'
      });
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId }
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

    // Check if order is already paid
    if (order.paymentStatus === 'SUCCESS') {
      return res.status(400).json({
        success: false,
        message: 'Order already paid'
      });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalAmount * 100), // Amount in paise
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order.id,
        userId: req.user.id
      }
    });

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        orderId: order.id,
        userId: req.user.id,
        amount: order.totalAmount,
        currency: 'INR',
        paymentMethod: 'CARD', // Will be updated after payment
        paymentGateway: 'razorpay',
        gatewayOrderId: razorpayOrder.id,
        status: 'INITIATED'
      }
    });

    // Update order payment status
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'INITIATED' }
    });

    res.json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        transactionId: transaction.id
      }
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Verify Razorpay payment
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: 'Payment gateway not configured'
      });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Update transaction
    const transaction = await prisma.transaction.findFirst({
      where: {
        gatewayOrderId: razorpay_order_id,
        userId: req.user.id
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        gatewayPaymentId: razorpay_payment_id,
        status: 'SUCCESS'
      }
    });

    // Update order
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'SUCCESS',
        status: 'PAYMENT_COMPLETED'
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'PAYMENT_SUCCESS',
        entity: 'Transaction',
        entityId: transaction.id,
        metadata: {
          orderId,
          razorpay_payment_id
        }
      }
    });

    res.json({
      success: true,
      message: 'Payment verified successfully'
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user transactions
const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: req.user.id },
        include: {
          order: {
            select: {
              orderNumber: true,
              productType: true,
              currencyCode: true,
              amountForeign: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.transaction.count({ where: { userId: req.user.id } })
    ]);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getTransactions
};
