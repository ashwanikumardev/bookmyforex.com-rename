/**
 * Generate unique order numbers
 */

const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BMF${timestamp}${random}`;
};

module.exports = { generateOrderNumber };
