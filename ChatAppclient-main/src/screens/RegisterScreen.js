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

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const register = useChatStore((state) => state.register);
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
      Alert.alert('Registration failed', error, [
        { text: 'OK', onPress: () => clearError() },
      ]);
    }
  }, [clearError, error]);

  const isEmailValid =
    !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());

  const handleRegister = async () => {
    if (!username.trim() || !email.trim()) {
      Alert.alert('Missing information', 'Enter both username and email to continue.');
      return;
    }

    if (!isEmailValid) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }

    try {
      await register({ username: username.trim(), email: email.trim().toLowerCase() });
      navigation.reset({ index: 0, routes: [{ name: 'ChatList' }] });
    } catch {
      // Error is handled in the store and surfaced via alert.
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        placeholder="Username"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        placeholder="Email"
        style={[styles.input, !isEmailValid && email ? styles.inputError : null]}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => navigation.replace('Login')}
        disabled={loading}
      >
        <Text style={styles.linkText}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 8 },
  inputError: { borderColor: '#d00000' },
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
