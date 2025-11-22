import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api'; // 👈 import API service

export default function SignupScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!username || !email || !password) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        try {
            setLoading(true);
            const response = await api.post('/signup', {
                username,
                email,
                password,
            });

            console.log('Signup success:', response.data);
            Alert.alert('Alert', response.data);
            if (response.data.includes("successful")) {
                navigation.navigate('Login');
            }

        } catch (error) {
            console.error('Signup failed:', error.response?.data || error.message);
            Alert.alert('Signup failed', error.response?.data?.message || 'Please try again');
        } finally {
            setLoading(false);
        }
    };
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topShape} />

            <View style={styles.form}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back-outline" size={25} color="#fff" style={styles.backIcon} />
                </TouchableOpacity>

                <Text style={styles.title}>Create New account</Text>

                <View style={styles.inputContainer}>
                    <Icon name="person-outline" size={18} color="#777" />
                    <TextInput
                        placeholder="Name"
                        style={styles.input}
                        placeholderTextColor="#999"
                        value={username}
                        onChangeText={setUsername}
                    />
                </View>

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

                {/* <Text style={styles.terms}>
          I agree to the <Text style={{ color: 'red' }}>Terms & Conditions</Text>
        </Text> */}

                <TouchableOpacity style={styles.loginBtn} onPress={handleSignup} disabled={loading}>
                    <Text style={styles.loginText}>{loading ? 'Creating...' : 'Create account'}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.bottomText}>Already a user? Log in</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    topShape: {
        backgroundColor: '#3366FF',
        height: 180,
        borderBottomRightRadius: 500,
    },
    form: { padding: 25, marginTop: 50 },
    backIcon: { position: 'absolute', top: -220, left: 20 },
    title: { fontSize: 22, fontWeight: '600', color: '#000', marginBottom: 20 },
    inputContainer: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 25,
        alignItems: 'center',
        paddingHorizontal: 15,
        marginBottom: 15,
        height: 45,
    },
    input: { flex: 1, marginLeft: 10 },
    terms: { fontSize: 12, marginBottom: 15, color: '#777' },
    loginBtn: {
        backgroundColor: '#3366FF',
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
    },
    loginText: { color: '#fff', fontWeight: '600' },
    bottomText: {
        textAlign: 'center',
        marginTop: 25,
        borderWidth: 1,
        borderColor: '#3366FF',
        borderRadius: 25,
        padding: 10,
        color: '#3366FF',
    },
});
