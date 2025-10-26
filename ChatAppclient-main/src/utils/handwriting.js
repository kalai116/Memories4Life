const HANDWRITING_PREFIX = '__HANDWRITING__:';

const toSerializablePayload = (input) => {
  if (!input) {
    throw new Error('Handwriting payload is required.');
  }

  if (typeof input === 'string') {
    return { version: 1, type: 'image', dataUrl: input };
  }

  if (Array.isArray(input?.strokes)) {
    const size = input.size ?? {};
    return {
      version: 1,
      type: 'strokes',
      strokes: input.strokes,
      size: {
        width: typeof size.width === 'number' ? size.width : null,
        height: typeof size.height === 'number' ? size.height : null,
      },
    };
  }

  throw new Error('Unsupported handwriting payload.');
};

export const buildHandwritingPayload = (payload) => {
  const serialized = toSerializablePayload(payload);
  return `${HANDWRITING_PREFIX}${JSON.stringify(serialized)}`;
};

export const isHandwritingContent = (content) =>
  typeof content === 'string' && content.startsWith(HANDWRITING_PREFIX);

export const extractHandwritingData = (content) => {
  if (!isHandwritingContent(content)) {
    return null;
  }
  const payload = content.slice(HANDWRITING_PREFIX.length);
  const trimmed = payload.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith('{')) {
    try {
      return JSON.parse(trimmed);
    } catch (error) {
      return null;
    }
  }

  return { version: 0, type: 'image', dataUrl: payload };
};

export const getMessagePreview = (message) => {
  if (!message) return '';
  if (isHandwritingContent(message.content)) {
    return 'Handwritten message';
  }
  return message.content || '';
};

export const HANDWRITING_PREFIX_CONSTANT = HANDWRITING_PREFIX;
