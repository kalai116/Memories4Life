import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [username, setUsername] = useState(null);

  // Load username from storage on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername) {
          setUsername(storedUsername);
        }
      } catch (error) {
        console.log('Error loading username:', error);
      }
    };
    loadUser();
  }, []);

  // Save username persistently
  const saveUsername = async (name) => {
    try {
      await AsyncStorage.setItem('username', name);
      setUsername(name);
    } catch (error) {
      console.log('Error saving username:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('username');
      setUsername(null);
    } catch (error) {
      console.log('Error clearing username:', error);
    }
  };

  return (
    <UserContext.Provider value={{ username, saveUsername, logout }}>
      {children}
    </UserContext.Provider>
  );
};
