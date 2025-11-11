/**
 * Generate unique referral codes
 */

const crypto = require('crypto');

const generateReferralCode = (firstName, lastName) => {
  const prefix = (firstName.substring(0, 2) + lastName.substring(0, 2)).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}${random}`;
};

module.exports = { generateReferralCode };
