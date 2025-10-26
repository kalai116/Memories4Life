// Chat message helpers focused on keeping state data predictable.
const TIMESTAMP_FIELDS = ['createdAt', 'timestamp', 'sentAt', 'updatedAt'];

const firstValue = (values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return null;
};

const toIsoString = (value) => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
};

const resolveTimestamp = (message = {}) =>
  firstValue(TIMESTAMP_FIELDS.map((field) => toIsoString(message[field]))) ??
  new Date().toISOString();

const deriveKey = (message) => {
  if (message.id !== undefined && message.id !== null) {
    return `id-${message.id}`;
  }

  const sender =
    message.senderId ??
    message.sender?.id ??
    message.authorId ??
    message.author?.id ??
    'anonymous';

  return `temp-${sender}-${message.createdAt}`;
};

export const normalizeMessage = (incoming = {}) => {
  const createdAt = resolveTimestamp(incoming);
  const pending = Boolean(incoming.pending);

  return {
    ...incoming,
    createdAt,
    pending,
    _key: incoming._key ?? deriveKey({ ...incoming, createdAt }),
  };
};

const compareByTimestamp = (a, b) =>
  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

export const sortMessagesByTimestamp = (messages = []) =>
  [...messages].sort(compareByTimestamp);

export const upsertMessage = (messages = [], rawMessage) => {
  const normalized = normalizeMessage(rawMessage);

  const byIdIndex =
    normalized.id !== undefined && normalized.id !== null
      ? messages.findIndex((item) => item.id === normalized.id)
      : -1;

  const byKeyIndex =
    byIdIndex === -1
      ? messages.findIndex((item) => item._key === normalized._key)
      : -1;

  if (byIdIndex === -1 && byKeyIndex === -1) {
    return sortMessagesByTimestamp([...messages, normalized]);
  }

  const index = byIdIndex !== -1 ? byIdIndex : byKeyIndex;
  const nextMessages = [...messages];
  nextMessages[index] = { ...nextMessages[index], ...normalized };
  return sortMessagesByTimestamp(nextMessages);
};

export const normalizeMessagesList = (messages = []) =>
  sortMessagesByTimestamp(messages.map((message) => normalizeMessage(message)));

export const prepareOptimisticMessage = (message) =>
  normalizeMessage({ ...message, pending: true });
