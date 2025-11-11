/**
 * Authentication and authorization middleware
 */

const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

// Verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        kycStatus: true,
        walletBalance: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed'
    });
  }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.'
    });
  }
};

// Partner only middleware
const partnerOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'PARTNER' || req.user.role === 'ADMIN')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Partner only.'
    });
  }
};

// KYC verified middleware
const kycVerified = (req, res, next) => {
  if (req.user && req.user.kycStatus === 'VERIFIED') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'KYC verification required to perform this action'
    });
  }
};

module.exports = { protect, adminOnly, partnerOnly, kycVerified };
