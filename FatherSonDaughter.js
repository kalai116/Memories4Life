import { StatusBar } from 'expo-status-bar';
//import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, SafeAreaInsets, useSafeAreaInsets} from 'react-native-safe-area-context';
import 'react-native-gesture-handler';
import React from 'react';
import { useState } from 'react';
import { useRef } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  StyleSheet,
  Button,
  ImageBackground,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import { KeyboardAvoidingView, Platform, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import App from "./App.js";
import Layout from './layout.js';
import CoupleScreen from './CoupleScreen.js';
import MomSonDaughter from './MomSonDaughter.js';

export default function FatherSonDaughter () {
    const [code, setCode] = useState(["", "", "", ""]);
  const inputs = useRef([]);
  const insets = useSafeAreaInsets();

  const handleChange = (text, index) => {
    if (/^\d$/.test(text)) {
      const newCode = [...code];
      newCode[index] = text;
      setCode(newCode);
      if (index < 3) inputs.current[index + 1].focus(); // move to next box
    } else if (text === "") {
      const newCode = [...code];
      newCode[index] = "";
      setCode(newCode);
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && code[index] === "" && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleSubmit = () => {
    const enteredCode = code.join("");
    if (enteredCode.length === 4) {
      alert(`Code entered: ${enteredCode}`);
    } else {
      alert("Please enter all 4 digits");
    }
  };

    return (
        <Layout> 
        <ImageBackground
        source={require('./assets/fathersdbg.jpg')}
        style = {styles.bg}
        resizeMode='cover'
        blurRadius={1}
        >
            <BlurView intensity={10} tint="light" style={styles.overlay}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Text style={styles.title}>Quick Connect</Text>
          <Text style={styles.subtitle}>Enter the 4-digit code to connect instantly.</Text>

          <View style={styles.row}>
            {code.map((digit, index) => (
              <View key={index} style={styles.pebble}>
                <TextInput
                  ref={(ref) => (inputs.current[index] = ref)}
                  style={styles.input}
                  value={digit}
                  keyboardType="number-pad"
                  maxLength={1}
                  onChangeText={(text) => handleChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  textAlign="center"
                />
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Connect Now</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </BlurView>
    </ImageBackground>
    </Layout>
  );
}


const styles = StyleSheet.create({
  bg: {
    flex: 1,
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#b51763",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#a51313ff",
    fontWeight: "800",
    marginBottom: 40,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 40,
  },
  pebble: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.85)",
    marginHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  input: {
    fontSize: 28,
    fontWeight: "700",
    color: "#4d15afd0",
  },
  button: {
    backgroundColor: "#b51763",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 18,
  },
});