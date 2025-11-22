import React, { useEffect, useContext, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TabContext, TabProvider } from '../Context/TabContext'
import { UserContext } from '../Context/UserContext';
import api from '../services/api';
import InitialAvatar from './InitialAvatar'; // Assuming your component is in 'InitialAvatar.js'


const ChatListScreen = ({ route, navigation }) => {
  const { setIsTabVisible } = useContext(TabContext);
  const { username } = useContext(UserContext)
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    console.log("username "+username)
    // Hide tab when this screen mounts
    setIsTabVisible('flex');

    const fetchConv = async () => {
      const response = await api.get('/getConv?sender=' + username);
      //  const { coversationId, sender, receiver,dateTime } =response.data;
      setMessages(response.data)
      console.log("fetchConv. " + JSON.stringify(response.data))
    }
    fetchConv();
    // Show tab again when leaving
    return () => {

      setIsTabVisible('none')
      setMessages([]);

    };


    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Welcome {username}</Text>
      <FlatList
        data={messages}
        keyExtractor={item => item.coversationId}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.chatItem} onPress={() => navigation.navigate('ChatScreen', { user: item, convid: item.coversationId, reciname: item.receiver,senderheader:item.sender })}>
            <InitialAvatar name={item.receiver} size={50} />
            {/* <Image source={{ uri: item.avatar }} style={styles.avatar} /> */}
            <View style={{ flex: 1 }}>
              {username == item.receiver ?
                <Text style={styles.name}>{item.sender}</Text>
                : <Text style={styles.name}>{item.receiver}</Text>}
              <Text style={styles.message}>hi</Text>
            </View>
            <View style={styles.rightSide}>
              <Text style={styles.time}>{item.dateTime}</Text>
              {/* {item.unread ? (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unread}</Text>
                </View>
              ) : null} */}
            </View>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('NewConversation')} >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20 },
  header: { fontSize: 28, fontWeight: 'bold', marginVertical: 20 },
  chatItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  avatar: { width: 55, height: 55, borderRadius: 27.5, marginRight: 15 },
  name: { fontSize: 17, fontWeight: '600' },
  message: { color: '#777', marginTop: 3 },
  rightSide: { alignItems: 'flex-end' },
  time: { color: '#aaa', fontSize: 13 },
  unreadBadge: {
    backgroundColor: '#007bff',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6
  },
  unreadText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#007bff',
    width: 55,
    height: 55,
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4
  },
});

export default ChatListScreen;
