import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    useWindowDimensions,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import colors from '../../assets/appColor/colors';
import fonts from '../../assets/fonts/fonts';

const FIELD_CONFIG = [
    { key: 'username', label: 'Username', keyboardType: 'default' },
    { key: 'fullName', label: 'Full Name', keyboardType: 'default' },
    { key: 'mobileNumber', label: 'Mobile Number', keyboardType: 'phone-pad' },
    { key: 'email', label: 'Email', keyboardType: 'email-address' },
    { key: 'city', label: 'City', keyboardType: 'default' },
    { key: 'state', label: 'State', keyboardType: 'default' },
];

const UpdateProfileComponent = () => {
    const navigation = useNavigation();
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const isWideLayout = width >= 600; // tablet/iPad or landscape phone -> two columns

    const [form, setForm] = useState({
        username: 'Jhon',
        fullName: 'Sumit',
        mobileNumber: '9377327530',
        email: 'sumit.satva@gmail.com',
        city: 'Lankaa',
        state: 'U.P',
        fullAddress: 'Varanas New',
    });

    const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleUpdate = () => {
        // TODO: wire to real API / redux action
        console.log('Updating profile:', form);
    };

    // Pair up fields into rows of 2 for wide layout
    const fieldRows = [];
    for (let i = 0; i < FIELD_CONFIG.length; i += 2) {
        fieldRows.push(FIELD_CONFIG.slice(i, i + 2));
    }

    const renderField = (field) => (
        <View key={field.key} style={styles.fieldCol}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
                style={styles.input}
                value={form[field.key]}
                onChangeText={(v) => setField(field.key, v)}
                keyboardType={field.keyboardType}
                autoCapitalize={field.key === 'email' ? 'none' : 'sentences'}
                placeholderTextColor="#999"
            />
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#F4F6F8' }}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top > 0 ? 14 : 14 }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <Icon name="arrow-left" size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Update Profile</Text>
                <View style={{ width: 20 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        {
                            paddingHorizontal: isWideLayout ? 32 : 20,
                            maxWidth: isWideLayout ? 900 : undefined,
                            alignSelf: isWideLayout ? 'center' : 'stretch',
                            width: '100%',
                        },
                        { paddingBottom: insets.bottom + 40 },
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {isWideLayout
                        ? fieldRows.map((row, rowIndex) => (
                              <View key={`row-${rowIndex}`} style={styles.fieldRow}>
                                  {row.map(renderField)}
                                  {row.length === 1 && <View style={styles.fieldCol} />}
                              </View>
                          ))
                        : FIELD_CONFIG.map((field) => (
                              <View key={field.key} style={styles.fieldRowStacked}>
                                  {renderField(field)}
                              </View>
                          ))}

                    {/* Full Address — always full width */}
                    <View style={styles.fieldFullWidth}>
                        <Text style={styles.label}>Full Address</Text>
                        <TextInput
                            style={[styles.input, styles.addressInput]}
                            value={form.fullAddress}
                            onChangeText={(v) => setField('fullAddress', v)}
                            multiline
                            textAlignVertical="top"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={[styles.submitRow, !isWideLayout && styles.submitRowStacked]}>
                        <TouchableOpacity
                            style={[styles.updateBtn, !isWideLayout && { width: '100%' }]}
                            onPress={handleUpdate}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.updateBtnText}>UPDATE NOW</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.ICON_COLOR_PRIMARY,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    headerTitle: {
        flex: 1,
        color: '#fff',
        fontSize: 19,
        fontWeight: '700',
        fontFamily: fonts.POPPINS_REGULAR,
        marginLeft: 20,
    },

    scrollContent: {
        paddingTop: 28,
    },

    fieldRow: {
        flexDirection: 'row',
        gap: 24,
        marginBottom: 22,
    },
    fieldRowStacked: {
        marginBottom: 18,
    },
    fieldCol: {
        flex: 1,
    },
    fieldFullWidth: {
        marginTop: 6,
        marginBottom: 28,
    },

    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        fontFamily: fonts.POPPINS_REGULAR,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#222',
        borderWidth: 1,
        borderColor: '#E4E7EB',
    },
    addressInput: {
        height: 160,
        paddingTop: 14,
    },

    submitRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    submitRowStacked: {
        justifyContent: 'center',
    },
    updateBtn: {
        backgroundColor: colors.ICON_COLOR_PRIMARY,
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 8,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    updateBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});

export default UpdateProfileComponent;
export { UpdateProfileComponent };