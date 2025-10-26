import axios from 'axios';

// Adjust hosts as needed for the platform you run on.
// - Android emulator: 10.0.2.2
// - iOS simulator: localhost
const API_BASE_URL = 'http://192.168.0.105:8080/api/chat';
const WS_BASE_URL = 'ws://192.168.0.105:8080/ws/chat';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const registerUser = (data) => api.post('/register', data);

export const loginUser = (data) => api.post('/login', data);

export const fetchConversations = (userId) =>
  api.get(`/users/${userId}/conversations`);

export const createConversation = (payload) => api.post('/conversations', payload);

export const fetchMessages = (conversationId) =>
  api.get(`/conversations/${conversationId}/messages`);

export const sendMessage = ({ conversationId, senderId, content }) =>
  api.post(`/conversations/${conversationId}/messages`, { senderId, content });

export const markConversationRead = ({ conversationId, userId, messageId }) =>
  api.post(`/conversations/${conversationId}/read`, { userId, messageId });

export const connectChatSocket = ({ userId, onMessage, onStatusChange }) => {
  if (!userId) {
    throw new Error('connectChatSocket requires a userId');
  }

  const wsUrl = `${WS_BASE_URL}?userId=${encodeURIComponent(userId)}`;
  const socket = new WebSocket(wsUrl);

  socket.onopen = () => onStatusChange?.('open');
  socket.onclose = (event) => onStatusChange?.('closed', event);
  socket.onerror = (event) => onStatusChange?.('error', event);
  socket.onmessage = (event) => {
    if (!onMessage) return;
    try {
      onMessage(JSON.parse(event.data));
    } catch (err) {
      console.warn('Failed to parse incoming socket message', err);
    }
  };

  return socket;
};
