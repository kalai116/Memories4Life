import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useChatStore } from '../store/chatStore';

export default function LogoutScreen({ navigation }) {
  const logout = useChatStore((state) => state.logout);
  const user = useChatStore((state) => state.user);

  const handleLogout = () => {
    logout();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ready to log out?</Text>
      <Text style={styles.subtitle}>
        {user
          ? `You are currently signed in as ${user.username || user.email}.`
          : 'No active user session found.'}
      </Text>

      <TouchableOpacity style={styles.primaryButton} onPress={handleLogout}>
        <Text style={styles.primaryButtonText}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
        <Text style={styles.secondaryButtonText}>Stay signed in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  subtitle: { color: '#666', marginBottom: 32, textAlign: 'center' },
  primaryButton: {
    backgroundColor: '#d00000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  secondaryButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  secondaryButtonText: { color: '#333', fontWeight: '500' },
});
