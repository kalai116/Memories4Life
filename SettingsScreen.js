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
  ScrollView,
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

const ACCENT = "#1b495fff";         
const BG = "#2596be";            
const DIVIDER = "#e9edf3";
const MUTED = "#6b7280";

function Row({ icon, label, onPress, danger }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <View style={styles.rowLeft}>
        <MaterialCommunityIcons name={icon} size={20} color={danger ? "#e11d48" : ACCENT} />
        <Text style={[styles.rowLabel, danger && styles.danger]}>{label}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={22} color={MUTED} />
    </Pressable>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>
        {children}
      </View>
    </View>
  );
}

export default function SettingsScreen({ navigation }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>     
      <View style={styles.headerRow}>
        <Pressable
                    onPress={() => navigation?.goBack?.()}
                    style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={26} color="#111827" />
        </Pressable>
        <Text style={styles.header}>Settings</Text>
      </View>

      <Section title="GENERAL">
        <Row icon="account-outline"       label="Account"        onPress={() => navigation.navigate("Account")} />
        <View style={styles.divider} />
        <Row icon="bell-outline"          label="Notifications"  onPress={() => navigation.navigate("NotificationsPrefs")} />
        <View style={styles.divider} />
        <Row icon="ticket-percent-outline" label="Coupons"       onPress={() => navigation.navigate("Coupons")} />
        <View style={styles.divider} />
        <Row icon="logout"                label="Logout"         onPress={() => {/* your logout logic */}} />
        <View style={styles.divider} />
        <Row icon="delete-outline"        label="Delete account" danger onPress={() => {/* confirm + delete */}} />
      </Section>

      <Section title="FEEDBACK">
        <Row icon="bug-outline"  label="Report a bug"   onPress={() => navigation.navigate("ReportBug")} />
        <View style={styles.divider} />
        <Row icon="send-outline" label="Send feedback"  onPress={() => navigation.navigate("SendFeedback")} />
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  container: { paddingHorizontal: 16, paddingBottom: 24 },
  header: { fontSize: 25, fontWeight: "800", marginTop: 8, marginBottom: 1, color: "#111827"},

  section: { marginTop: 1 },
  sectionTitle: { fontSize: 12, fontWeight: "800", color: MUTED, marginBottom: 8, letterSpacing: 0.5 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  headerRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
  marginTop: 50,
  marginBottom: 12,
},

  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14 },
  rowPressed: { opacity: 0.7 },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  rowLabel: { fontSize: 16, color: "#111827", fontWeight: "600" },
  danger: { color: "#e11d48" },

  divider: { height: 1, backgroundColor: DIVIDER, marginLeft: 30 }, // indented divider
});