/**
 * WebSocket client for real-time rate updates
 */

import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const initializeWebSocket = () => {
  if (!socket) {
    socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
      socket?.emit('subscribe:rates');
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
  }

  return socket;
};

export const subscribeToRates = (callback: (data: any) => void) => {
  const ws = initializeWebSocket();
  ws.on('rates:update', callback);
  return () => {
    ws.off('rates:update', callback);
  };
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default { initializeWebSocket, subscribeToRates, disconnectWebSocket };
