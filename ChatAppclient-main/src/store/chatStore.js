import { create } from 'zustand';
import {
  registerUser,
  loginUser,
  fetchConversations as fetchConversationsApi,
  createConversation,
  fetchMessages,
  sendMessage as sendMessageApi,
  connectChatSocket,
  markConversationRead as markConversationReadApi,
} from '../api/chatService';
import {
  normalizeMessagesList,
  prepareOptimisticMessage,
  upsertMessage,
} from '../utils/messageHelpers';
import {
  getNormalizedConversationId,
  parseSocketEnvelope,
} from '../utils/socketHelpers';

const SOCKET_RECONNECT_DELAY_MS = 2500;
const TYPING_IDLE_TIMEOUT_MS = 6000;
const TYPING_RENOTIFY_MS = 2500;

const typingExpiryTimers = new Map();

const clearTypingExpiryTimers = () => {
  typingExpiryTimers.forEach((timerId) => clearTimeout(timerId));
  typingExpiryTimers.clear();
};

const parseApiError = (error) =>
  error?.response?.data?.message ??
  error?.message ??
  'Something went wrong. Please try again.';

const initialState = {
  user: null,
  conversations: [],
  activeConversation: null,
  messages: [],
  socket: null,
  socketStatus: 'disconnected',
  loading: false,
  loadingConversations: false,
  loadingMessages: false,
  sendingMessage: false,
  conversationActionInFlight: false,
  error: null,
  typingIndicators: {},
  lastTypingSentAt: 0,
  _isTypingActive: false,
};

const createTypingKey = (conversationId, participantKey) =>
  `${conversationId}:${participantKey}`;

const buildParticipantKey = (userId, displayName) => {
  if (userId !== null && userId !== undefined) {
    return `user-${userId}`;
  }
  if (displayName) {
    return `name-${displayName.trim().toLowerCase().replace(/\s+/g, '-')}`;
  }
  return 'anonymous';
};

const shouldReconnect = (status) => ['error', 'closed'].includes(status);

