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
const ACCENT_SOFT = "#a7aeeaff";
const TEXT_DARK = "#6a7683";       // slate
const BG = "#2596be";            
const OUTLINE = "#e9b8c5"; 

const categories = [
  { label: "Couple",                icon: "heart-outline" , image: require('./assets/couplebg.jpg')},
  { label: "Mom &\nSon/Daughter",   icon: "human-female-boy", image: require('./assets/momdaugbg.jpg') },
  { label: "Father &\nSon/Daughter",icon: "human-male-boy", image: require('./assets/fatherdsbg.jpg') },
  { label: "Friends",               icon: "account-multiple-outline", image: require('./assets/Friends.jpg') },
  { label: "Siblings",              icon: "human-queue", image: require('./assets/siblings.jpg') },
  { label: "Family",                icon: "human-male-female-child", image: require('./assets/Familybg.jpg') },
  { label: "Cousins",               icon: "account-group-outline", image: require('./assets/cousins.jpg') },
  { label: "Others",                icon: "plus-circle-outline", image: require('./assets/others.jpg') },
];

export default function SignUpScreen ({navigation}){
    const [Email, setEmail] = useState ("");
    const [Pwd, setPwd] = useState ("");
    const [Plan, setPlan] = useState ("monthly"); //setting the default 
    const [Selected, setSelected] = useState (null);
    return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top bar */}
        <View style={styles.topRow}>
          <Pressable
            onPress={() => navigation?.goBack?.()}
            style={styles.backBtn}
          >
            <MaterialCommunityIcons name="chevron-left" size={32} color={TEXT_DARK} />
          </Pressable>
          <Text style={styles.title}>Sign Up</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Inputs */}
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          placeholder="Enter your email"
          placeholderTextColor={TEXT_DARK + "88"}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          value={Email}
          onChangeText={setEmail}
        />

        <Text style={[styles.label, { marginTop: 18 }]}>Create Password</Text>
        <TextInput
          placeholder="Enter your password"
          placeholderTextColor={TEXT_DARK + "88"}
          secureTextEntry
          style={styles.input}
          value={Pwd}
          onChangeText={setPwd}
        />

        {/* Plans */}
        <Text style={styles.sectionTitle}>Purchase a Chat Bundle</Text>
        <View style={styles.planRow}>
          <PlanCard
            selected={Plan === "monthly"}
            price="€5"
            sub="per month"
            onPress={() => setPlan("monthly")}
          />
          <PlanCard
            selected={Plan === "yearly"}
            price="€40"
            sub="per year"
            onPress={() => setPlan("yearly")}
          />
        </View>

        {/* Category grid */}
        <View style={styles.grid}>
          {categories.map((c) => (
            <Pressable
              key={c.label} //label is the key 
              label = {c.label} 
              icon = {c.icon}
              selected = {Selected === c.label}
              style = {styles.pill}
              onPress={() => setSelected(Selected === c.label ? null : c.label)}
            >
              <MaterialCommunityIcons name={c.icon} size={22} color="#b51763" />
              <Text style={styles.pillText}>{c.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Pay button */}
        <Pressable style={styles.payBtn} onPress={() => {/* hook up later */}}>
          <Text style={styles.payText}>Pay</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

/* --- components --- */

function PlanCard({ selected, price, sub, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.planCard,
        selected && {
          borderColor: ACCENT,
          shadowOpacity: 0.12,
          shadowRadius: 10,
          elevation: 2,
        },
      ]}
    >
      <Text style={[styles.planPrice, selected && { color: ACCENT }]}>{price}</Text>
      <Text style={styles.planSub}>{sub}</Text>
    </Pressable>
  );
}

function CategoryPill({ label, icon, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pill,
        selected && { borderColor: ACCENT, backgroundColor: "#fff" },
      ]}
    >
      <MaterialCommunityIcons
        name={icon}
        size={22}
        color={selected ? ACCENT : "#9aa6b2"}
      />
      <Text style={[styles.pillText, selected && { color: TEXT_DARK }]}>
        {label}
      </Text>
    </Pressable>
  );
}

/* --- styles --- */

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 36,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: ACCENT,
    letterSpacing: 0.5,
  },
  label: {
    color: TEXT_DARK,
    fontSize: 18,
    marginTop: 8,
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: OUTLINE,
  },
  sectionTitle: {
    color: TEXT_DARK,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 26,
    marginBottom: 16,
  },
  planRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  planCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: OUTLINE,
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingVertical: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  planPrice: {
    fontSize: 28,
    fontWeight: "900",
    color: TEXT_DARK,
    marginBottom: 6,
  },
  planSub: {
    color: TEXT_DARK,
    opacity: 0.9,
    fontSize: 16,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 6,
  },
  pill: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: OUTLINE,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 14,
  },
  pillText: {
    color: TEXT_DARK,
    fontSize: 18,
    fontWeight: "800",
    flexShrink: 1,
  },
  payBtn: {
    marginTop: 28,
    backgroundColor: ACCENT_SOFT,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  payText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
