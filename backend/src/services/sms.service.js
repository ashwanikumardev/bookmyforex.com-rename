/**
 * SMS service using Twilio
 */

const twilio = require('twilio');

const client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Send SMS
const sendSMS = async (to, message) => {
  if (!client) {
    console.log('Twilio not configured. SMS:', to, message);
    return { success: false, error: 'Twilio not configured' };
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });

    console.log('SMS sent:', result.sid);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('SMS error:', error);
    return { success: false, error: error.message };
  }
};

// Order confirmation SMS
const sendOrderConfirmationSMS = async (phone, orderNumber) => {
  const message = `Your BookMyForex order ${orderNumber} has been confirmed. We'll update you on the progress. Thank you!`;
  return sendSMS(phone, message);
};

// Rate alert SMS
const sendRateAlertSMS = async (phone, currencyCode, currentRate) => {
  const message = `Rate Alert: ${currencyCode} is now at ₹${currentRate}. Book now on BookMyForex!`;
  return sendSMS(phone, message);
};

module.exports = {
  sendSMS,
  sendOrderConfirmationSMS,
  sendRateAlertSMS
};
