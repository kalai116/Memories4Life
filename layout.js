import { StatusBar } from 'expo-status-bar';
//import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaFrame } from 'react-native-safe-area-context';
import CoupleScreen from "./CoupleScreen.js";
import App from './App.js';
import SignUpScreen from './SignUpScreen.js';

const ACCENT = "#1b495fff"; 
const BG = "#2596be";
const PANEL = "#92a8ceff";
const TAB_BG = "#92a8ceff";
const HomeStack = createNativeStackNavigator();

export default function Layout ({children}) {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={["top","left", "right"]}>
          <View style={[styles.header,{paddingBottom: 8 }]}>
            <Pressable
              style={styles.headerIcon}
              onPress={() => navigation.navigate("SignUp")}
            >
              <Ionicons name="person-add-outline" size={22} color={ACCENT} />
            </Pressable>
    
            <Text style={styles.headerTitle}>Memories4Life</Text>
    
            <Pressable
              style={styles.headerIcon}
              onPress={() => navigation.navigate("Settings")}
            >
              <Ionicons name="settings-outline" size={22} color={ACCENT} />
            </Pressable>
          </View>
    
          {/* 🔽 Child screen content */}
          <View style={{ flex: 1, paddingHorizontal: 12, paddingTop: 8, paddingBottom: insets.bottom }}>
            {children}
            </View>
        </SafeAreaView>
      );
    }

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    //paddingVertical: 10,
    paddingTop: 6,
    paddingBottom: 6,
    gap: 12,
    
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dce2e9ff",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: ACCENT,
},
content: {
    flex: 1,
    paddingHorizontal: 12, // horizontal breathing room only
    paddingTop: 0,         
}
});
    