export const useChatStore = create((set, get) => {
  const handleAuth =
    (request) =>
    async (form) => {
      set({ loading: true, error: null });
      try {
        const { data } = await request(form);
        set({ user: data, loading: false });
        get().connectSocket(data.id);
        get()
          .fetchConversations()
          .catch((error) =>
            console.warn('Failed to fetch conversations after auth', error),
          );
        return data;
      } catch (error) {
        set({ error: parseApiError(error), loading: false });
        throw error;
      }
    };

  const reconnectLater = (userId) => {
    setTimeout(() => {
      const { user, socketStatus } = get();
      if (user?.id === userId && shouldReconnect(socketStatus)) {
        get().connectSocket(userId);
      }
    }, SOCKET_RECONNECT_DELAY_MS);
  };

  const stopTypingTimer = (timerKey) => {
    if (!typingExpiryTimers.has(timerKey)) return;
    clearTimeout(typingExpiryTimers.get(timerKey));
    typingExpiryTimers.delete(timerKey);
  };

  const removeTypingEntry = (conversationId, participantKey) => {
    set((state) => {
      const typingIndicators = { ...state.typingIndicators };
      const conversationTyping = { ...(typingIndicators[conversationId] ?? {}) };
      delete conversationTyping[participantKey];

      if (Object.keys(conversationTyping).length) {
        typingIndicators[conversationId] = conversationTyping;
      } else {
        delete typingIndicators[conversationId];
      }

      return { typingIndicators };
    });
  };

  return {
    ...initialState,

    clearError: () => set({ error: null }),

    register: handleAuth(registerUser),
    login: handleAuth(loginUser),

    connectSocket: (explicitUserId) => {
      const userId = explicitUserId ?? get().user?.id;
      if (!userId) return;

      const existingSocket = get().socket;
      existingSocket?.close();

      set({
        socket: null,
        socketStatus: 'connecting',
        lastTypingSentAt: 0,
        _isTypingActive: false,
      });

      try {
        const socket = connectChatSocket({
          userId,
          onMessage: (payload) => get().handleSocketEnvelope(payload),
          onStatusChange: (status) => {
            set({ socketStatus: status });
            if (shouldReconnect(status) && get().user?.id === userId) {
              reconnectLater(userId);
            }
          },
        });

        set({ socket });
      } catch (error) {
        console.warn('Socket connection failed', error);
        set({ socket: null, socketStatus: 'error' });
      }
    },

    handleSocketEnvelope: (payload) => {
      const { conversationId, message, typingEvent, shouldRefreshConversations } =
        parseSocketEnvelope(payload);

      const activeId = getNormalizedConversationId(get().activeConversation?.id);
      const incomingId = getNormalizedConversationId(conversationId);

      const appliesToActive =
        Boolean(message) &&
        (incomingId ? activeId && incomingId === activeId : Boolean(activeId));

      if (appliesToActive) {
        set((state) => ({
          messages: upsertMessage(state.messages, message),
        }));

        const messageId =
          message?.id ?? message?._id ?? message?.messageId ?? message?.uuid ?? null;
        const senderId =
          message?.senderId ??
          message?.sender?.id ??
          message?.authorId ??
          message?.author?.id ??
          null;
        const currentUserId = get().user?.id;
        const shouldMarkRead =
          messageId &&
          senderId !== null &&
          senderId !== undefined &&
          currentUserId !== null &&
          currentUserId !== undefined &&
          String(senderId) !== String(currentUserId);

        if (shouldMarkRead) {
          const resolvedConversationId =
            get().activeConversation?.id ?? conversationId ?? incomingId;
          if (resolvedConversationId) {
            get().markConversationRead(resolvedConversationId, messageId);
          }
        }
      }

      if (typingEvent) {
        get().markTypingActivity({
          conversationId: typingEvent.conversationId ?? incomingId ?? activeId,
          userId: typingEvent.userId,
          displayName: typingEvent.displayName,
          isTyping: typingEvent.isTyping,
        });
      }

      if (shouldRefreshConversations) {
        get()
          .fetchConversations({ silent: true })
          .catch((error) =>
            console.warn('Failed to refresh conversation list', error),
          );
      }
    },

    fetchConversations: async (options = {}) => {
      const { silent = false } = options;
      const userId = get().user?.id;
      if (!userId) return [];

      if (!silent) {
        set({ loadingConversations: true, error: null });
      } else {
        set({ error: null });
      }

      try {
        const { data } = await fetchConversationsApi(userId);
        set((state) => ({
          conversations: data ?? [],
          loadingConversations: silent ? state.loadingConversations : false,
        }));
        return data;
      } catch (error) {
        const message = parseApiError(error);
        set((state) => ({
          error: message,
          loadingConversations: silent ? state.loadingConversations : false,
        }));
        throw error;
      }
    },

    setActiveConversation: (conversation) => {
      if (get()._isTypingActive && get().activeConversation?.id) {
        get().notifyTyping(false);
      }

      clearTypingExpiryTimers();

      if (!conversation) {
        set({
          activeConversation: null,
          messages: [],
          typingIndicators: {},
          lastTypingSentAt: 0,
          _isTypingActive: false,
        });
        return;
      }

      set({
        activeConversation: conversation,
        messages: [],
        typingIndicators: {},
        lastTypingSentAt: 0,
        _isTypingActive: false,
      });
      get().markConversationRead(conversation.id, conversation.lastMessage?.id);
      get().loadMessages(conversation.id);
    },

    loadMessages: async (conversationId) => {
      const targetId = conversationId ?? get().activeConversation?.id;
      if (!targetId) return [];

      set({ loadingMessages: true, error: null });
      try {
        const { data } = await fetchMessages(targetId);
        const normalized = normalizeMessagesList(data ?? []);
        set({ messages: normalized, loadingMessages: false });
        const lastMessageId =
          normalized.length && normalized[normalized.length - 1]
            ? normalized[normalized.length - 1].id
            : null;
        await get().markConversationRead(targetId, lastMessageId);
        return normalized;
      } catch (error) {
        const message = parseApiError(error);
        set({ error: message, loadingMessages: false });
        throw error;
      }
    },

    markConversationRead: async (conversationId, messageId) => {
      const userId = get().user?.id;
      if (!userId || !conversationId) {
        return null;
      }

      const targetConversationId = getNormalizedConversationId(conversationId);
      const clearUnreadState = (conversation) => {
        if (
          !conversation ||
          getNormalizedConversationId(conversation.id) !== targetConversationId
        ) {
          return conversation;
        }

        const lastMessage = conversation.lastMessage
          ? {
              ...conversation.lastMessage,
              unread: false,
              unreadCount: 0,
              unreadMessageCount: 0,
              unreadMessages: 0,
              unseenCount: 0,
              unseenMessages: 0,
              read: true,
              isRead: true,
              seen: true,
            }
          : conversation.lastMessage;

        return {
          ...conversation,
          unread: false,
          unreadCount: 0,
          unreadMessageCount: 0,
          unreadMessages: 0,
          unread_total: 0,
          unread_total_count: 0,
          unseenCount: 0,
          unseenMessages: 0,
          lastMessage,
        };
      };

      set((state) => ({
        conversations: state.conversations.map(clearUnreadState),
        activeConversation: clearUnreadState(state.activeConversation),
      }));

      try {
        const { data } = await markConversationReadApi({
          conversationId,
          userId,
          messageId,
        });

        if (data) {
          set((state) => {
            const applyUpdate = (conversation) => {
              if (
                !conversation ||
                getNormalizedConversationId(conversation.id) !==
                  getNormalizedConversationId(data.id)
              ) {
                return conversation;
              }
              return {
                ...conversation,
                ...data,
                participants: data.participants ?? conversation.participants,
                lastMessage: data.lastMessage ?? conversation.lastMessage,
                unreadCount:
                  typeof data.unreadCount === 'number'
                    ? data.unreadCount
                    : conversation.unreadCount ?? 0,
              };
            };

            return {
              conversations: state.conversations.map(applyUpdate),
              activeConversation: applyUpdate(state.activeConversation),
            };
          });
        }

        return data;
      } catch (error) {
        console.warn('Failed to mark conversation read', error);
        return null;
      }
    },

    startConversation: async (targetInput) => {
      const { user } = get();
      if (!user) {
        throw new Error('Please register or log in before starting a conversation.');
      }

      const trimmed = targetInput?.trim();
      if (!trimmed) {
        throw new Error('Enter an email or user ID to start chatting.');
      }

      const payload = trimmed.includes('@')
        ? { initiatorId: user.id, targetEmail: trimmed }
        : { initiatorId: user.id, targetUserId: trimmed };

      set({ conversationActionInFlight: true, error: null });
      try {
        const { data } = await createConversation(payload);

        set((state) => {
          const conversations = state.conversations.some((item) => item.id === data.id)
            ? state.conversations.map((item) =>
                item.id === data.id ? data : item,
              )
            : [data, ...state.conversations];

          return { conversations, activeConversation: data };
        });

        await get().loadMessages(data.id);
        return data;
      } catch (error) {
        const message = parseApiError(error);
        set({ error: message });
        throw error;
      } finally {
        set({ conversationActionInFlight: false });
      }
    },

    sendMessage: async (content) => {
      const { user, activeConversation } = get();
      if (!user || !activeConversation) {
        throw new Error('No active conversation selected.');
      }

      const trimmed = content?.trim();
      if (!trimmed) return;

      const tempId = `local-${Date.now()}`;
      const optimisticMessage = prepareOptimisticMessage({
        id: tempId,
        conversationId: activeConversation.id,
        senderId: user.id,
        content: trimmed,
      });

      set((state) => ({
        messages: upsertMessage(state.messages, optimisticMessage),
        sendingMessage: true,
        error: null,
      }));

      try {
        const { data } = await sendMessageApi({
          conversationId: activeConversation.id,
          senderId: user.id,
          content: trimmed,
        });

        if (data) {
          set((state) => {
            const withoutTemp = state.messages.filter(
              (message) =>
                message.id !== tempId && message._key !== optimisticMessage._key,
            );
            return {
              messages: upsertMessage(withoutTemp, data),
              sendingMessage: false,
            };
          });
          return;
        }

        await get().loadMessages(activeConversation.id);
        set({ sendingMessage: false });
      } catch (error) {
        const message = parseApiError(error);
        set((state) => ({
          messages: state.messages.filter(
            (message) =>
              message.id !== tempId && message._key !== optimisticMessage._key,
          ),
          sendingMessage: false,
          error: message,
        }));
        throw error;
      } finally {
        get().notifyTyping(false);
      }
    },

    markTypingActivity: ({ conversationId, userId, displayName, isTyping }) => {
      const activeId = getNormalizedConversationId(get().activeConversation?.id);
      const targetConversationId = getNormalizedConversationId(conversationId ?? activeId);
      if (!targetConversationId) return;

      const currentUserId = get().user?.id;
      if (
        userId !== null &&
        userId !== undefined &&
        currentUserId !== undefined &&
        currentUserId !== null &&
        String(currentUserId) === String(userId)
      ) {
        return;
      }

      const participantKey = buildParticipantKey(userId, displayName);

      set((state) => {
        const typingIndicators = { ...state.typingIndicators };
        const conversationTyping = { ...(typingIndicators[targetConversationId] ?? {}) };

        if (isTyping === false) {
          delete conversationTyping[participantKey];
        } else {
          conversationTyping[participantKey] = {
            userId: userId ?? participantKey,
            displayName: displayName || 'Someone',
            lastActivity: Date.now(),
          };
        }

        if (Object.keys(conversationTyping).length) {
          typingIndicators[targetConversationId] = conversationTyping;
        } else {
          delete typingIndicators[targetConversationId];
        }

        return { typingIndicators };
      });

      const timerKey = createTypingKey(targetConversationId, participantKey);
      stopTypingTimer(timerKey);

      if (isTyping === false) {
        return;
      }

      const timeoutId = setTimeout(() => {
        removeTypingEntry(targetConversationId, participantKey);
        stopTypingTimer(timerKey);
      }, TYPING_IDLE_TIMEOUT_MS);

      typingExpiryTimers.set(timerKey, timeoutId);
    },

    notifyTyping: (isTyping) => {
      const {
        socket,
        activeConversation,
        user,
        _isTypingActive,
        lastTypingSentAt,
      } = get();

      const readyState = typeof WebSocket !== 'undefined' ? WebSocket.OPEN : 1;
      const socketReady =
        socket &&
        socket.readyState === readyState &&
        activeConversation &&
        user;

      const now = Date.now();
      const shouldSend =
        socketReady &&
        (isTyping !== _isTypingActive ||
          (isTyping && now - (lastTypingSentAt || 0) > TYPING_RENOTIFY_MS));

      if (shouldSend) {
        try {
          socket.send(
            JSON.stringify({
              type: 'typing',
              conversationId: activeConversation.id,
              userId: user.id,
              isTyping,
            }),
          );
        } catch (error) {
          console.warn('Failed to send typing state', error);
        }
      }

      if (isTyping !== _isTypingActive || !isTyping) {
        set({
          _isTypingActive: isTyping,
          lastTypingSentAt: isTyping ? now : 0,
        });
      }
    },

    logout: () => {
      const { socket } = get();
      if (socket) {
        socket.onopen = null;
        socket.onclose = null;
        socket.onerror = null;
        socket.onmessage = null;
        try {
          socket.close();
        } catch (error) {
          console.warn('Failed to close socket on logout', error);
        }
      }

      clearTypingExpiryTimers();
      set({ ...initialState });
    },
  };
});
