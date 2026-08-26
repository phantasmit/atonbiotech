import React, { useMemo } from 'react';
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
import { FORGOT_PASSWORD_API } from "../../services/api-end-points";
import { HTTP_METHODS } from "../../services/api-constants";
import { makeAuthStyles } from './authStyles';
import { useNavigation } from '@react-navigation/native';
import { showSuccessToast, showErrorToast } from '../../utils/Toastutils';
import LottieView from 'lottie-react-native';

const ForgotPasswordComponent = () => {

    const navigation = useNavigation();

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
                        <Text style={styles.title}>Forgot Password</Text>
                        <Text style={styles.subtitle}>
                            Let's get you back into your account
                        </Text>
                    </LinearGradient>

                    {/* Logo circle, straddling the header/body seam */}
                    <View style={styles.logoCircleWrap}>
                        <Image source={icon} style={styles.logo} resizeMode="contain" />
                    </View>

                    {/* White body: form */}
                    <View style={styles.formPane}>

                        {/* Explicit message: the OTP goes to the account's email */}
                        <View style={styles.infoBanner}>
                            <Icon name="envelope" size={16} color="#2b4c7e" style={{ marginTop: 2 }} />
                            <Text style={styles.infoBannerText}>
                                Enter your registered email-id below. We'll send a
                                one-time verification code to the email address linked
                                to your account.
                            </Text>
                        </View>

                        <Formik
                            initialValues={{
                                mobile: "",
                            }}
                            validationSchema={Yup.object().shape({
                                mobile: Yup.string()
                                    .trim()
                                    .email('Enter a valid email address')
                                    .required('Email is required'),
                            })}
                            validateOnChange={true}
                            validateOnBlur={true}
                            onSubmit={async (values, { setSubmitting }) => {
                                setSubmitting(true);
                                try {
                                    const result = await request(
                                        FORGOT_PASSWORD_API(),
                                        HTTP_METHODS.POST,
                                        JSON.stringify({ email: values.mobile })
                                    );

                                    // Backend may optionally return a masked email
                                    // (e.g. "j***@example.com") to reassure the user
                                    // on the next screen — pass it through if present.
                                    //const maskedEmail = result?.response?.data?.maskedEmail;

                                    showSuccessToast('', 'OTP sent to your registered email');
                                    navigation.navigate('OtpVerification', {
                                        mobile: values.mobile,
                                        maskedEmail: "",
                                        purpose: 'forgot_password',
                                    });
                                } catch (e) {
                                    console.log('Forgot password failed status:', e?.response?.status);
                                    console.log('Forgot password failed body:', e?.response?.data?.message);
                                    showErrorToast(e?.response?.data?.message || 'Could not send OTP. Please try again.');
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
                                        leftIcon="envelope"
                                        placeholder="Email Id"
                                        value={values.mobile}
                                        onChangeText={handleChange('mobile')}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        error={touched.mobile && !!errors.mobile}
                                        errorText={errors.mobile}
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
                                            SEND OTP
                                        </Button>
                                    </LinearGradient>

                                    {/* Back to login link */}
                                    <View style={styles.inlineLinkRow}>
                                        <Text style={styles.plainText}>Remembered your password? </Text>
                                        <TouchableOpacity onPress={() => navigation.goBack()}>
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

export { ForgotPasswordComponent };