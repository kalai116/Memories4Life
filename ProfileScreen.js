import { StatusBar } from 'expo-status-bar';
//import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  ScrollView
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CoupleScreen from "./CoupleScreen.js";
import Layout from './layout.js';
import MomSonDaughter from "./MomSonDaughter.js"
import FatherSonDaughter from './FatherSonDaughter.js';
import Friends from './Friends.js';
import Siblings from './Siblings.js';
import Cousins from './Cousins.js';
import Family from './Family.js';
import Others from './Others.js';
import SignUpScreen from './SignUpScreen.js';
import SettingsScreen from './SettingsScreen.js';
import App from "./App.js";

const ACCENT = "#1b495fff";
const BG = "#2596be";
const CARD = "rgba(255,255,255,0.06)";
const LINE = "rgba(255,255,255,0.15)";
const LABEL = "rgba(255,255,255,0.7)";
const TEXT = "#ffffff";


function FieldRow({ icon, label, value, editable, onChangeText, keyboardType }) {
  return (
    <View style={styles.fieldWrap}>
      <View style={styles.fieldIcon}>
        <MaterialCommunityIcons name={icon} size={22} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {editable ? (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholderTextColor={LABEL}
            keyboardType={keyboardType}
          />
        ) : (
          <Text style={styles.fieldValue}>{value}</Text>
        )}
      </View>
    </View>
  );
}

export default function ProfileScreen({ navigation }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("Anna L.");
  const [email, setEmail] = useState("anna.l@email.com");
  const [phone, setPhone] = useState("+1123 456 7890");
  const [relationship, setRelationship] = useState("Grandparent");
  const [location, setLocation] = useState("San Francisco, CA");

  const onSave = () => {
    // TODO: persist to your backend
    setEditing(false);
  };
  const insets = useSafeAreaInsets();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      {/* Top bar */}
      const style = useSafeAreaInsets();
      <View style={[styles.topBar, { marginTop: insets.top + 8}]}>
        <Pressable
            onPress={() => navigation?.goBack?.()}
            style={styles.backBtn}
        >
            <MaterialCommunityIcons name="chevron-left" size={32}  />
        </Pressable>
        <Text style={styles.title}>My Profile</Text>
        <Pressable onPress={() => setEditing((v) => !v)} hitSlop={10}>
          <Text style={styles.edit}>{editing ? "Done" : "Edit"}</Text>
        </Pressable>
      </View>

      {/* Avatar */}
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Image
            source={require("./assets/DefaultProfile.jpg")}
            style={{ width: "100%", height: "100%", borderRadius: 999 }}
            resizeMode="cover"
          />
        </View>
        <Pressable style={styles.fab} onPress={() => {/* open image picker */}}>
          <Ionicons name="pencil" size={18} color="#fff" />
        </Pressable>
      </View>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.subtitle}>Add/Change Photo</Text>

      {/* Card divider */}
      <View style={styles.divider} />

      {/* Fields */}
      <View style={styles.card}>
        <FieldRow
          icon="account-outline"
          label="Name"
          value={name}
          editable={editing}
          onChangeText={setName}
        />
        <View style={styles.line} />
        <FieldRow
          icon="email-outline"
          label="Email"
          value={email}
          editable={editing}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <View style={styles.line} />
        <FieldRow
          icon="phone-outline"
          label="Phone"
          value={phone}
          editable={editing}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <View style={styles.line} />
        <FieldRow
          icon="account-group-outline"
          label="Relationship"
          value={relationship}
          editable={editing}
          onChangeText={setRelationship}
        />
        <View style={styles.line} />
        <FieldRow
          icon="map-marker-outline"
          label="Location"
          value={location}
          editable={editing}
          onChangeText={setLocation}
        />
      </View>

      {/* Actions */}
      <Pressable
        style={[styles.saveBtn, !editing && { opacity: 0.5 }]}
        disabled={!editing}
        onPress={onSave}
      >
        <Text style={styles.saveText}>Save Changes</Text>
      </Pressable>

      <Pressable onPress={() => {/* logout logic */}} style={{ alignSelf: "center", marginTop: 18 }}>
        <Text style={styles.logout}>Log Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  title: { color: TEXT, fontSize: 22, fontWeight: "800", marginTop: 15},
  edit: { color: "#141515ff", fontSize: 16, fontWeight: "700", marginTop: 15},

  avatarWrap: { alignItems: "center", marginTop: 10, marginBottom: 6 },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: CARD,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    right: (320 - 140) / 2 - 8, // positions near avatar edge on most phones
    bottom: 6,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  name: { color: TEXT, fontSize: 28, fontWeight: "800", textAlign: "center", marginTop: 12 },
  subtitle: { color: LABEL, fontSize: 14, textAlign: "center", marginTop: 4 },

  divider: { height: 1, backgroundColor: LINE, marginVertical: 18 },

  card: {
    backgroundColor: CARD,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  fieldWrap: { flexDirection: "row", alignItems: "center", paddingVertical: 14 },
  fieldIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center", justifyContent: "center",
    marginRight: 12,
  },
  fieldLabel: { color: LABEL, fontSize: 13, marginBottom: 4 },
  fieldValue: { color: TEXT, fontSize: 18, fontWeight: "600" },
  input: {
    color: TEXT,
    fontSize: 18,
    fontWeight: "600",
    paddingVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  line: { height: 1, backgroundColor: LINE },

  saveBtn: {
    marginTop: 22,
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  logout: { color: ACCENT, fontSize: 16, fontWeight: "800" },
});