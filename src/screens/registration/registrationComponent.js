import React, { useMemo, useState } from 'react';
import {
    View,
    KeyboardAvoidingView,
    Image,
    Text,
    ScrollView,
    Platform,
    TouchableOpacity,
    useWindowDimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import icon from '../../assets/images/icon.png';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Button } from 'react-native-paper';
import CustomTextInput from '../../component/CustomTextInput';
import { useResponsiveLayout } from '../../component/Useresponsivelayout';
import { request } from '../../services/services';
// NOTE: add REGISTER_API to services/api-end-points.js, following the same
// pattern as LOGIN_API, e.g. export const REGISTER_API = () => `${BASE_URL}/register`;
import { REGISTER_API } from '../../services/api-end-points';
import { HTTP_METHODS } from '../../services/api-constants';
import { makeAuthStyles } from './authStyles';
import { showSuccessToast, showErrorToast } from '../../utils/Toastutils';
import LottieView from 'lottie-react-native';

const RegistrationComponent = () => {
    const [isHidden, setIsHidden] = useState(true);

    const layout = useResponsiveLayout();

    const { height: screenHeight } = useWindowDimensions();
    const styles = useMemo(() => makeAuthStyles(layout, screenHeight), [layout, screenHeight]);

    const navigation = useNavigation();

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
                    {/* Header band: colored, holds title + subtitle */}
                    <LinearGradient
                        colors={['#1a73e8', '#3562a6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.headerBand}
                    >
                        <Text style={styles.title}>Create Your Account</Text>
                        <Text style={styles.subtitle}>
                            Join Konsyl Pharmaceuticals Pvt Ltd
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
                                emailId: '',
                                mobileNumber: '',
                                firstName: '',
                                lastName: '',
                                companyName: '',
                                gstNumber: '',
                                city: '',
                                addressLine1: '',
                                state: '',
                                zipCode: '',
                                password: '',
                            }}
                            validationSchema={Yup.object().shape({
                                emailId: Yup.string()
                                    .trim()
                                    .email('Enter a valid email address')
                                    .required('Email is required'),
                                mobileNumber: Yup.string()
                                    .trim()
                                    .matches(/^[0-9]{10}$/, 'Enter a valid 10-digit mobile number')
                                    .required('Mobile number is required'),
                                firstName: Yup.string()
                                    .trim()
                                    .required('Please enter your first name'),
                                lastName: Yup.string()
                                    .trim()
                                    .required('Please enter your last name'),
                                companyName: Yup.string()
                                    .trim()
                                    .required('Please enter your company name'),
                                gstNumber: Yup.string()
                                    .trim()
                                    .matches(
                                        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                                        'Enter a valid GST number'
                                    )
                                    .required('GST number is required'),
                                city: Yup.string()
                                    .trim()
                                    .required('Please enter your city'),
                                addressLine1: Yup.string()
                                    .trim()
                                    .required('Address is required'),
                                state: Yup.string()
                                    .trim()
                                    .required('Please enter your state'),
                                zipCode: Yup.string()
                                    .trim()
                                    .matches(/^[0-9]{4,6}$/, 'Enter a valid zip code')
                                    .required('Zip code is required'),
                                password: Yup.string()
                                    .trim()
                                    .required('Password is required')
                                    .min(6, 'Minimum 6 characters required'),
                            })}
                            validateOnChange={true}
                            validateOnBlur={true}
                            onSubmit={async (values, { setSubmitting, resetForm }) => {
                                setSubmitting(true);
                                try {
                                    const formData = new FormData();

                                    formData.append('first_name', values.firstName);
                                    formData.append('last_name', values.lastName);
                                    formData.append('mobile_number', values.mobileNumber);
                                    //
                                    formData.append('email', values.emailId);
                                    formData.append('password', values.password);
                                    formData.append('password_confirmation', values.password);
                                    formData.append('company_name', values.companyName);
                                    formData.append('gst_number', values.gstNumber);
                                    formData.append('address_line1', values.addressLine1);
                                    formData.append('city', values.city);
                                    formData.append('state', values.state);
                                    formData.append('zip_code', values.zipCode);
                                    //
                                    const result = await request(REGISTER_API(), HTTP_METHODS.MULTIPART, formData);
                                    showSuccessToast('Please log in with your new account.', 'Registration successful');

                                    resetForm();
                                    navigation.navigate('Login');
                                } catch (e) {
                                    showErrorToast(e?.response?.data?.message || 'Registration failed. Please try again.');
                                } finally {
                                    setSubmitting(false);
                                }
                            }}
                        >
                            {({ handleChange, handleSubmit, values, errors, touched, isSubmitting }) => (
                                <>
                                    {/* Fields grid: 2 per row in landscape/wide layout,
                                        1 per row in portrait/narrow layout, except
                                        Address which is always full width. */}
                                    <View style={styles.fieldsGrid}>
                                        <View style={styles.fieldWrap}>
                                            <CustomTextInput
                                                leftIcon="user"
                                                placeholder="First Name"
                                                value={values.firstName}
                                                onChangeText={handleChange('firstName')}
                                                error={touched.firstName && !!errors.firstName}
                                                errorText={errors.firstName}
                                                inputStyle={styles.input}
                                                outlineStyle={{ borderRadius: 10, backgroundColor: '#f4f4f4' }}
                                                outlineColor="#e2eaf4"
                                                activeOutlineColor="#eef3fb"
                                            />
                                        </View>

                                        <View style={styles.fieldWrap}>
                                            <CustomTextInput
                                                leftIcon="user"
                                                placeholder="Last Name"
                                                value={values.lastName}
                                                onChangeText={handleChange('lastName')}
                                                error={touched.lastName && !!errors.lastName}
                                                errorText={errors.lastName}
                                                inputStyle={styles.input}
                                                outlineStyle={{ borderRadius: 10, backgroundColor: '#f4f4f4' }}
                                                outlineColor="#e2eaf4"
                                                activeOutlineColor="#eef3fb"
                                            />
                                        </View>
                                        <View style={styles.fieldWrapFull}>
                                            <CustomTextInput
                                                leftIcon="envelope"
                                                placeholder="Email Id"
                                                value={values.emailId}
                                                onChangeText={handleChange('emailId')}
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                                error={touched.emailId && !!errors.emailId}
                                                errorText={errors.emailId}
                                                inputStyle={styles.input}
                                                outlineStyle={{ borderRadius: 10, backgroundColor: '#f4f4f4' }}
                                                outlineColor="#e2eaf4"
                                                activeOutlineColor="#eef3fb"
                                            />
                                        </View>

                                        <View style={styles.fieldWrap}>
                                            <CustomTextInput
                                                leftIcon="phone-alt"
                                                placeholder="Mobile Number"
                                                value={values.mobileNumber}
                                                onChangeText={handleChange('mobileNumber')}
                                                keyboardType="phone-pad"
                                                maxLength={10}
                                                error={touched.mobileNumber && !!errors.mobileNumber}
                                                errorText={errors.mobileNumber}
                                                inputStyle={styles.input}
                                                outlineStyle={{ borderRadius: 10, backgroundColor: '#f4f4f4' }}
                                                outlineColor="#e2eaf4"
                                                activeOutlineColor="#eef3fb"
                                            />
                                        </View>
                                        <View style={styles.fieldWrap}>
                                            <CustomTextInput
                                                leftIcon="lock"
                                                rightIcon={isHidden ? 'eye-slash' : 'eye'}
                                                onRightIconPress={() => setIsHidden((prev) => !prev)}
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
                                        </View>



                                        <View style={styles.fieldWrapFull}>
                                            <CustomTextInput
                                                leftIcon="building"
                                                placeholder="Company Name"
                                                value={values.companyName}
                                                onChangeText={handleChange('companyName')}
                                                error={touched.companyName && !!errors.companyName}
                                                errorText={errors.companyName}
                                                inputStyle={styles.input}
                                                outlineStyle={{ borderRadius: 10, backgroundColor: '#f4f4f4' }}
                                                outlineColor="#e2eaf4"
                                                activeOutlineColor="#eef3fb"
                                            />
                                        </View>


                                        <View style={styles.fieldWrapFull}>
                                            <CustomTextInput
                                                leftIcon="hashtag"
                                                placeholder="GST Number"
                                                value={values.gstNumber}
                                                onChangeText={handleChange('gstNumber')}
                                                autoCapitalize="characters"
                                                maxLength={15}
                                                error={touched.gstNumber && !!errors.gstNumber}
                                                errorText={errors.gstNumber}
                                                inputStyle={styles.input}
                                                outlineStyle={{ borderRadius: 10, backgroundColor: '#f4f4f4' }}
                                                outlineColor="#e2eaf4"
                                                activeOutlineColor="#eef3fb"
                                            />
                                        </View>


                                        {/* Address: always full width, no 2-column split */}
                                        <View style={styles.fieldWrapFull}>
                                            <CustomTextInput
                                                leftIcon="map-marker-alt"
                                                placeholder="Address"
                                                value={values.addressLine1}
                                                onChangeText={handleChange('addressLine1')}
                                                error={touched.addressLine1 && !!errors.addressLine1}
                                                errorText={errors.addressLine1}
                                                inputStyle={styles.input}
                                                outlineStyle={{ borderRadius: 10, backgroundColor: '#f4f4f4' }}
                                                outlineColor="#e2eaf4"
                                                activeOutlineColor="#eef3fb"
                                            />
                                        </View>

                                        <View style={styles.fieldWrap}>
                                            <CustomTextInput
                                                leftIcon="city"
                                                placeholder="City"
                                                value={values.city}
                                                onChangeText={handleChange('city')}
                                                error={touched.city && !!errors.city}
                                                errorText={errors.city}
                                                inputStyle={styles.input}
                                                outlineStyle={{ borderRadius: 10, backgroundColor: '#f4f4f4' }}
                                                outlineColor="#e2eaf4"
                                                activeOutlineColor="#eef3fb"
                                            />
                                        </View>
                                        <View style={styles.fieldWrap}>
                                            <CustomTextInput
                                                leftIcon="map"
                                                placeholder="State"
                                                value={values.state}
                                                onChangeText={handleChange('state')}
                                                error={touched.state && !!errors.state}
                                                errorText={errors.state}
                                                inputStyle={styles.input}
                                                outlineStyle={{ borderRadius: 10, backgroundColor: '#f4f4f4' }}
                                                outlineColor="#e2eaf4"
                                                activeOutlineColor="#eef3fb"
                                            />
                                        </View>

                                        <View style={styles.fieldWrap}>
                                            <CustomTextInput
                                                leftIcon="map-pin"
                                                placeholder="Zip Code"
                                                value={values.zipCode}
                                                onChangeText={handleChange('zipCode')}
                                                keyboardType="number-pad"
                                                maxLength={6}
                                                error={touched.zipCode && !!errors.zipCode}
                                                errorText={errors.zipCode}
                                                inputStyle={styles.input}
                                                outlineStyle={{ borderRadius: 10, backgroundColor: '#f4f4f4' }}
                                                outlineColor="#e2eaf4"
                                                activeOutlineColor="#eef3fb"
                                            />
                                        </View>


                                    </View>

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
                                            REGISTER
                                        </Button>
                                    </LinearGradient>

                                    {/* Back to Login link */}
                                    <View style={styles.inlineLinkRow}>
                                        <Text style={styles.plainText}>Already have an account? </Text>
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

export { RegistrationComponent };