import React, { useMemo, useState } from 'react';
import {
    View,
    ScrollView,
    useWindowDimensions,
    KeyboardAvoidingView,
    Platform,
    Text,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { request } from '../../services/services';
import { CHANGE_PASSWORD_API } from '../../services/api-end-points';
import { HTTP_METHODS } from '../../services/api-constants';
import LinearGradient from 'react-native-linear-gradient';
import { Button } from 'react-native-paper';
import CustomTextInput from '../../component/CustomTextInput';
import { useResponsiveLayout } from '../../component/Useresponsivelayout';
// Same shared card styles Login/ForgotPassword/OTP already use, so this
// screen picks up box / headerBand / logoCircleWrap / formPane for free.
import { makeAuthStyles } from '../registration/authStyles';
import { showSuccessToast, showErrorToast } from '../../utils/Toastutils';
import { CommonActions } from '@react-navigation/native';
import fonts from '../../assets/fonts/fonts';

const MIN_PASSWORD_LENGTH = 6;

const FIELD_CONFIG = [
    { key: 'current_password', label: 'Current Password' },
    { key: 'password', label: 'New Password' },
    { key: 'password_confirmation', label: 'Confirm New Password' },
];

const UpdatePasswordComponent = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { width, height: screenHeight } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const layout = useResponsiveLayout();
    const styles = useMemo(() => makeAuthStyles(layout, screenHeight), [layout, screenHeight]);

    // Tracks whether each password field is masked (true = hidden/dots)
    const [hiddenFields, setHiddenFields] = useState({
        current_password: true,
        password: true,
        password_confirmation: true,
    });

    const toggleFieldVisibility = (key) =>
        setHiddenFields((prev) => ({ ...prev, [key]: !prev[key] }));

    const validationSchema = Yup.object().shape({
        current_password: Yup.string()
            .trim()
            .required('Current password is required')
            .min(MIN_PASSWORD_LENGTH, `Minimum ${MIN_PASSWORD_LENGTH} characters required`),
        password: Yup.string()
            .trim()
            .required('New password is required')
            .min(MIN_PASSWORD_LENGTH, `Minimum ${MIN_PASSWORD_LENGTH} characters required`),
        password_confirmation: Yup.string()
            .trim()
            .required('Please confirm your new password')
            .oneOf([Yup.ref('password')], 'Passwords do not match'),
    });

    return (
        <KeyboardAvoidingView
            style={styles.flexOne}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
        >
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={[
                    stylesHeader.scrollContent,
                    { paddingBottom: insets.bottom + 40 },
                ]}
            >
                {/* <View style={styles.box}> */}
                {/* Header band with back arrow, replacing the old AppHeader bar */}

                {/* <LinearGradient
                        colors={['#1a73e8', '#3562a6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.headerBand}
                    >
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                            style={{ position: 'absolute', top: layout.cardPadding, left: layout.gap, zIndex: 3 }}
                        >
                            <Icon name="chevron-left" size={18} color="#ffffff" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Change Password</Text>
                        <Text style={styles.subtitle}>
                            Keep your account secure with a strong new password
                        </Text>
                    </LinearGradient> */}

                <LinearGradient
                    colors={['#6B9FE4', "#6B9FE4"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[stylesHeader.headerBand, { paddingTop: insets.top + 18, borderRadius: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, }]}
                >
                    <View style={[stylesHeader.headerRow]}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                            style={stylesHeader.headerIconBtn}
                        >
                            <Icon name="chevron-left" size={16} color="#fff" />
                        </TouchableOpacity>
                        <View style={{ flex: 1, alignItems: "flex-start", marginLeft: 10 }}>
                            <Text style={styles.title}>Change Password</Text>
                            <Text style={styles.subtitle}>
                                Keep your account secure with a strong new password
                            </Text>
                        </View>
                    </View>
                </LinearGradient>
                {/* Logo circle, straddling the header/body seam */}
                {/* <View style={styles.logoCircleWrap}>
                    <Icon name="lock" size={28} color="#1a73e8" />
                </View> */}

                {/* White body: form */}
                <View style={[stylesHeader.card, { width: '75%' }]}>
                    <View style={styles.formPane}>
                        <Formik
                            initialValues={{
                                current_password: '',
                                password: '',
                                password_confirmation: '',
                            }}
                            validationSchema={validationSchema}
                            validateOnChange={true}
                            validateOnBlur={true}
                            onSubmit={async (values, { setSubmitting, resetForm }) => {
                                setSubmitting(true);
                                try {
                                    await request(CHANGE_PASSWORD_API(), HTTP_METHODS.PUT, JSON.stringify({
                                        current_password: values.current_password,
                                        password: values.password,
                                        password_confirmation: values.password_confirmation,
                                    }));
                                    showSuccessToast('', 'Password changed successfully');
                                    resetForm();
                                    navigation.dispatch(
                                        CommonActions.reset({
                                            index: 0,
                                            routes: [{ name: 'drawer' }],
                                        })
                                    );
                                } catch (e) {
                                    console.log('Change password failed status:', e?.response?.status);
                                    console.log('Change password failed body:', e?.response?.data?.message);
                                    showErrorToast(e?.response?.data?.message || 'Could not change password. Please try again.');
                                } finally {
                                    setSubmitting(false);
                                }
                            }}
                        >
                            {({
                                handleChange,
                                handleSubmit,
                                values,
                                errors,
                                touched,
                                isSubmitting,
                            }) => (
                                <>
                                    {FIELD_CONFIG.map((field) => (
                                        <CustomTextInput
                                            key={field.key}
                                            leftIcon="lock"
                                            rightIcon={hiddenFields[field.key] ? 'eye-slash' : 'eye'}
                                            onRightIconPress={() => toggleFieldVisibility(field.key)}
                                            placeholder={field.label}
                                            value={values[field.key]}
                                            onChangeText={handleChange(field.key)}
                                            secureTextEntry={hiddenFields[field.key]}
                                            error={touched[field.key] && !!errors[field.key]}
                                            errorText={errors[field.key]}
                                            inputStyle={styles.input}
                                            outlineStyle={{ borderRadius: 10, backgroundColor: '#f4f4f4' }}
                                            outlineColor="#e2eaf4"
                                            activeOutlineColor="#eef3fb"
                                        />
                                    ))}

                                    <LinearGradient
                                        colors={['#1a73e8', '#3562a6']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.buttonGradient}
                                    >
                                        <Button
                                            mode="contained"
                                            onPress={handleSubmit}
                                            loading={isSubmitting}
                                            style={styles.primaryButton}
                                            contentStyle={styles.primaryButtonContent}
                                        >
                                            CHANGE PASSWORD
                                        </Button>
                                    </LinearGradient>
                                </>
                            )}
                        </Formik>
                    </View>
                </View>
                {/* </View> */}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const stylesHeader = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#F4F6F8' },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
    },

    // ---- Header band ----
    headerBand: {
        width: '100%',
        paddingHorizontal: 16,
        paddingBottom: 56,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerIconBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#fff',
        fontFamily: fonts.POPPINS_REGULAR,
    },

    // ---- Card ----
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 24,
        marginTop: -32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    avatarWrap: {
        alignSelf: 'center',
        marginBottom: 12,
        backgroundColor: '#9fb8dd',
        borderWidth: 3,
        borderColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    name: {
        textAlign: 'center',
        color: '#1a1a1a',
        fontWeight: '700',
        fontFamily: fonts.POPPINS_REGULAR,
    },
    email: {
        textAlign: 'center',
        color: '#8a8f98',
        marginTop: 4,
        marginBottom: 22,
        fontFamily: fonts.POPPINS_REGULAR,
    },

    infoList: { width: '100%', paddingBottom: 6, gap: 12 },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        gap: 8,
    },
    infoTextWrap: { flex: 1 },
    infoLabel: { color: '#8a8f98', marginBottom: 0, fontFamily: fonts.POPPINS_REGULAR },
    infoValue: { color: '#1a1a1a', fontWeight: '600' },

    buttonGradient: {
        width: '100%',
        borderRadius: 10,
        paddingVertical: 8,
        marginTop: 24,
    },
    primaryButton: {
        borderRadius: 10,
        backgroundColor: 'transparent',
    },
    primaryButtonContent: {
        paddingVertical: 4,
    },
});

export default UpdatePasswordComponent;
export { UpdatePasswordComponent };