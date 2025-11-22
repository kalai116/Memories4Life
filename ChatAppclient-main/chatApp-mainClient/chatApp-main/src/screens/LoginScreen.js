import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView, StatusBar, Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabContext, TabProvider } from '../Context/TabContext';
import { UserContext } from '../Context/UserContext';

import api from '../services/api'; // 👈 import API service

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
const { saveUsername } = useContext(UserContext);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        try {
            setLoading(true);
            const response = await api.post('/login', {
                email,
                password,
            });
            const { success, message, username } = response.data;
            console.log('Login success:', username);
            Alert.alert('Success', username);
            
            if (success) {
               await saveUsername(username);
                navigation.navigate('ChatList');
            }

        } catch (error) {
            console.error('Login failed:', error.response?.data || error.message);
            Alert.alert('Login failed', error.response?.data?.message || 'Please try again');
        } finally {
            setLoading(false);
        }
    };
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar backgroundColor="#3366FF" barStyle="light-content" />

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.topShape} />

                <View style={styles.form}>
                    <Text style={styles.title}>Log in</Text>

                    <View style={styles.inputContainer}>
                        <Icon name="mail-outline" size={18} color="#777" />
                        <TextInput
                            placeholder="Email"
                            style={styles.input}
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Icon name="lock-closed-outline" size={18} color="#777" />
                        <TextInput
                            placeholder="Password"
                            secureTextEntry
                            style={styles.input}
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
                        <Text style={styles.loginText}>{loading ? 'Logging in...' : 'Log in with your account'}</Text>
                    </TouchableOpacity>

                    {/* <Text style={styles.orText}>Log in with</Text>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.fbBtn}>
              <Text style={styles.socialText}>Facebook</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.googleBtn}>
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>
          </View> */}

                    <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                        <Text style={styles.bottomText}>New user? Create account</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        backgroundColor: '#fff',
    },
    topShape: {
        backgroundColor: '#3366FF',
        height: 180,
        borderBottomRightRadius: 500,
    },
    form: {
        paddingHorizontal: 25,
        marginTop: 50,
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
        color: '#000',
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 25,
        paddingHorizontal: 15,
        height: 45,
        marginBottom: 15,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: '#000',
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    remember: {
        fontSize: 12,
        color: '#777',
    },
    forgot: {
        fontSize: 12,
        color: 'red',
    },
    loginBtn: {
        backgroundColor: '#3366FF',
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 5,
    },
    loginText: {
        color: '#fff',
        fontWeight: '600',
    },
    orText: {
        textAlign: 'center',
        color: '#777',
        marginVertical: 20,
    },
    socialRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginBottom: 25,
    },
    fbBtn: {
        backgroundColor: '#3b5998',
        paddingVertical: 10,
        borderRadius: 8,
        width: '40%',
        alignItems: 'center',
    },
    googleBtn: {
        backgroundColor: '#db4437',
        paddingVertical: 10,
        borderRadius: 8,
        width: '40%',
        alignItems: 'center',
    },
    socialText: {
        color: '#fff',
        fontWeight: '600',
    },
    bottomText: {
        textAlign: 'center',
        borderWidth: 1,
        borderColor: '#3366FF',
        borderRadius: 25,
        padding: 10,
        color: '#3366FF',
        marginBottom: 20,
        marginTop: 25
    },
});
