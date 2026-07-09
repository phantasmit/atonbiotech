import React from 'react';
import { View, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
/**
 * Reusable row of action icons for an appointment: Edit / Close / Delete.
 * Matches the circular icon-button style from the design (light grey circle bg).
 *
 * Usage:
 * <AppointmentActionIcons
 *   onEdit={() => {}}
 *   onClose={() => {}}   // opens CloseAppointmentModal
 *   onDelete={() => {}}
 * />
 */
const AppointmentActionIcons = ({ onEdit, onClose, onDelete, disabled = false }) => {
    const navigation = useNavigation();
    const { width } = useWindowDimensions();
    const isTabletWidth = width >= 600;

    const circleSize = isTabletWidth ? 40 : 34;
    const iconSize = isTabletWidth ? 17 : 15;

    return (
        <View style={styles.row}>
            <TouchableOpacity
                style={[styles.circle, { width: circleSize, height: circleSize, borderRadius: circleSize / 2 }]}
                onPress={onEdit}
                disabled={disabled}
                activeOpacity={0.7}
            >
                <Icon name="pencil-square-o" size={iconSize} color="#268872" />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.circle, { width: circleSize, height: circleSize, borderRadius: circleSize / 2 }]}
                onPress={onClose}
                disabled={disabled}
                activeOpacity={0.7}
            >
                <Icon name="ban" size={iconSize} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.circle, { width: circleSize, height: circleSize, borderRadius: circleSize / 2 }]}
                onPress={onDelete}
                disabled={disabled}
                activeOpacity={0.7}
            >
                <Icon name="trash-o" size={iconSize} color="#D2434B" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    circle: {
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default AppointmentActionIcons;