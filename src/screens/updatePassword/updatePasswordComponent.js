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
    Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import colors from '../../assets/appColor/colors';
import fonts from '../../assets/fonts/fonts';
import { useDispatch } from 'react-redux';
import { request } from '../../services/services';
import { CHANGE_PASSWORD_API } from '../../services/api-end-points';
import { HTTP_METHODS } from '../../services/api-constants';
import LinearGradient from 'react-native-linear-gradient';
import { Button } from 'react-native-paper';
const FIELD_CONFIG = [
    { key: 'current_password', label: 'Current Password', keyboardType: 'default' },
    { key: 'password', label: 'Password', keyboardType: 'default' },
    { key: 'password_confirmation', label: 'Password Confirmation', keyboardType: 'default' }
];

const UpdatePasswordComponent = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const isWideLayout = width >= 600; // tablet/iPad or landscape phone -> two columns

    const [form, setForm] = useState({
        current_password: '',
        password: '',
        password_confirmation: ''
    });

    const [uploading, setUploading] = useState(false);

    const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleUpdate = async () => {
        //
        setUploading(true)
        //   
        try {
            const result = await request(CHANGE_PASSWORD_API(), HTTP_METHODS.PUT, JSON.stringify({
                'current_password': form.current_password,
                'password': form.password,
                'password_confirmation': form.password_confirmation
            }))
            setForm({
                current_password: '',
                password: '',
                password_confirmation: ''
            })
            setUploading(false)
        } catch (e) {
            //alert(JSON.stringify(e?.response))
            console.log('Login failed status:', e?.response?.status);
            console.log('Login failed body:', e?.response?.data?.message);
            alert(e?.response?.data?.message)
            setUploading(false)
        }
        //alert(JSON.stringify(result))
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
            <View style={[styles.header, { paddingTop: insets.top > 0 ? 14 : 14, backgroundColor: '#f3f6fb' }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <Icon name="arrow-left" size={16} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Update Password</Text>
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
                    {/* Avatar / photo capture section */}


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

                    <View style={[styles.submitRow, !isWideLayout && styles.submitRowStacked]}>
                        <LinearGradient
                            colors={['#4a7ec7', '#6b9fe4']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ borderRadius: 10, paddingVertical: 8, width: "80%", marginTop: 30 }}
                        >
                            <Button
                                mode="contained"
                                onPress={handleUpdate}
                                loading={uploading}
                                style={styles.loginButton}
                                contentStyle={styles.loginButtonContent}
                            >
                                Chnage Password
                            </Button>
                        </LinearGradient>
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
        color: 'black',
        fontSize: 19,
        fontWeight: '500',
        fontFamily: fonts.POPPINS_REGULAR,
        marginLeft: 20,
    },

    scrollContent: {
        paddingTop: 28,
    },

    avatarSection: {
        alignItems: 'center',
        marginBottom: 28,
    },
    avatarWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E4E7EB',
    },
    avatarPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#DCE6F5',
    },
    avatarInitials: {
        color: colors.ICON_COLOR_PRIMARY,
        fontWeight: '700',
    },
    editBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: colors.ICON_COLOR_PRIMARY,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    changePhotoText: {
        marginTop: 10,
        fontSize: 14,
        color: colors.ICON_COLOR_PRIMARY,
        fontFamily: fonts.POPPINS_REGULAR,
        fontWeight: '500',
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
    loginButton: {
        width: '100%',
        borderRadius: 10,
        //marginTop: 8,
        backgroundColor: 'transparent'
    },
    loginButtonContent: {
        //paddingBottom:10
    },
});

export default UpdatePasswordComponent;
export { UpdatePasswordComponent };