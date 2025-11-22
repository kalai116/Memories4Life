import { useContext, useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { TabContext } from "../Context/TabContext";
import { UserContext } from "../Context/UserContext";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import api from "../services/api";
import { useFocusEffect } from "@react-navigation/native";
import BottomMenuModal from './BottomMenuModal';

const ChatScreen = ({ route, navigation }) => {
  let { convid, reciname, senderheader, signatureImage } = route.params || {};

  const { username } = useContext(UserContext);
  const { setIsTabVisible } = useContext(TabContext);
  const[fiRecName,setFiRecName]=useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef(null);
  const flatListRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);

  const options = [
    { label: "Export Chat as Gift", onPress: () => navigation.navigate('ExportChat', { convid: convid, username: username }) },
    { label: "Export Chat as PDF", onPress: () => navigation.navigate('Exportpdf', { convid: convid, username: username })  },

  ];
  // Auto-scroll
  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  };

  // Reconnect WebSocket when screen focuses
  useFocusEffect(
    useCallback(() => {
      console.log("ChatScreen Focused → Connect STOMP ");

      setIsTabVisible("none");
      loadOldMessages(convid);
      setupWebSocket(convid);
      return () => {
        console.log("ChatScreen Unfocused → Disconnect STOMP ");

        if (stompClientRef.current) {
          console.log("inside websocket")
          stompClientRef.current.deactivate();
        }


        setIsConnected(false);
        setIsTabVisible("flex");
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [convid])
  );

  // Fetch chat history
  const loadOldMessages = async (conversationID) => {
    try {
      const res = await api.get(
        `/getPvtMessages?Convid=${conversationID}`
      );
      setMessages(res.data.reverse());

    } catch (e) {
      console.log("Error loading messages:", e);
    }
  };

  // Setup STOMP WebSocket
  const setupWebSocket = (conversationID) => {
    const socket = new SockJS("http://192.168.0.107:8080/ws");

    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,

      onConnect: () => {
        console.log("STOMP Connected");
        setIsConnected(true);

        stompClient.subscribe("/topic/public", (msg) => {
          const newMsg = JSON.parse(msg.body);

          if (newMsg.conversationID == conversationID) {
            setMessages((prev) => {
              const updated = [newMsg, ...prev];
              setTimeout(scrollToBottom, 50);
              return updated;
            });
          }
        });
      },


      onStompError: () => {
        console.log("STOMP Error");
        setIsConnected(false);
      },

      onWebSocketClose: () => {
        console.log("WebSocket Closed");
        setIsConnected(false);
      },
    });

    stompClient.activate();
    stompClientRef.current = stompClient;
  };

  // Send text message
  const sendMessage = () => {
    console.log("sendMessages " + reciname)
    if(reciname==username){
      reciname=senderheader;
    }
    if (!text.trim()) return;

    if (!isConnected) {
      console.log("❌ STOMP not connected. Cannot send.");
      return;
    }

    const msg = {
      sender: username,
      receiver: reciname,
      content: text.trim(),
      conversationID: convid,
      dateTime: null,
      chatimage: null,
      chatTime: null
    };

    stompClientRef.current.publish({
      destination: "/app/chat.sendMessage",
      body: JSON.stringify(msg),
    });

    setText("");
  };

  // Send signature image
  useFocusEffect(
    
    useCallback(() => {
      const signature = route.params?.signatureImage;
      if(reciname==username){
        setFiRecName(senderheader);
      }
      if (signature && isConnected) {
        console.log("Sending Signature Base64:", signature);

        const msg = {
          sender: username,
          receiver: fiRecName,
          content: null,
          chatimage: signature,    // pure base64 is now available
          conversationID: convid,
          dateTime: new Date().toISOString(),
          chatTime: null
        };

        stompClientRef.current.publish({
          destination: "/app/chat.sendMessage",
          body: JSON.stringify(msg),
        });

        // update UI
        // setMessages((prev) => [msg, ...prev]);

        // reset param so it does not resend
        navigation.setParams({ signatureImage: null });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConnected])
  );


  const formatTime = (timeString) => {
    if (!timeString) return "--";

    // Extract only HH:mm:ss if backend sends full dateTime
    const onlyTime = timeString.includes("T")
      ? timeString.split("T")[1].substring(0, 8)
      : timeString; // already HH:mm:ss

    const [h, m, s] = onlyTime.split(":").map(Number);

    let hour = h % 12 || 12;
    let ampm = h >= 12 ? "PM" : "AM";

    return `${hour.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")} ${ampm}`;
  };

  // Render chat bubbles
  const renderBubble = ({ item }) => {
    const isMe = item.sender === username;
    return (
      <View>
        {item.dateTime === null ? null : <Text style={{ textAlign: 'center' }}>{item.dateTime}</Text>}

        <View
          style={[
            styles.messageContainer,
            isMe ? styles.messageRight : styles.messageLeft,
          ]}
        >
          {/* Image bubble */}
          {item.chatimage && (
            <Image
              source={{ uri: "data:image/png;base64," + item.chatimage }}
              style={{ width: 180, height: 120, borderRadius: 12 }}
            />
          )}

          {/* Text bubble */}
          {item.content && (
            <Text style={isMe ? styles.messageTextRight : styles.messageTextLeft}>
              {item.content}
            </Text>
          )}

          <Text style={styles.time}>{formatTime(item.chatTime)}</Text>
        </View>
      </View>
    );
  };

  // UI
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('ChatList')}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.username}>
          {username == reciname ? senderheader : reciname}
        </Text>

        <TouchableOpacity

          onPress={() => setShowMenu(true)}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderBubble}
        keyExtractor={(item, index) => index.toString()}
        inverted
        contentContainerStyle={{ padding: 15, paddingBottom: 80 }}
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        {/* <Ionicons name="happy-outline" size={26} color="#777" /> */}
        {/* Signature */}
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("SignaturePad", {
              convid,
              reciname,
              senderheader,
            })
          }
        >
          <Ionicons name="create-outline" size={26} color="#777" />
        </TouchableOpacity>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Message..."
          style={styles.input}
        />

        {/* Send */}
        <TouchableOpacity onPress={sendMessage}>
          <Ionicons name="send" size={26} color="#007bff" />
        </TouchableOpacity>

        <BottomMenuModal
          visible={showMenu}
          onClose={() => setShowMenu(false)}
          options={options}
        />
      </View>
    </SafeAreaView>
  );
};

export default ChatScreen;

// -----------------------------
// Styles
// -----------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fc" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#fff",
    elevation: 3,
    alignItems: "center",
  },

  username: { fontSize: 18, fontWeight: "600" },

  messageContainer: {
    maxWidth: "80%",
    marginVertical: 8,
    padding: 12,
    borderRadius: 15,
    elevation: 1,
  },

  messageRight: {
    alignSelf: "flex-end",
    backgroundColor: "#007bff",
    borderBottomRightRadius: 3,
  },

  messageLeft: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderBottomLeftRadius: 3,
  },

  messageTextRight: { color: "#fff", fontSize: 15 },
  messageTextLeft: { fontSize: 15, color: "#333" },

  time: {
    fontSize: 11,
    color: "#ddd",
    marginTop: 5,
    alignSelf: "flex-end",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 10,
    borderRadius: 25,
    paddingHorizontal: 15,
    elevation: 3,
  },

  input: { flex: 1, paddingHorizontal: 10, fontSize: 16 },
});
