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
import icon from '../../assets/images/icon.png';
import { Formik } from 'formik';
import * as Yup from "yup";
import { Button } from 'react-native-paper';
import CustomTextInput from '../../component/CustomTextInput';
import { useResponsiveLayout } from '../../component/Useresponsivelayout';
import { useDispatch } from 'react-redux';
import { changeStack } from '../../navigation/navigationSlice';
import stackEnum from '../../navigation/stackEnum';
import { request } from '../../services/services';
import { LOGIN_API } from "../../services/api-end-points";
import { HTTP_METHODS } from "../../services/api-constants";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveUser } from './authSlice';
//import ParticlesBackground from '../../component/ParticlesBackground';
// Shared card styles — same file the Registration screen uses, so both
// screens render the same header band / logo circle / white body card.
import { makeAuthStyles } from '../registration/authStyles';
import { useNavigation } from '@react-navigation/native';
import { showSuccessToast, showErrorToast } from '../../utils/Toastutils';
//import ParticleBackground from '../../utils/ParticleBackground';
import LottieView from 'lottie-react-native';

const LoginComponent = () => {

    const navigation = useNavigation();

    const [isHidden, setIsHidden] = useState(true);

    const layout = useResponsiveLayout();
    const { height: screenHeight } = useWindowDimensions();
    const styles = useMemo(() => makeAuthStyles(layout, screenHeight), [layout, screenHeight]);

    const dispatch = useDispatch();

    return (
        <KeyboardAvoidingView
            style={styles.flexOne}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
        >
            {/* <ParticlesBackground /> */}
            {/* <ParticleBackground /> */}
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
                    {/* Header band: colored, holds title + subtitle */}
                    <LinearGradient
                        colors={['#1a73e8', '#3562a6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.headerBand}
                    >
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>
                            Login to Konsyl Pharmaceuticals Pvt Ltd
                        </Text>
                    </LinearGradient>

                    {/* Logo circle, straddling the header/body seam */}
                    <View style={styles.logoCircleWrap}>
                        <Image source={icon} style={styles.logo} resizeMode="contain" />
                    </View>

                    {/* White body: form */}
                    <View style={styles.formPane}>
                        <Formik
                            initialValues={{
                                emailId: "",
                                password: "",
                                isLoading: false,
                            }}
                            validationSchema={Yup.object().shape({
                                emailId: Yup.string()
                                    .trim()
                                    .matches(/^[0-9]{10}$/, 'Enter a valid 10-digit mobile number')
                                    .required('Mobile number is required'),
                                password: Yup.string()
                                    .trim()
                                    .required('Password is required')
                                    .min(6, "Minimum 6 characters required"),
                            })}
                            validateOnChange={true}
                            validateOnBlur={true}
                            onSubmit={async (values, { setSubmitting }) => {
                                setSubmitting(true);
                                try {
                                    const result = await request(LOGIN_API(), HTTP_METHODS.POST, JSON.stringify({
                                        "login": values.emailId,
                                        "password": values.password,
                                        "device_name": (Platform.OS === 'android') ? "android" : "ios"
                                    }))
                                    const { token, user } = result?.response?.data;
                                    try {
                                        await AsyncStorage.setItem('authToken', token);
                                        showSuccessToast('', 'Login successful');
                                        dispatch(saveUser(user));
                                        dispatch(changeStack(stackEnum.APP_STACK));
                                    } catch (error) {
                                        console.error('Error saving token:', error);
                                    }
                                } catch (e) {
                                    showErrorToast(e?.response?.data?.message || 'Login failed. Please try again.');

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
                                    {/* Single-column: a login form doesn't need the
                                        2-column field grid the Registration screen
                                        uses, but it shares the same input/error/
                                        button/link styling from authStyles. */}
                                    <CustomTextInput
                                        leftIcon="phone-alt"
                                        placeholder="Mobile Number"
                                        value={values.emailId}
                                        maxLength={10}
                                        onChangeText={handleChange('emailId')}
                                        error={touched.emailId && !!errors.emailId}
                                        errorText={errors.emailId}
                                        inputStyle={styles.input}
                                        outlineStyle={{ borderRadius: 10, backgroundColor: '#f4f4f4' }}
                                        outlineColor="#e2eaf4"
                                        activeOutlineColor="#eef3fb"
                                    />

                                    <CustomTextInput
                                        leftIcon="lock"
                                        rightIcon={isHidden ? 'eye-slash' : 'eye'}
                                        onRightIconPress={() => setIsHidden(prev => !prev)}
                                        placeholder="Password"
                                        value={values.password}
                                        onChangeText={handleChange('password')}
                                        secureTextEntry={isHidden}
                                        error={touched.password && !!errors.password}
                                        errorText={touched.password ? errors.password : ''}
                                        inputStyle={styles.input}
                                        outlineStyle={{ borderRadius: 10, backgroundColor: '#f4f4f4' }}
                                        outlineColor="#e2eaf4"
                                        activeOutlineColor="#eef3fb"
                                    />

                                    {/* Forgot Password link */}
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('ForgotPassword')}
                                        style={{ alignSelf: 'flex-end', marginBottom: 12 }}
                                    >
                                        <Text style={styles.linkText}>Forgot Password?</Text>
                                    </TouchableOpacity>

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
                                            LOGIN
                                        </Button>
                                    </LinearGradient>

                                    {/* Registration link */}
                                    <View style={styles.inlineLinkRow}>
                                        <Text style={styles.plainText}>Don't have an account? </Text>
                                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                            <Text style={styles.linkText}>Register</Text>
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

export { LoginComponent };