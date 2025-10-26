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

const buildLoginPayload = (identifier) => {
  const trimmed = identifier?.trim();
  if (!trimmed) return {};
  if (trimmed.includes('@')) {
    return { email: trimmed.toLowerCase() };
  }
  return { username: trimmed };
};

export default function LoginScreen({ navigation }) {
  const [identifier, setIdentifier] = useState('');
  const login = useChatStore((state) => state.login);
  const user = useChatStore((state) => state.user);
  const loading = useChatStore((state) => state.loading);
  const error = useChatStore((state) => state.error);
  const clearError = useChatStore((state) => state.clearError);

  useEffect(() => {
    if (user) {
      navigation.reset({ index: 0, routes: [{ name: 'ChatList' }] });
    }
  }, [navigation, user]);

  useEffect(() => {
    if (error) {
      Alert.alert('Login failed', error, [{ text: 'OK', onPress: () => clearError() }]);
    }
  }, [clearError, error]);

  const handleLogin = async () => {
    const payload = buildLoginPayload(identifier);
    if (!payload.email && !payload.username) {
      Alert.alert('Missing information', 'Enter your email or username to continue.');
      return;
    }

    try {
      await login(payload);
      navigation.reset({ index: 0, routes: [{ name: 'ChatList' }] });
    } catch {
      // Error handled by store/alert.
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Sign in with the email or username you registered.</Text>

      <TextInput
        placeholder="Email or username"
        style={styles.input}
        value={identifier}
        onChangeText={setIdentifier}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Log in</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => navigation.replace('Register')}
        disabled={loading}
      >
        <Text style={styles.linkText}>Need an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  subtitle: { color: '#666', marginBottom: 24, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 14,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#5e60ce',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  linkButton: { marginTop: 16, alignItems: 'center' },
  linkText: { color: '#5e60ce', fontWeight: '500' },
});
