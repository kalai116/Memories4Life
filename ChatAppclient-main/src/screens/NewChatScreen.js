import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useChatStore } from '../store/chatStore';

export default function NewChatScreen({ navigation }) {
  const [target, setTarget] = useState('');
  const user = useChatStore((state) => state.user);
  const startConversation = useChatStore((state) => state.startConversation);
  const loading = useChatStore((state) => state.conversationActionInFlight);
  const error = useChatStore((state) => state.error);
  const clearError = useChatStore((state) => state.clearError);

  useEffect(() => {
    if (!user) {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  }, [navigation, user]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (error) {
      Alert.alert('Unable to start chat', error, [
        { text: 'OK', onPress: () => clearError() },
      ]);
    }
  }, [clearError, error]);

  const handleStartConversation = async () => {
    if (!target.trim()) {
      Alert.alert('Missing recipient', 'Enter a user ID or email first.');
      return;
    }

    try {
      await startConversation(target.trim());
      setTarget('');
      navigation.replace('Chat');
    } catch {
      // Error already displayed via Alert from store state.
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Start a new chat</Text>
      <Text style={styles.subtitle}>
        Enter the user ID or email of the person you want to message.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Email or user ID"
        value={target}
        onChangeText={setTarget}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
      />
      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
        onPress={handleStartConversation}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Start chat</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
        <Text style={styles.secondaryButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { color: '#666', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#5e60ce',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonDisabled: { opacity: 0.6 },
  primaryButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  secondaryButtonText: { color: '#333', fontWeight: '500' },
});
