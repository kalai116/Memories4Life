import React, { useEffect, useMemo, useCallback, useRef, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useChatStore } from '../store/chatStore';
import { getConversationTitle } from '../utils/conversationHelpers';
import { getNormalizedConversationId } from '../utils/socketHelpers';
import ChatBubble from '../components/ChatBubble';
import MessageInput from '../components/MessageInput';
import HandwritingComposer from '../components/HandwritingComposer';
import { buildHandwritingPayload } from '../utils/handwriting';

const buildTypingLabel = (users) => {
  if (!users.length) return '';

  const names = users
    .map(
      (user) =>
        user?.displayName ||
        user?.username ||
        user?.email ||
        (user?.userId ? `User ${user.userId}` : null),
    )
    .filter(Boolean);

  if (!names.length) return 'Someone is typing…';
  if (names.length === 1) return `${names[0]} is typing…`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing…`;
  return `${names[0]}, ${names[1]} and ${names.length - 2} others are typing…`;
};

const getMessageKey = (item, index) => {
  if (item?._key) return item._key;
  if (item?.id !== undefined && item?.id !== null) {
    return `message-${item.id}`;
  }
  return `message-${index}`;
};

export default function ChatScreen({ navigation }) {
  const user = useChatStore((state) => state.user);
  const activeConversation = useChatStore((state) => state.activeConversation);
  const messages = useChatStore((state) => state.messages);
  const loadingMessages = useChatStore((state) => state.loadingMessages);
  const loadMessages = useChatStore((state) => state.loadMessages);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const sendingMessage = useChatStore((state) => state.sendingMessage);
  const socketStatus = useChatStore((state) => state.socketStatus);
  const error = useChatStore((state) => state.error);
  const clearError = useChatStore((state) => state.clearError);
  const typingIndicators = useChatStore((state) => state.typingIndicators);
  const notifyTyping = useChatStore((state) => state.notifyTyping);
  const flatListRef = useRef(null);
  const lastMessageKeyRef = useRef(null);
  const [handwritingVisible, setHandwritingVisible] = useState(false);

  useEffect(() => {
    if (!user) {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  }, [navigation, user]);

  const activeConversationId = activeConversation?.id;

  useFocusEffect(
    useCallback(() => {
      if (!activeConversationId) {
        navigation.replace('ChatList');
        return undefined;
      }

      loadMessages(activeConversationId);
      return undefined;
    }, [activeConversationId, loadMessages, navigation]),
  );

  const headerTitle = getConversationTitle(activeConversation, user?.id);

  useEffect(() => {
    if (headerTitle) {
      navigation.setOptions({ title: headerTitle });
    }
  }, [headerTitle, navigation]);

  useEffect(() => {
    if (error) {
      Alert.alert('Chat error', error, [{ text: 'OK', onPress: () => clearError() }]);
    }
  }, [clearError, error]);

  const renderMessage = ({ item }) => (
    <ChatBubble message={item} isOwn={item?.senderId === user?.id} />
  );

  const typingUsers = useMemo(() => {
    const conversationKey = getNormalizedConversationId(activeConversation?.id);
    if (!conversationKey) return [];
    const entries = typingIndicators[conversationKey] ?? {};
    const currentUserId = user?.id === null || user?.id === undefined ? null : String(user.id);
    return Object.values(entries).filter((entry) => {
      if (!currentUserId) return true;
      const entryId =
        entry?.userId ??
        entry?.senderId ??
        entry?.participantId ??
        entry?.authorId ??
        entry?.id;
      if (entryId === null || entryId === undefined) return true;
      return String(entryId) !== currentUserId;
    });
  }, [activeConversation?.id, typingIndicators, user?.id]);

  const typingLabel = buildTypingLabel(typingUsers);

  useEffect(() => {
    if (!messages.length) {
      lastMessageKeyRef.current = null;
      return;
    }

    const lastMessage = messages[messages.length - 1];
    const key =
      lastMessage?._key ??
      (lastMessage?.id !== undefined && lastMessage?.id !== null
        ? `message-${lastMessage.id}`
        : `index-${messages.length - 1}`);

    if (lastMessageKeyRef.current === key) {
      return;
    }

    lastMessageKeyRef.current = key;
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.container}>
        {loadingMessages && !messages.length ? (
          <ActivityIndicator size="large" color="#5e60ce" style={styles.loader} />
        ) : null}

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={getMessageKey}
          contentContainerStyle={
            messages.length ? styles.listContent : styles.emptyStateContainer
          }
          ListEmptyComponent={
            !loadingMessages ? (
              <Text style={styles.emptyStateText}>Send a message to start chatting.</Text>
            ) : null
          }
          refreshing={loadingMessages}
          onRefresh={() => loadMessages(activeConversation?.id)}
          onContentSizeChange={() => {
            requestAnimationFrame(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            });
          }}
        />

        {typingLabel ? (
          <View style={styles.typingContainer}>
            <Text style={styles.typingText}>{typingLabel}</Text>
          </View>
        ) : null}

        <MessageInput
          onSend={sendMessage}
          onTyping={activeConversation ? notifyTyping : undefined}
          onOpenHandwriting={() => setHandwritingVisible(true)}
          disabled={!activeConversation || sendingMessage || socketStatus === 'connecting'}
        />
      </View>
      <HandwritingComposer
        visible={handwritingVisible}
        onClose={() => setHandwritingVisible(false)}
        onSubmit={async (handwritingData) => {
          try {
            await sendMessage(buildHandwritingPayload(handwritingData));
          } finally {
            setHandwritingVisible(false);
          }
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#f9f9f9', paddingHorizontal: 14 },
  loader: { marginTop: 20 },
  listContent: { paddingVertical: 16 },
  emptyStateContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: { color: '#777', fontSize: 14 },
  typingContainer: {
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  typingText: {
    color: '#5e60ce',
    fontSize: 13,
    fontStyle: 'italic',
  },
});
