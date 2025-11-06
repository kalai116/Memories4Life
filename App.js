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

const ACCENT = "#1b495fff"; 
const BG = "#2596be";
const PANEL = "#92a8ceff";
const TAB_BG = "#92a8ceff";
const HomeStack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

//declaring variables and assigning values
//creating an array to store the image frm the asset folder to a 
//constant variable photo
//simply fetching the image and storing it to be used 
const photos = [
  require('./assets/Apphomebg.jpg'),
  
];
  
//creating an array of objects and labelled it as the icons requirement
//creatiing constant variable categories to store all the ICONS
//The icons are shown as per the relationship and are retrieved from
//MaterialCommunityIcon imported 
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


function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
      <HomeStack.Screen name="CoupleScreen" component={CoupleScreen} />
      <HomeStack.Screen name="MomSonDaughter" component={MomSonDaughter} />
      <HomeStack.Screen name="FatherSonDaughter" component={FatherSonDaughter} />
      <HomeStack.Screen name="Friends" component={Friends} />
      <HomeStack.Screen name="Siblings" component={Siblings} />
      <HomeStack.Screen name="Cousins" component={Cousins} />
      <HomeStack.Screen name="Family" component={Family} />
      <HomeStack.Screen name="Others" component={Others} />
      
    </HomeStack.Navigator>
  );
}
//Creating a header component to customize the functions of that portion 
//this is a reusable function 
function Header(){
  const navigation = useNavigation();
  return (
    //view is just like div in html 
    //it follows the style mentioned under header in style style
    //the screen starts with clickable icon declared in headericon 
    //the icon is a signup icon uses the same in built icon design
    //text the app name in the middle and settings icon in the same row
    <View style={styles.header}> 
    <Pressable 
    style = {styles.headerIcon}
    onPress={() => navigation.navigate("SignUp")}>
      <Ionicons name = "person-add-outline" size = {22} color={ACCENT} />
      
    </Pressable>
    <Text style = {styles.headerTitle}>Memories4Life</Text>
    <Pressable 
    style = {styles.headerIcon}
    onPress={() => navigation.navigate("")}>
      <Ionicons name = "settings-outline" size = {22} color={ACCENT} />
    </Pressable>
    </View>
  )
} 

//below the status bar is the image saved in a variable photo
//custom component to use the image in a panel 
function PhotoGrid() {
  return (
    //this is the style the image incorporates, sytle sheet has the style
    //declared .map helps to go through the array of images stored in the 
    //photosvariable and fetch, using source and array position as props 
    //using the 2 we can locate the image and display it 
    <View style={styles.gridWrap}>
      {photos.map((src, i) => (
        <Image source={photos[0]} style={styles.gridItem} resizeMode="cover" />
      ))}
    </View>
  );
}
//custom function to display the icons saved in the categories variable 
//it takes the props to display the content, it denotes it will label
//eg: couple, icon: the heart image, opPress: when clicked do so nd so
//when pressed, it takes the style from style sheet ad shrinks a bit like
//0.98% 
//using in built component for icon and as the name denotes icon it reads
//all the icons mentioned above are converted to clickable buttons 
function CategoryButton({ label, icon, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      styles.catButton,
      pressed && { transform: [{ scale: 0.98 }] },
    ]}>
      <MaterialCommunityIcons name={icon} size={22} color={ACCENT} />
      <Text style={styles.catLabel}>{label}</Text>
    </Pressable>
  );
}

function HomeScreen({navigation}) {
  return (
     <Layout>
      
      <PhotoGrid />
      <View style={styles.panel}>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.label}
          numColumns={2}
          columnWrapperStyle={{ gap: 14 }}
          contentContainerStyle={{ padding: 10, gap: 14 }}
          renderItem={({ item }) => (
            <CategoryButton
              label={item.label}
              icon={item.icon}
              onPress={() => {
                if(item.label === "Couple")
                  navigation.navigate("CoupleScreen");
                //else alert(`${item.label} clicked`);
                if(item.label === "Mom &\nSon/Daughter")
                  navigation.navigate("MomSonDaughter");
                if(item.label === "Father &\nSon/Daughter")
                  navigation.navigate("FatherSonDaughter");
                if(item.label === "Friends")
                  navigation.navigate("Friends");
                if(item.label === "Siblings")
                  navigation.navigate("Siblings");
                if(item.label === "Cousins")
                  navigation.navigate("Cousins");
                if(item.label === "Family")
                  navigation.navigate("Family");
                if(item.label === "Others")
                  navigation.navigate("Others");

              }}
            />
          )}
          ListFooterComponent={<View style={{ height: 8 }} />}
          showsVerticalScrollIndicator={false}
        />
      </View>
    
   </Layout> 
  );
}

// --- other tabs (placeholders) ---
const Stub = ({ title }) => (
  <View style={[styles.screen, { alignItems: "center", justifyContent: "center" }]}>
    <Text style={{ fontSize: 20 }}>{title}</Text>
  </View>
);

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="BottomTabs">
        <RootStack.Screen name="BottomTabs" component={bottomTabs} />
        <RootStack.Screen name="SignUp" component={SignUpScreen} />
        <RootStack.Screen name="Settings" component={SettingsScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
function bottomTabs (){
  return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: ACCENT,
          tabBarInactiveTintColor: "#242121ff",
          tabBarStyle: { backgroundColor: TAB_BG, borderTopWidth: 0, height: 64, paddingBottom: 10, paddingTop: 6 },
          tabBarIcon: ({ color, size }) => {
            const map = {
              Home: "home-outline",
              Memories: "images-outline",
              Notifications: "notifications-outline",
              Profile: "person-outline",
            };
            return <Ionicons name={map[route.name]} size={size} color={color} />;
          },
        })}
      >
      
        <Tab.Screen name="Home" component={HomeStackNavigator} />
        <Tab.Screen name="Memories" children={() => <Stub title="Memories" />} />
        <Tab.Screen name="Notifications" children={() => <Stub title="Notifications" />} />
        <Tab.Screen name="Profile" children={() => <Stub title="Profile" />} />
      </Tab.Navigator>
  );
}

//creating style sheet for the home page 
const styles = StyleSheet.create({
  //screen of the app
  screen: {
    flex: 1, 
    backgroundColor: BG
  },
  //styling the different portions of the app
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 12,
  },
  headerIcon: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#dce2e9ff",
  },
  headerTitle: {
    flex: 1, 
    
    textAlign: "center",
    fontSize: 20, 
    fontWeight: "800", 
    color: ACCENT,
  },
  gridWrap: {
    flexDirection: "row", 
    flexWrap: "wrap",
    marginHorizontal: 0, 
    marginTop: 0,
    borderRadius: 12,
    overflow: "hidden", 
    backgroundColor: "#ddd",
  },
  gridItem: {
    width: "100%",
    aspectRatio: 1,
  },
  panel: {
    flex: 1,
    backgroundColor: PANEL,
    //margin: 12,
    marginTop: 8,
    marginHorizontal: 0,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  catButton: {
    flex: 1,
    minHeight: 64,
    borderRadius: 18,
    backgroundColor: "#b4b3aeff",
    borderWidth: 1,
    borderColor: "#ece5c4",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  catLabel: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#5b5b5b",
  },
  catScreen: {
    flex: 1, 
    backgroundColor: '#E3F2FD',
    padding: 20,
    justifyContent: 'center',
  },
  
  
    
});
