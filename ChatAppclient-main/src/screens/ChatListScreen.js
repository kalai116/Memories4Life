import React, { useCallback, useEffect } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChatStore } from '../store/chatStore';
import { getConversationTitle } from '../utils/conversationHelpers';
import { getMessagePreview } from '../utils/handwriting';

const formatTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const clampCount = (value) => {
  if (value === undefined || value === null) return 0;
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  if (Array.isArray(value)) {
    return clampCount(value.length);
  }
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return 0;
    return Math.max(0, Math.floor(value));
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return 0;
    const normalized = trimmed.toLowerCase();
    if (['true', 'yes', 'on'].includes(normalized)) return 1;
    if (['false', 'no', 'off'].includes(normalized)) return 0;
    const numeric = Number(trimmed);
    if (Number.isNaN(numeric)) return 0;
    return Math.max(0, Math.floor(numeric));
  }
  return 0;
};

const normalizeFlag = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return null;
    return value > 0;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return null;
    if (['true', 'yes', 'on', '1'].includes(normalized)) return true;
    if (['false', 'no', 'off', '0'].includes(normalized)) return false;
  }
  return null;
};

const readPath = (source, path) =>
  path.reduce(
    (accumulator, key) =>
      accumulator === undefined || accumulator === null ? undefined : accumulator[key],
    source,
  );

const getUnreadCount = (conversation, userId) => {
  if (!conversation) return 0;

  const directKeys = [
    'unreadCount',
    'unreadMessages',
    'unreadMessageCount',
    'unread',
    'unseenCount',
    'unseenMessages',
    'unread_total',
    'unread_total_count',
    'hasUnread',
    'hasUnreadMessages',
    'has_unread',
    'has_unread_messages',
    'hasUnreadMessage',
    'has_unread_message',
  ];

  for (const key of directKeys) {
    const value = conversation[key];
    const flag = normalizeFlag(value);
    if (flag === true) {
      return Math.max(1, clampCount(value));
    }

    const numeric = clampCount(value);
    if (numeric > 0) {
      return numeric;
    }
  }

  const nestedPaths = [
    ['lastMessage', 'unreadCount'],
    ['lastMessage', 'unread'],
    ['lastMessage', 'unreadMessages'],
    ['lastMessage', 'unseenCount'],
    ['lastMessage', 'hasUnread'],
    ['lastMessage', 'hasUnreadMessages'],
    ['lastMessage', 'has_unread'],
    ['lastMessage', 'has_unread_messages'],
    ['lastMessage', 'hasUnreadMessage'],
    ['lastMessage', 'has_unread_message'],
    ['lastMessage', 'handwriting', 'unread'],
    ['lastMessage', 'handwriting', 'hasUnread'],
    ['lastMessage', 'handwriting', 'has_unread'],
    ['lastMessage', 'handwriting', 'unseen'],
    ['lastMessage', 'handwriting', 'read'],
    ['lastMessage', 'handwriting', 'isRead'],
    ['lastMessage', 'handwriting', 'seen'],
    ['lastMessage', 'read'],
    ['lastMessage', 'isRead'],
    ['lastMessage', 'seen'],
  ];

  for (const path of nestedPaths) {
    const value = readPath(conversation, path);
    const flag = normalizeFlag(value);
    if (flag === false && path[path.length - 1].toLowerCase().includes('read')) {
      return 1;
    }
    if (flag === true) {
      return Math.max(1, clampCount(value));
    }

    const numeric = clampCount(value);
    if (numeric > 0) {
      return numeric;
    }
  }

  if (Array.isArray(conversation.messages)) {
    const unreadMessages = conversation.messages.filter((message) => {
      const fromOtherUser =
        message?.senderId !== undefined &&
        message.senderId !== null &&
        userId !== undefined &&
        userId !== null
          ? String(message.senderId) !== String(userId)
          : true;
      const readFlag = normalizeFlag(
        message?.read ??
          message?.isRead ??
          message?.seen ??
          message?.acknowledged ??
          message?.handwritingRead ??
          message?.handwriting?.read,
      );
      if (readFlag === true) {
        return false;
      }
      if (readFlag === false) {
        return fromOtherUser;
      }
      const unreadFlag = normalizeFlag(
        message?.unread ??
          message?.isUnread ??
          message?.unseen ??
          message?.delivered ??
          message?.handwritingUnread ??
          message?.handwriting?.unread,
      );
      if (unreadFlag !== null) {
        return unreadFlag && fromOtherUser;
      }
      if (message?.handwriting && fromOtherUser) {
        const handwritingRead = normalizeFlag(
          message.handwriting.read ?? message.handwriting.isRead ?? message.handwriting.seen,
        );
        if (handwritingRead === false) {
          return true;
        }
        const handwritingUnread = normalizeFlag(
          message.handwriting.unread ?? message.handwriting.unseen,
        );
        if (handwritingUnread === true) {
          return true;
        }
      }
      return fromOtherUser && !message?.pending;
    }).length;
    if (unreadMessages > 0) {
      return unreadMessages;
    }
  }

  return 0;
};

