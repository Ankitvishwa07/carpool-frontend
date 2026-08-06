import { io } from 'socket.io-client';
import { getAccessToken } from './client';

const SOCKET_URL = import.meta.env.VITE_API_URL.replace(/\/api$/, '');

let chatSocket = null;
let notificationSocket = null;

function connectNamespace(namespace, existing) {
  const token = getAccessToken();

  if (existing && existing.connected) return existing;
  if (existing) existing.disconnect();

  return io(`${SOCKET_URL}${namespace}`, {
    auth: { token },
    withCredentials: true,
    autoConnect: true,
  });
}

export function getChatSocket() {
  chatSocket = connectNamespace('/chat', chatSocket);
  return chatSocket;
}

export function getNotificationSocket() {
  notificationSocket = connectNamespace('/notifications', notificationSocket);
  return notificationSocket;
}

export function disconnectChatSocket() {
  if (chatSocket) {
    chatSocket.disconnect();
    chatSocket = null;
  }
}

export function disconnectNotificationSocket() {
  if (notificationSocket) {
    notificationSocket.disconnect();
    notificationSocket = null;
  }
}

export function disconnectAllSockets() {
  disconnectChatSocket();
  disconnectNotificationSocket();
}