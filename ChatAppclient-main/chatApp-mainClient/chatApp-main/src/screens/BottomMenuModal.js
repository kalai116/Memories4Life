import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';

const BottomMenuModal = ({ visible, onClose, options = [] }) => {
    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onClose}
            onBackButtonPress={onClose}
            style={styles.modal}
        >
            <View style={styles.container}>

                {options.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.option}
                        onPress={() => {
                            item.onPress();
                            onClose();
                        }}
                    >
                        <Text style={styles.optionText}>{item.label}</Text>
                    </TouchableOpacity>
                ))}

                <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        justifyContent: "flex-end",
        margin: 0,
    },
    container: {
        backgroundColor: "#fff",
        padding: 15,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    option: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
    optionText: {
        fontSize: 16,
        color: "#333",
    },
    cancelBtn: {
        paddingVertical: 15,
        marginTop: 10,
        backgroundColor: "#f5f5f5",
        borderRadius: 10,
        alignItems: "center",
    },
    cancelText: {
        fontSize: 16,
        color: "red",
    },
});

export default BottomMenuModal;
