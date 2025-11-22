import React, { useRef, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import SignatureScreen from "react-native-signature-canvas";
import ImageResizer from "react-native-image-resizer";
import RNFS from "react-native-fs";
import api from "../services/api";   // <-- your axios instance
import Ionicons from "react-native-vector-icons/Ionicons";
import { TabContext } from "../Context/TabContext";

const resizePngBase64 = async (base64) => {
  const tempPath = `${RNFS.CachesDirectoryPath}/signature.png`;
  await RNFS.writeFile(tempPath, base64, "base64");

  const resized = await ImageResizer.createResizedImage(
    tempPath,
    600,  // width
    600,  // height
    "PNG",  // IMPORTANT — keeps transparency!
    100     // quality ignored for PNG
  );

  // Convert back to base64
  const compressed = await RNFS.readFile(resized.uri, "base64");
  return compressed;
};

const SignaturePad = ({ route, navigation }) => {
  const ref = useRef();
  const { convid, reciname, senderheader } = route.params;
  const { isTabVisible, setIsTabVisible } = useContext(TabContext);
 
  useEffect(() => {
    console.log("useeffect in singnature " + isTabVisible)

    setIsTabVisible('none');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTabVisible]);
  // When signature is saved
  // ------------------------------
  // SEND SIGNATURE TO BACKEND
  // ------------------------------
  const uploadSignatureToBackend = async (base64Image) => {
    try {
      const payload = {
        sender: senderheader,
        receiver: reciname,
        conversationID: convid,
        chatimage: base64Image,
      };

      console.log("Uploading signature length:", base64Image.length);

      const res = await api.post("/api/auth/sendImage", payload);

      console.log("Signature Upload Success:", res.data);

      // Navigate back to chat and refresh UI
      navigation.navigate("ChatScreen", {
        convid,
        reciname,
        senderheader,
      });

    } catch (error) {
      console.log("Signature upload error:", error);
      // Alert.alert("Error", "Failed to upload signature");
    }
  };
  const handleOK = async (img) => {
    // console.log("Base64 Signature:", img);  // base64 PNG image

    const pureBase64 = img.replace("data:image/png;base64,", "");
    const compressed = await resizePngBase64(pureBase64);
    // uploadSignatureToBackend(compressed);
    navigation.navigate("ChatScreen", {
      convid: route.params.convid,
      reciname: route.params.reciname,
      senderheader: route.params.senderheader,
      signatureImage: compressed,
    });
  };

  // When signature is empty or cleared
  const handleEmpty = () => {
    alert("Please provide a signature");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>

      {/* ---------- HEADER ---------- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Signature</Text>
        <View style={{ width: 35 }} />
      </View>

      {/* ---------- SIGNATURE PAD ---------- */}
      <SignatureScreen
        ref={ref}
        onOK={handleOK}
        onEmpty={handleEmpty}
        autoClear={false}
        descriptionText="Sign Here"
        clearText="Clear"
        confirmText="Save"
        webStyle={style}
      />
    </View>
  );
};

const style = `
.m-signature-pad--footer { display: flex; justify-content: space-between; }
`;
const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    justifyContent: "space-between",
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
});
export default SignaturePad;