export default function ChatListScreen({ navigation }) {
  const user = useChatStore((state) => state.user);
  const conversations = useChatStore((state) => state.conversations);
  const loadingConversations = useChatStore((state) => state.loadingConversations);
  const fetchConversations = useChatStore((state) => state.fetchConversations);
  const setActiveConversation = useChatStore((state) => state.setActiveConversation);
  const socketStatus = useChatStore((state) => state.socketStatus);
  const error = useChatStore((state) => state.error);
  const clearError = useChatStore((state) => state.clearError);

  useEffect(() => {
    if (!user) {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  }, [navigation, user]);

  useFocusEffect(
    useCallback(() => {
      fetchConversations({ silent: true }).catch(() => {});
    }, [fetchConversations]),
  );

  useEffect(() => {
    if (error) {
      Alert.alert('Something went wrong', error, [
        { text: 'OK', onPress: () => clearError() },
      ]);
    }
  }, [clearError, error]);

  const openChat = (conversation) => {
    setActiveConversation(conversation);
    navigation.navigate('Chat');
  };

  const renderConversation = ({ item }) => {
    const title = getConversationTitle(item, user?.id);
    const preview =
      getMessagePreview(item?.lastMessage) || 'Tap to open the conversation';
    const timestamp = formatTime(item?.lastMessage?.createdAt || item?.updatedAt);
    const unreadCount = getUnreadCount(item, user?.id);
    const showBadge = unreadCount > 0;
    const badgeLabel = unreadCount > 99 ? '99+' : unreadCount.toString();

    return (
      <TouchableOpacity style={styles.chatItem} onPress={() => openChat(item)}>
        <View style={styles.chatInfo}>
          <Text style={styles.name}>{title}</Text>
          <Text style={styles.preview} numberOfLines={1}>
            {preview}
          </Text>
        </View>
        <View style={styles.metaColumn}>
          {timestamp ? <Text style={styles.time}>{timestamp}</Text> : null}
          {showBadge ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{badgeLabel}</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Chats</Text>
          <Text style={styles.subtitle}>{user?.username || user?.email}</Text>
          </View>
          <View style={styles.headerActions}>
            <View style={styles.socketBadge}>
              <View
                style={[
                  styles.socketIndicator,
                  socketStatus === 'open'
                    ? styles.socketIndicatorOnline
                    : socketStatus === 'connecting'
                    ? styles.socketIndicatorConnecting
                    : styles.socketIndicatorOffline,
                ]}
              />
              <Text style={styles.socketText}>{socketStatus}</Text>
            </View>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => navigation.navigate('Logout')}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.inlineButton}
          onPress={() => navigation.navigate('NewChat')}
        >
          <Text style={styles.inlineButtonText}>Start a new chat</Text>
        </TouchableOpacity>

        <FlatList
          data={conversations}
        keyExtractor={(item) =>
          item?.id !== undefined && item?.id !== null
            ? `conversation-${item.id}`
            : `conversation-${item?.lastMessage?.id ?? Math.random()}`
        }
          renderItem={renderConversation}
          extraData={conversations}
          contentContainerStyle={
            conversations?.length ? null : styles.emptyStateContainer
          }
          ListEmptyComponent={
            loadingConversations ? (
              <ActivityIndicator size="small" color="#5e60ce" />
            ) : (
              <Text style={styles.emptyStateText}>
                You have no conversations yet. Start one!
              </Text>
            )
          }
          refreshing={loadingConversations}
          onRefresh={() => fetchConversations({ silent: false })}
        />

        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('NewChat')}
          activeOpacity={0.9}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  socketBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#eef0ff',
    borderRadius: 12,
  },
  socketIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  socketIndicatorOnline: { backgroundColor: '#2dc653' },
  socketIndicatorConnecting: { backgroundColor: '#f77f00' },
  socketIndicatorOffline: { backgroundColor: '#d00000' },
  socketText: { fontSize: 12, color: '#222' },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: '#666', marginTop: 2 },
  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#5e60ce',
  },
  logoutText: { color: '#5e60ce', fontWeight: '600' },
  inlineButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#5e60ce',
    marginBottom: 12,
  },
  inlineButtonText: { color: '#fff', fontWeight: '600' },
  chatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  chatInfo: { flex: 1, paddingRight: 12 },
  metaColumn: { alignItems: 'flex-end', justifyContent: 'center', minWidth: 48 },
  name: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  preview: { color: '#6c6c6c' },
  time: { color: '#999', fontSize: 12 },
  unreadBadge: {
    marginTop: 6,
    minWidth: 22,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 11,
    backgroundColor: '#5e60ce',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  emptyStateContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: { color: '#777', fontSize: 14 },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#5e60ce',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  fabText: { fontSize: 26, color: '#fff', marginTop: -2 },
});
