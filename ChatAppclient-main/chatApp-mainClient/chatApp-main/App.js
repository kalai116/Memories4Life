import { TextDecoder, TextEncoder } from 'text-encoding';
import React, { useContext, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LoginScreen from './src/screens/LoginScreen'
import SignupScreen from './src/screens/SignupScreen'
import ChatListScreen from './src/screens/ChatListScreen';
import ChatScreen from './src/screens/ChatScreen';
import GroupsScreen from './src/screens/GroupsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import NewConversationScreen from './src/screens/NewConversationScreen';
import SignaturePad from './src/screens/SignatureScreen';
import { TabContext, TabProvider } from './src/Context/TabContext'
import { UserProvider } from './src/Context/UserContext';
import ExportChatScreen from './src/screens/ExportChatScreen'
import ExportChatPDFScreen from './src/screens/ExportChatPDFScreen'

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Stack for Home (Chat)
function ChatStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="SignaturePad" component={SignaturePad} />
       <Stack.Screen  name="ExportChat" component={ExportChatScreen} />
       <Stack.Screen  name="Exportpdf" component={ExportChatPDFScreen} />
      <Stack.Screen  name="ChatList" component={ChatListScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="NewConversation" component={NewConversationScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack(){

  return(
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="profilepage" component={ProfileScreen} />
    </Stack.Navigator>
  )
}
function TabStack() {
  const { isTabVisible } = useContext(TabContext);
  // console.log(" isTabVisible " + isTabVisible)
  if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
  // const {enableTabBar} = useContext(TabBarContext)
  return (

    <Tab.Navigator
      screenOptions={({ route }) => ({

        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 5,
          height: 60,
          paddingBottom: 5,
        }, // Hide dynamically
        tabBarIcon: ({ color }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'Groups') iconName = 'people-outline';
          else if (route.name === 'Profile') iconName = 'person-outline';
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen options={{ tabBarStyle: { display: isTabVisible } }} name="Home" component={ChatStack} />
      {/* <Tab.Screen options={{
          headerShown: true,
        }} name="Groups" component={GroupsScreen} /> */}
      <Tab.Screen  name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  )
}

export default function App() {

  return (

    <SafeAreaProvider>
      <TabProvider>
        <UserProvider>
        <NavigationContainer>
          <TabStack />
        </NavigationContainer>
        </UserProvider>
      </TabProvider>
    </SafeAreaProvider>

  );
}
