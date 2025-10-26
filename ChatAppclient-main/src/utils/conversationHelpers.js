export const getConversationTitle = (conversation, userId) => {
  if (!conversation) return 'Conversation';
  if (conversation.title) return conversation.title;
  if (conversation.name) return conversation.name;

  const participants = Array.isArray(conversation.participants)
    ? conversation.participants
    : Array.isArray(conversation.users)
    ? conversation.users
    : [];

  const other = participants.find((participant) => participant?.id !== userId);
  if (other) {
    return other.displayName || other.username || other.email || `Conversation #${conversation.id}`;
  }

  return conversation.id ? `Conversation #${conversation.id}` : 'Conversation';
};
