/**
 * socket.js
 * Simple Socket.IO client wrapper. Call initSocket(token) after login.
 * Use getSocket() to access the socket elsewhere.
 */
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config';

let socket = null;

export function initSocket(token) {
  if (socket && socket.connected) return socket;
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: true
  });
  socket.on('connect', () => console.log('socket connected', socket.id));
  socket.on('connect_error', (err) => console.warn('socket connect_error', err.message));
  return socket;
}

export function getSocket() { return socket; }
export function disconnectSocket() { if (socket) { socket.disconnect(); socket = null; } }
