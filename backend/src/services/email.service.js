/**
 * Email service using Nodemailer
 */

const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send email
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

// Welcome email
const sendWelcomeEmail = async (user) => {
  const html = `
    <h1>Welcome to BookMyForex!</h1>
    <p>Hi ${user.firstName},</p>
    <p>Thank you for registering with BookMyForex. Your account has been created successfully.</p>
    <p>Your referral code: <strong>${user.referralCode}</strong></p>
    <p>Share this code with friends and earn rewards!</p>
    <br>
    <p>Best regards,<br>BookMyForex Team</p>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Welcome to BookMyForex',
    html,
    text: `Welcome to BookMyForex! Your referral code: ${user.referralCode}`
  });
};

// Order confirmation email
const sendOrderConfirmationEmail = async (user, order) => {
  const html = `
    <h1>Order Confirmation</h1>
    <p>Hi ${user.firstName},</p>
    <p>Your order has been confirmed!</p>
    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
    <p><strong>Product:</strong> ${order.productType}</p>
    <p><strong>Amount:</strong> ${order.amountForeign} ${order.currencyCode}</p>
    <p><strong>Total:</strong> ₹${order.totalAmount}</p>
    <br>
    <p>We'll notify you once your order is processed.</p>
    <p>Best regards,<br>BookMyForex Team</p>
  `;

  return sendEmail({
    to: user.email,
    subject: `Order Confirmation - ${order.orderNumber}`,
    html,
    text: `Order ${order.orderNumber} confirmed. Total: ₹${order.totalAmount}`
  });
};

// Rate alert email
const sendRateAlertEmail = async (user, currencyCode, currentRate, targetRate) => {
  const html = `
    <h1>Rate Alert!</h1>
    <p>Hi ${user.firstName},</p>
    <p>Good news! The ${currencyCode} rate has reached your target.</p>
    <p><strong>Current Rate:</strong> ₹${currentRate}</p>
    <p><strong>Your Target:</strong> ₹${targetRate}</p>
    <p>Login now to book your order!</p>
    <br>
    <p>Best regards,<br>BookMyForex Team</p>
  `;

  return sendEmail({
    to: user.email,
    subject: `Rate Alert: ${currencyCode}`,
    html,
    text: `${currencyCode} rate alert: Current ₹${currentRate}, Target ₹${targetRate}`
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendRateAlertEmail
};
