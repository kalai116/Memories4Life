import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform ,Alert} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserContext } from '../Context/UserContext';
import api from '../services/api';
const NewConversationScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const { username } = useContext(UserContext);
    const dateTime = Date.now();
    const sender = username;
    const receiver = email;
    const handleStartConversation = async () => {
        if (!email) {
            alert('Please fill all fields');
            return;
        }

        // Create a new user object to pass to ChatScreen
        // const user = {
        //     name: email.split('@')[0],
        //     message,
        //     email,
        //     avatar: 'https://i.pravatar.cc/150?img=11'
        // };

        const response = await api.post('/startconv', {
            sender,
            receiver,
            dateTime
        });
        console.log('startconv success:', response.data);
        const {coversationId,conreceiver}=response.data;
                    // Alert.alert('Alert', response.data);
        navigation.navigate('ChatScreen',{convid:coversationId,reciname:conreceiver});
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Start New Conversation</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Email ID</Text>
                    <TextInput
                        placeholder="Enter recipient email"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    {/* <Text style={[styles.label, { marginTop: 20 }]}>Message</Text>
          <TextInput
            placeholder="Enter your message"
            value={message}
            onChangeText={setMessage}
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            multiline
          /> */}

                    <TouchableOpacity style={styles.button} onPress={handleStartConversation}>
                        <Text style={styles.buttonText}>Start Conversation</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fc' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: 20,
        paddingBottom: 10,
        backgroundColor: '#fff',
        elevation: 3
    },
    title: { fontSize: 18, fontWeight: '600' },
    form: { flex: 1, padding: 20 },
    label: { fontSize: 15, fontWeight: '500', color: '#333', marginBottom: 8 },
    input: {
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 15
    },
    button: {
        backgroundColor: '#007bff',
        borderRadius: 10,
        marginTop: 30,
        paddingVertical: 14,
        alignItems: 'center',
        elevation: 2
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});

export default NewConversationScreen;
