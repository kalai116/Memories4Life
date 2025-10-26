// Minimal helpers to standardise WebSocket payloads.
const read = (source, path) =>
  path.split('.').reduce(
    (value, segment) =>
      value === undefined || value === null ? undefined : value[segment],
    source,
  );

const pick = (source, paths) => {
  for (const path of paths) {
    const value = read(source, path);
    if (value !== undefined && value !== null) {
      return value;
    }
  }
  return undefined;
};

export const getNormalizedConversationId = (value) =>
  value === undefined || value === null || value === '' ? null : String(value);

const looksLikeMessage = (candidate) => {
  if (!candidate || typeof candidate !== 'object') return false;
  const hasContent =
    candidate.content || candidate.body || candidate.text || candidate.message;
  const hasSender = candidate.senderId || candidate.sender || candidate.user;
  return Boolean(candidate.id || (hasContent && hasSender));
};

const extractMessage = (payload) => {
  const candidate = pick(payload, ['message', 'data.message', 'data.payload', 'payload']);
  if (looksLikeMessage(candidate)) {
    return candidate;
  }
  if (looksLikeMessage(payload)) {
    return payload;
  }
  return null;
};

const extractType = (payload) => {
  const raw = pick(payload, ['type', 'event', 'data.type', 'data.event']);
  return typeof raw === 'string' ? raw.toLowerCase() : '';
};

const extractTypingFlag = (payload, eventType) => {
  const direct = pick(payload, ['isTyping', 'typing', 'data.isTyping', 'data.typing']);
  if (typeof direct === 'boolean') {
    return direct;
  }
  if (typeof direct === 'string') {
    const normalized = direct.trim().toLowerCase();
    if (['true', '1', 'typing', 'start'].includes(normalized)) return true;
    if (['false', '0', 'stop', 'end'].includes(normalized)) return false;
  }
  if (!eventType) return undefined;
  if (eventType.includes('typing')) {
    return eventType.includes('stop') || eventType.includes('end') ? false : true;
  }
  return undefined;
};

const extractUser = (payload) => {
  const userId =
    pick(payload, [
      'userId',
      'senderId',
      'user.id',
      'sender.id',
      'message.senderId',
      'message.sender.id',
      'data.userId',
      'data.senderId',
      'data.user.id',
      'data.sender.id',
    ]) ?? null;

  const displayName =
    pick(payload, [
      'displayName',
      'user.displayName',
      'user.username',
      'user.email',
      'sender.displayName',
      'sender.username',
      'sender.email',
      'message.sender.displayName',
      'message.sender.username',
      'message.sender.email',
      'data.user.displayName',
      'data.user.username',
      'data.user.email',
      'data.sender.displayName',
      'data.sender.username',
      'data.sender.email',
    ]) ?? null;

  return {
    userId: userId === null || userId === undefined ? null : String(userId),
    displayName,
  };
};

export const parseSocketEnvelope = (payload = {}) => {
  const message = extractMessage(payload);

  const conversationId = getNormalizedConversationId(
    pick(payload, [
      'conversationId',
      'conversation.id',
      'message.conversationId',
      'message.conversation.id',
      'data.conversationId',
      'data.conversation.id',
    ]) ?? message?.conversationId ?? message?.conversation?.id,
  );

  const eventType = extractType(payload);
  const { userId, displayName } = extractUser(payload);
  const typingFlag = extractTypingFlag(payload, eventType);

  const typingEvent =
    typingFlag === undefined
      ? null
      : { conversationId, userId, displayName, isTyping: typingFlag };

  const shouldRefreshConversations = Boolean(
    message ?? pick(payload, ['conversation', 'data.conversation']),
  );

  return {
    conversationId,
    message,
    typingEvent,
    shouldRefreshConversations,
  };
};
