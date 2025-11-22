import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const InitialAvatar = ({ name, size = 50, backgroundColor = '#007bff', textColor = 'white' }) => {
  const getInitials = (fullName) => {
    if (!fullName) return '';
    const nameParts = fullName.split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    } else if (nameParts.length > 1) {
      return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
    }
    return '';
  };

  const initials = getInitials(name);

  return (
    <View style={[styles.avatarContainer, { width: size, height: size, borderRadius: size / 2, backgroundColor , marginRight:10}]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.4, color: textColor }]}>
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontWeight: 'bold',
  },
});

export default InitialAvatar;