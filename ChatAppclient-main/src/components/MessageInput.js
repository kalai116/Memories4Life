import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function MessageInput({
  onSend,
  placeholder = 'Type a message…',
  disabled,
  onTyping,
  onOpenHandwriting,
}) {
  const [value, setValue] = useState('');
  const typingTimeoutRef = useRef(null);

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    onTyping?.(false);
  }, [onTyping]);

  const scheduleStopTyping = useCallback(() => {
    if (!onTyping) return;
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null;
      onTyping(false);
    }, 3000);
  }, [onTyping]);

  const handleChange = useCallback(
    (text) => {
      setValue(text);
      if (disabled) {
        stopTyping();
        return;
      }
      if (onTyping) {
        onTyping(true);
        scheduleStopTyping();
      }
    },
    [disabled, onTyping, scheduleStopTyping, stopTyping],
  );

  const handleSend = useCallback(async () => {
    if (disabled) return;
    const trimmed = value.trim();
    if (!trimmed) return;
    setValue('');

    try {
      await onSend?.(trimmed);
      stopTyping();
    } catch (error) {
      // Restore the message so the user can retry.
      setValue(trimmed);
      scheduleStopTyping();
    }
  }, [disabled, onSend, scheduleStopTyping, stopTyping, value]);

  useEffect(() => {
    if (disabled) {
      stopTyping();
    }
  }, [disabled, stopTyping]);

  useEffect(
    () => () => {
      stopTyping();
    },
    [stopTyping],
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.secondaryButton, disabled && styles.secondaryButtonDisabled]}
        onPress={onOpenHandwriting}
        disabled={disabled}
      >
        <Text style={styles.secondaryButtonText}>✍️</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        value={value}
        placeholder={placeholder}
        onChangeText={handleChange}
        editable={!disabled}
        multiline
      />
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={handleSend}
        disabled={disabled}
      >
        <Text style={styles.buttonText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
    fontSize: 15,
    maxHeight: 110,
  },
  button: {
    backgroundColor: '#5e60ce',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  buttonDisabled: {
    backgroundColor: '#a3a5d6',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    marginRight: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#5e60ce',
  },
  secondaryButtonDisabled: {
    borderColor: '#a3a5d6',
  },
  secondaryButtonText: {
    fontSize: 18,
  },
});
