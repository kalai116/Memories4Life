import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,Platform
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Ionicons from "react-native-vector-icons/Ionicons";
import api from "../services/api";   
import RNFS from "react-native-fs";
import { Buffer } from "buffer";   // <-- IMPORTANT

const ExportChatScreen = ({ navigation, route }) => {
  const { convid, username } = route.params;

  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());

  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const [selectedBg, setSelectedBg] = useState(null);
    const [date, setDate] = useState(new Date()); // Stores the selected date object
    const [formattedFromDate, setFormattedFromDate] = useState(''); // Stores the formatted date string
        const [formattedToDate, setFormattedToDate] = useState(''); // Stores the formatted date string

  const backgrounds = [
    { id: 1, uri: require("./Images/chat1.jpg") },
    // { id: 2, uri: require("../assets/bg2.jpg") },
    // { id: 3, uri: require("../assets/bg3.jpg") },
    // { id: 4, uri: require("../assets/bg4.jpg") },
  ];
    const onChangefromDate = (event, selectedDate) => {
        const currentDate = selectedDate || fromDate; // Fallback to current date if no selection
        setShowFromPicker(Platform.OS === 'ios'); // Hide picker for Android after selection, keep for iOS
        setFromDate(currentDate);

        // Format the date
        const day = String(currentDate.getDate()).padStart(2, '0');
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = currentDate.getFullYear();
        setFormattedFromDate(`${day}-${month}-${year}`);
        setShowFromPicker(false);
    };
    const onChangeToDate = (event, selectedDate) => {
        const currentDate = selectedDate || toDate; // Fallback to current date if no selection
        setShowFromPicker(Platform.OS === 'ios'); // Hide picker for Android after selection, keep for iOS
        setToDate(currentDate);

        // Format the date
        const day = String(currentDate.getDate()).padStart(2, '0');
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = currentDate.getFullYear();
        setFormattedToDate(`${day}-${month}-${year}`);
        setShowToPicker(false);
        
    };
  const onExportGIF = async () => {
    if (!selectedBg) {
      alert("Please select a background!");
      return;
    }

    console.log("Exporting chat as GIF...");
    console.log("From:", formattedFromDate);
    console.log("To:", formattedToDate);
    console.log("Background:", selectedBg);

    // TODO: Send request to backend to generate GIF
    // Example:
    try{

    
    const response = await api.get("/chat-image?conversationID="+convid+"&date="+formattedFromDate+"&loggedUser="+username,{
      responseType: "arraybuffer",
    });
    const base64Image = Buffer.from(response.data, "binary").toString("base64");

    // Save to downloads folder
    const filePath = `${RNFS.DownloadDirectoryPath}/chat_export_${Date.now()}.png`;

    await RNFS.writeFile(filePath, base64Image, "base64");

    alert(`Chat Exported!\nFile saved at:\n${filePath}`);
    }
    catch(error){
console.error("Export Error:", error);
    alert("Failed to export chat.");
    }
  };

  return (
    <ScrollView style={styles.container}>

      {/* Header */}
    <View style={styles.headerContainer}>
  <View style={styles.header}>
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <Ionicons name="arrow-back" size={26} color="#333" />
    </TouchableOpacity>

    <Text style={styles.title}>Export Chat</Text>

    <View style={{ width: 30 }} /> 
  </View>
</View>

      {/* Date Selectors */}
      <View style={{padding:15}}>
      <Text style={styles.label}>Select Date</Text>
      <TouchableOpacity
        style={styles.dateBox}
        onPress={() => setShowFromPicker(true)}
      >
        <Text style={styles.dateText}>{fromDate.toDateString()}</Text>
      </TouchableOpacity>

      {showFromPicker && (
        <DateTimePicker
          value={fromDate}
          mode="date"
          display="default"
          onChange={onChangefromDate}
        />
      )}

      {/* <Text style={styles.label}>To Date</Text>
      <TouchableOpacity
        style={styles.dateBox}
        onPress={() => setShowToPicker(true)}
      >
        <Text style={styles.dateText}>{toDate.toDateString()}</Text>
      </TouchableOpacity>

      {showToPicker && (
        <DateTimePicker
          value={toDate}
          mode="date"
          display="default"
          onChange={onChangeToDate}
        />
      )} */}

      {/* Background Selector */}
      <Text style={[styles.label, { marginTop: 20 }]}>
        Select Background
      </Text>

      <View style={styles.bgContainer}>
        {backgrounds.map((bg) => (
          <TouchableOpacity
            key={bg.id}
            style={[
              styles.bgItem,
              selectedBg === bg.id && styles.bgSelected,
            ]}
            onPress={() => setSelectedBg(bg.id)}
          >
            <Image source={bg.uri} style={styles.bgImage} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Export Button */}
      <TouchableOpacity style={styles.exportBtn} onPress={onExportGIF}>
        <Text style={styles.exportText}>Export as GIF</Text>
      </TouchableOpacity>
</View>
    </ScrollView>
  );
};

export default ExportChatScreen;

//
// ------------------------
// Styles
// ------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fc",
    // padding: 15,
  },

  // header: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   marginBottom: 15,
  // },

  // title: {
  //   fontSize: 20,
  //   fontWeight: "700",
  //   marginLeft: 10,
  // },

  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
  },

  dateBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginTop: 5,
  },

  dateText: {
    fontSize: 16,
  },

  bgContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    justifyContent: "space-between",
  },

  bgItem: {
    width: "48%",
    height: 130,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
    marginBottom: 10,
  },

  bgSelected: {
    borderColor: "#007bff",
  },

  bgImage: {
    width: "100%",
    height: "100%",
  },

  exportBtn: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 30,
    alignItems: "center",
  },

  exportText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "700",
  },
  headerContainer: {
  // paddingTop: Platform.OS === "android" ? 52 : 0, 
  backgroundColor: "#fff",
},

header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#fff",
    elevation: 3,
    alignItems: "center",
  },

title: {
  fontSize: 20,
  fontWeight: "700",
  color: "#333",
},

});
