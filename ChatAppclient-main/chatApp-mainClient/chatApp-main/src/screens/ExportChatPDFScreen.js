import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  PermissionsAndroid
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Ionicons from "react-native-vector-icons/Ionicons";
import RNFS from "react-native-fs";

const ExportChatPDFScreen = ({ navigation, route }) => {
  const { convid, username } = route.params;

  const [fromDate, setFromDate] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);

  const [selectedBg, setSelectedBg] = useState(null);
  const [formattedFromDate, setFormattedFromDate] = useState("");

  const backgrounds = [
    { id: 1, uri: require("./Images/chat1.jpg") },
  ];

  // Map frontend → backend bg name
//   const backgroundMap = {
//     1: "bg1",
//   };

  const formatDate = (date) => {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}-${m}-${y}`; // dd-MM-yyyy
  };

  const onChangeFromDate = (event, selectedDate) => {
    const currentDate = selectedDate || fromDate;
    setShowFromPicker(false);
    setFromDate(currentDate);
    setFormattedFromDate(formatDate(currentDate));
  };

  const requestStoragePermissionIfNeeded = async () => {
    if (Platform.OS !== "android") return true;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "Storage Permission",
          message: "App needs storage access to save exported PDF",
          buttonPositive: "OK"
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // ---------------------------------------
  //           EXPORT PDF FUNCTION
  // ---------------------------------------
  const onExportPDF = async () => {
    if (!formattedFromDate) {
      alert("Please select a date");
      return;
    }

    if (!selectedBg) {
      alert("Please select a background");
      return;
    }

    // const hasPermission = await requestStoragePermissionIfNeeded();
    // if (!hasPermission) {
    //   alert("Storage permission denied");
    //   return;
    // }

    // const backgroundKey = backgroundMap[selectedBg];
    const loggedUser = username;

    const url = 
      `http://192.168.0.107:8080/api/auth/chat-pdf` +
      `?conversationID=${convid}` +
      `&date=${formattedFromDate}` +
      `&loggedUser=${loggedUser}`;

    try {
      console.log("Downloading PDF from:", url);

      const filePath = `${RNFS.DownloadDirectoryPath}/chat_export_${Date.now()}.pdf`;

      const download = await RNFS.downloadFile({
        fromUrl: url,
        toFile: filePath,
      }).promise;

      if (download.statusCode === 200) {
        alert(`PDF Exported!\nSaved to:\n${filePath}`);
      } else {
        console.log(download);
        alert("Failed to export PDF");
      }
    } catch (err) {
      console.log("PDF Export Error:", err);
      alert("Failed to export PDF");
    }
  };

  return (
    <ScrollView style={styles.container}>

      {/* HEADER */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color="#333" />
          </TouchableOpacity>

          <Text style={styles.title}>Export Chat (PDF)</Text>

          <View style={{ width: 30 }} />
        </View>
      </View>

      <View style={{ padding: 15 }}>

        {/* DATE SELECTOR */}
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
            onChange={onChangeFromDate}
          />
        )}

        {/* BACKGROUND SELECTOR */}
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

        {/* EXPORT PDF BUTTON */}
        <TouchableOpacity style={styles.exportBtn} onPress={onExportPDF}>
          <Text style={styles.exportText}>Export as PDF</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
};

export default ExportChatPDFScreen;

// ---------------------------------------
//                  STYLES
// ---------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fc",
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
});
