/**
 * WebSocket service for real-time rate updates
 */

const prisma = require('../config/database');

let io;

const initializeWebSocket = (socketIo) => {
  io = socketIo;

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Send initial rates on connection
    sendLatestRates(socket);

    // Handle rate subscription
    socket.on('subscribe:rates', () => {
      console.log('Client subscribed to rates:', socket.id);
      sendLatestRates(socket);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Update rates every 30 seconds
  setInterval(async () => {
    await broadcastRates();
  }, 30000);
};

const sendLatestRates = async (socket) => {
  try {
    const rates = await prisma.rate.findMany({
      where: { isActive: true },
      select: {
        currencyCode: true,
        currencyName: true,
        buyRate: true,
        sellRate: true,
        lastUpdated: true
      }
    });

    socket.emit('rates:update', {
      rates,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending rates:', error);
  }
};

const broadcastRates = async () => {
  if (!io) return;

  try {
    const rates = await prisma.rate.findMany({
      where: { isActive: true },
      select: {
        currencyCode: true,
        currencyName: true,
        buyRate: true,
        sellRate: true,
        lastUpdated: true
      }
    });

    io.emit('rates:update', {
      rates,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error broadcasting rates:', error);
  }
};

// Manually trigger rate broadcast (called after rate updates)
const triggerRateBroadcast = () => {
  if (io) {
    broadcastRates();
  }
};

module.exports = { initializeWebSocket, triggerRateBroadcast };
