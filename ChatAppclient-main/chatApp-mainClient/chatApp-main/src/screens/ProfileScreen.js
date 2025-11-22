import React,{useContext} from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {UserContext} from '../Context/UserContext';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const navigation = useNavigation();
const { logout } = useContext(UserContext);
  


  const logoutbtn =  async ()  => {
    try {
     await logout();
      navigation.navigate("Login");
    } catch (err) {
      console.log("Logout error:", err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* ---------- HEADER ---------- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Profile</Text>

        {/* Placeholder so title stays centered */}
        <View style={{ width: 30 }} />
      </View>


      {/* ---------- PROFILE CONTENT ---------- */}
      <View style={styles.body}>
        <Text style={styles.text}>Profile Screen</Text>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity style={styles.logoutButton} onPress={logoutbtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

export default ProfileScreen;


// ---------------------------
// STYLES
// ---------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#fff",
    elevation: 3,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },

  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  text: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 40,
  },

  logoutButton: {
    backgroundColor: "#ff4444",
    paddingVertical: 12,
    paddingHorizontal: 35,
    borderRadius: 25,
    marginTop: 20,
  },

  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
