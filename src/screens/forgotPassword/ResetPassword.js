import React, { useMemo, useState } from 'react';
import {
    View,
    KeyboardAvoidingView,
    Image,
    Text,
    ScrollView,
    Platform,
    useWindowDimensions,
    TouchableOpacity
} from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';
import icon from '../../assets/images/icon.png';
import { Formik } from 'formik';
import * as Yup from "yup";
import { Button } from 'react-native-paper';
import CustomTextInput from '../../component/CustomTextInput';
import { useResponsiveLayout } from '../../component/Useresponsivelayout';
import { request } from '../../services/services';
import { RESET_PASSWORD_API } from "../../services/api-end-points";
import { HTTP_METHODS } from "../../services/api-constants";
import { makeAuthStyles } from './authStyles';
import { useNavigation, useRoute } from '@react-navigation/native';
import { showSuccessToast, showErrorToast } from '../../utils/Toastutils';
import LottieView from 'lottie-react-native';

const ResetPassword = () => {

    const navigation = useNavigation();
    const route = useRoute();

    // Email and OTP are handed over from the previous screen (OtpVerification),
    // which itself received them from the ForgotPassword/SendOtp screen.

    const {
        email = "",
        otp = "",
        maskedEmail = "",
    } = route.params || {};

    const displayEmail = maskedEmail || email;

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const layout = useResponsiveLayout();
    const { height: screenHeight } = useWindowDimensions();
    const styles = useMemo(() => makeAuthStyles(layout, screenHeight), [layout, screenHeight]);

    return (
        <KeyboardAvoidingView
            style={styles.flexOne}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
        >
            <LottieView
                source={require('../../assets/dots_constellation_burst_landscape_new.json')}
                autoPlay
                loop
                resizeMode="cover"
                style={{ width: '100%', height: '100%', position: "absolute" }}
            />
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
                automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            >
                <View style={styles.box}>
                    {/* Header band */}
                    <LinearGradient
                        colors={['#1a73e8', '#3562a6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.headerBand}
                    >
                        <Text style={styles.title}>Set New Password</Text>
                        <Text style={styles.subtitle}>
                            Choose a strong password for your account
                        </Text>
                    </LinearGradient>

                    {/* Logo circle, straddling the header/body seam */}
                    <View style={styles.logoCircleWrap}>
                        <Image source={icon} style={styles.logo} resizeMode="contain" />
                    </View>

                    {/* White body: form */}
                    <View style={styles.formPane}>

                        {/* Explicit message: which account this password reset applies to */}
                        <View style={styles.infoBanner}>
                            <Icon name="lock" size={16} color="#2b4c7e" style={{ marginTop: 2 }} />
                            <Text style={styles.infoBannerText}>
                                {displayEmail
                                    ? `Set password for ${displayEmail}`
                                    : 'Set a new password for your account'}
                            </Text>
                        </View>

                        <Formik
                            initialValues={{
                                password: "",
                                confirmPassword: "",
                            }}
                            validationSchema={Yup.object().shape({
                                password: Yup.string()
                                    .trim()
                                    .min(6, 'Password must be at least 8 characters')
                                    .matches(
                                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                        'Use upper, lower case letters and a number'
                                    )
                                    .required('Password is required'),
                                confirmPassword: Yup.string()
                                    .oneOf([Yup.ref('password')], 'Passwords do not match')
                                    .required('Please confirm your password'),
                            })}
                            validateOnChange={true}
                            validateOnBlur={true}
                            onSubmit={async (values, { setSubmitting }) => {
                                setSubmitting(true);
                                try {
                                    const result = await request(
                                        RESET_PASSWORD_API(),
                                        HTTP_METHODS.POST,
                                        JSON.stringify({
                                            email: email,
                                            otp: otp,
                                            password: values.password,
                                            password_confirmation: values.password,
                                        })
                                    );

                                    showSuccessToast('', 'Password reset successfully');
                                    navigation.navigate('Login');
                                } catch (e) {
                                    console.log('Reset password failed status:', e?.response?.status);
                                    console.log('Reset password failed body:', e?.response?.data?.message);
                                    showErrorToast(e?.response?.data?.message || 'Could not reset password. Please try again.');
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
                                    <CustomTextInput
                                        leftIcon="lock"
                                        rightIcon={showPassword ? "eye-slash" : "eye"}
                                        onRightIconPress={() => setShowPassword(prev => !prev)}
                                        placeholder="New Password"
                                        value={values.password}
                                        onChangeText={handleChange('password')}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                        error={touched.password && !!errors.password}
                                        errorText={errors.password}
                                        inputStyle={styles.input}
                                        outlineStyle={{ borderRadius: 10, backgroundColor: '#f4f4f4' }}
                                        outlineColor="#e2eaf4"
                                        activeOutlineColor="#eef3fb"
                                    />

                                    <CustomTextInput
                                        leftIcon="lock"
                                        rightIcon={showConfirmPassword ? "eye-slash" : "eye"}
                                        onRightIconPress={() => setShowConfirmPassword(prev => !prev)}
                                        placeholder="Confirm Password"
                                        value={values.confirmPassword}
                                        onChangeText={handleChange('confirmPassword')}
                                        secureTextEntry={!showConfirmPassword}
                                        autoCapitalize="none"
                                        error={touched.confirmPassword && !!errors.confirmPassword}
                                        errorText={errors.confirmPassword}
                                        inputStyle={styles.input}
                                        outlineStyle={{ borderRadius: 10, backgroundColor: '#f4f4f4' }}
                                        outlineColor="#e2eaf4"
                                        activeOutlineColor="#eef3fb"
                                    />

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
                                            RESET PASSWORD
                                        </Button>
                                    </LinearGradient>

                                    {/* Back to login link */}
                                    <View style={styles.inlineLinkRow}>
                                        <Text style={styles.plainText}>Remembered your password? </Text>
                                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                            <Text style={styles.linkText}>Login</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                        </Formik>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export { ResetPassword };