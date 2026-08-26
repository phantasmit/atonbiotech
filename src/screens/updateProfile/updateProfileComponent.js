import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    useWindowDimensions,
    KeyboardAvoidingView,
    Platform,
    Image,
    Alert,
    ActionSheetIOS,
    PermissionsAndroid,
    StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { request } from '../../services/services';
import { IMAGE_BASE_URL, UPDATE_PROFILE_API } from '../../services/api-end-points';
import { HTTP_METHODS } from '../../services/api-constants';
import { saveUser } from '../login/authSlice';
import LinearGradient from 'react-native-linear-gradient';
import { Button } from 'react-native-paper';
import CustomTextInput from '../../component/CustomTextInput';
import { useResponsiveLayout } from '../../component/Useresponsivelayout';
// Same shared card styles Login/ForgotPassword/OTP already use, so this
// screen picks up box / headerBand / logoCircleWrap / formPane / fieldsGrid
// for free instead of a separate local StyleSheet.
import { makeAuthStyles } from '../registration/authStyles';
import { showSuccessToast, showErrorToast } from '../../utils/Toastutils';
import fonts from '../../assets/fonts/fonts';

const FIELD_CONFIG = [
    { key: 'firstName', label: 'First Name', leftIcon: 'user', keyboardType: 'default', required: true },
    { key: 'lastName', label: 'Last Name', leftIcon: 'user', keyboardType: 'default', required: true },
    { key: 'mobileNumber', label: 'Mobile Number', leftIcon: 'phone-alt', keyboardType: 'phone-pad', required: true },
    { key: 'email', label: 'Email', leftIcon: 'envelope', keyboardType: 'email-address', required: true },
    { key: 'address_line1', label: 'Address 1', leftIcon: 'home', keyboardType: 'default', full: true },
    { key: 'address_line2', label: 'Address 2', leftIcon: 'home', keyboardType: 'default', full: true },
    { key: 'city', label: 'City', leftIcon: 'city', keyboardType: 'default' },
    { key: 'state', label: 'State', leftIcon: 'map-marker-alt', keyboardType: 'default' },
    { key: 'zip_code', label: 'ZipCode', leftIcon: 'hashtag', keyboardType: 'number-pad' },
];

const getBreakpoint = (width) => {
    if (width >= 900) return 'largeTablet'; // iPad Pro / landscape iPad
    if (width >= 600) return 'tablet';      // iPad mini/portrait, Android tablets
    return 'phone';                         // all phones, iOS & Android
};

const UpdateProfileComponent = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { width, height: screenHeight } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const isWideLayout = width >= 600; // tablet/iPad or landscape phone -> two columns

    const layout = useResponsiveLayout();
    const styles = useMemo(() => makeAuthStyles(layout, screenHeight), [layout, screenHeight]);

    // Avatar circle sizes with the header — bigger on tablets, scales down on small phones
    const avatarSize = layout.imageSize;

    const userInfo = useSelector((state) => state.auth.userData);
    const {
        first_name = '',
        last_name = '',
        email = '',
        mobile_number = '',
        address_line1 = '',
        address_line2 = '',
        zip_code = '',
        city = '',
        state = '',
        profile_picture = '',
    } = userInfo;

    const [photo, setPhoto] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validationSchema = Yup.object().shape({
        firstName: Yup.string().trim().required('First name is required'),
        lastName: Yup.string().trim().required('Last name is required'),
        mobileNumber: Yup.string()
            .trim()
            .matches(/^[0-9]{10}$/, 'Enter a valid 10-digit mobile number')
            .required('Mobile number is required'),
        email: Yup.string().trim().email('Enter a valid email address').required('Email is required'),
        city: Yup.string().trim(),
        state: Yup.string().trim(),
        address_line1: Yup.string().trim(),
        address_line2: Yup.string().trim(),
        zip_code: Yup.string().trim().matches(/^[0-9]{4,6}$/, 'Enter a valid zip code').notRequired(),
    });

    // ---- Permissions ----
    const requestCameraPermission = async () => {
        if (Platform.OS !== 'android') return true;
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: 'Camera Permission',
                    message: 'App needs access to your camera to take a profile photo',
                    buttonPositive: 'OK',
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn(err);
            return false;
        }
    };

    // ---- Image picker handlers ----
    const pickerOptions = {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1000,
        maxHeight: 1000,
        includeBase64: false,
    };

    const handlePickedImage = async (response, source) => {
        if (response.didCancel || response.errorCode) {
            if (response.errorMessage) {
                showErrorToast(response.errorMessage);
            }
            return;
        }
        const asset = response.assets && response.assets[0];
        if (!asset?.uri) return;

        setPhoto({ uri: asset.uri });

        if (source === 'camera') {
            try {
                await CameraRoll.save(asset.uri, { type: 'photo' });
            } catch (err) {
                console.warn('Could not save to camera roll:', err);
            }
        }
    };

    const openCamera = async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            showSuccessToast('Permission required', 'Camera permission is needed to take a photo');
            return;
        }
        const response = await launchCamera(pickerOptions);
        handlePickedImage(response, 'camera');
    };

    const openGallery = async () => {
        const response = await launchImageLibrary(pickerOptions);
        handlePickedImage(response, 'gallery');
    };

    const handleChangePhoto = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancel', 'Take Photo', 'Choose from Library'],
                    cancelButtonIndex: 0,
                },
                (buttonIndex) => {
                    if (buttonIndex === 1) openCamera();
                    if (buttonIndex === 2) openGallery();
                }
            );
        } else {
            Alert.alert(
                'Update Profile Photo',
                undefined,
                [
                    { text: 'Take Photo', onPress: openCamera },
                    { text: 'Choose from Gallery', onPress: openGallery },
                    { text: 'Cancel', style: 'cancel' },
                ],
                { cancelable: true }
            );
        }
    };

    const initials = `${first_name?.[0] ?? ''}${last_name?.[0] ?? ''}`.toUpperCase() || '?';

    // Pair up fields into rows of 2 for wide layout, keeping "full" fields
    // (the two address lines) on their own row.
    const buildRows = () => {
        const rows = [];
        let currentPair = [];
        FIELD_CONFIG.forEach((field) => {
            if (field.full) {
                if (currentPair.length) {
                    rows.push(currentPair);
                    currentPair = [];
                }
                rows.push([field]);
            } else {
                currentPair.push(field);
                if (currentPair.length === 2) {
                    rows.push(currentPair);
                    currentPair = [];
                }
            }
        });
        if (currentPair.length) rows.push(currentPair);
        return rows;
    };
    const breakpoint = getBreakpoint(width);
    const cardWidth = (() => {
        if (breakpoint === 'largeTablet') return Math.min(560, width * 0.55);
        if (breakpoint === 'tablet') return Math.min(500, width * 0.55);
        return width - 30; // phone: near full width, small margins
    })();
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
                        <Text style={styles.title}>Update Profile</Text>
                        <Text style={styles.subtitle}>
                            Keep your account details up to date
                        </Text>
                    </LinearGradient> */}
                {/* <LinearGradient
                    colors={['#6B9FE4', "#6B9FE4"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[stylesHeader.headerBand, { paddingTop: insets.top + 18, borderRadius: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, }]}
                >
                    <View style={[stylesHeader.headerRow, { flexDirection: 'column' }]}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                            style={{ position: 'absolute', top: layout.cardPadding, left: layout.gap, zIndex: 3 }}
                        >
                            <Icon name="chevron-left" size={18} color="#ffffff" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Update Profile</Text>
                        <Text style={styles.subtitle}>
                            Keep your account details up to date
                        </Text>
                    </View>
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
                            <Text style={styles.title}>Update Profile</Text>
                            <Text style={styles.subtitle}>
                                Keep your account details up to date
                            </Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Avatar circle, straddling the header/body seam — replaces the
                        static app logo used on Login/ForgotPassword/OTP with the
                        user's own photo, plus a camera badge to change it. */}


                <View style={[stylesHeader.card, { width: '75%' }]}>
                    {/* White body: form */}
                    <View style={styles.formPane}>
                        <Formik
                            initialValues={{
                                firstName: first_name,
                                lastName: last_name,
                                mobileNumber: mobile_number,
                                email: email,
                                city: city,
                                state: state,
                                address_line1: address_line1,
                                address_line2: address_line2,
                                zip_code: zip_code,
                            }}
                            validationSchema={validationSchema}
                            validateOnChange={true}
                            validateOnBlur={true}
                            onSubmit={async (values, { setSubmitting }) => {
                                setSubmitting(true);
                                setIsSubmitting(true);
                                const formData = new FormData();
                                formData.append('first_name', values.firstName);
                                formData.append('last_name', values.lastName);
                                formData.append('mobile_number', values.mobileNumber);
                                formData.append('email', values.email);
                                formData.append('city', values.city);
                                formData.append('state', values.state);
                                formData.append('address_line1', values.address_line1);
                                formData.append('address_line2', values.address_line2);
                                formData.append('zip_code', values.zip_code);

                                if (photo?.uri) {
                                    formData.append('profile_picture', {
                                        uri: photo.uri,
                                        type: 'image/jpeg',
                                        name: 'profile.jpg',
                                    });
                                }

                                try {
                                    const result = await request(UPDATE_PROFILE_API(), HTTP_METHODS.MULTIPART, formData);
                                    dispatch(saveUser(result.response.data.data));
                                    showSuccessToast('', 'Profile updated successfully');
                                    navigation.goBack()
                                } catch (e) {
                                    console.log('Update profile failed status:', e?.response?.status);
                                    console.log('Update profile failed body:', e?.response?.data?.message);
                                    showErrorToast(e?.response?.data?.message || 'Could not update profile. Please try again.');
                                } finally {
                                    setSubmitting(false);
                                    setIsSubmitting(false);
                                }
                            }}
                        >
                            {({
                                handleChange,
                                handleSubmit,
                                values,
                                errors,
                                touched,
                            }) => (
                                <>
                                    {isWideLayout ? (
                                        <>
                                            <TouchableOpacity
                                                activeOpacity={0.85}
                                                onPress={handleChangePhoto}
                                                style={styles.logoCircleWrap}
                                            >
                                                {photo?.uri || profile_picture ? (
                                                    <Image
                                                        source={{ uri: photo?.uri ? photo.uri : `${IMAGE_BASE_URL}/${profile_picture}` }}
                                                        style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }}
                                                    />
                                                ) : (
                                                    <Text style={{ fontSize: avatarSize * 0.4, fontWeight: '700', color: '#1a73e8' }}>
                                                        {initials}
                                                    </Text>
                                                )}
                                                <View
                                                    style={{
                                                        position: 'absolute',
                                                        bottom: -2,
                                                        right: -2,
                                                        width: 28,
                                                        height: 28,
                                                        borderRadius: 14,
                                                        backgroundColor: '#1a73e8',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        borderWidth: 2,
                                                        borderColor: '#ffffff',
                                                    }}
                                                >
                                                    <Icon name="camera" size={12} color="#ffffff" />
                                                </View>
                                            </TouchableOpacity>

                                            <View style={[styles.fieldsGrid, { paddingTop: 15 }]}>

                                                {FIELD_CONFIG.map((field) => (
                                                    <View
                                                        key={field.key}
                                                        style={field.full ? styles.fieldWrapFull : styles.fieldWrap}
                                                    >

                                                        <CustomTextInput
                                                            leftIcon={field.leftIcon}
                                                            placeholder={field.label}
                                                            value={values[field.key]}
                                                            onChangeText={handleChange(field.key)}
                                                            maxLength={field.key === 'mobileNumber' ? 10 : undefined}
                                                            keyboardType={field.keyboardType}
                                                            autoCapitalize={field.key === 'email' ? 'none' : 'sentences'}
                                                            error={touched[field.key] && !!errors[field.key]}
                                                            errorText={errors[field.key]}
                                                            inputStyle={styles.input}
                                                            outlineStyle={{ borderRadius: 10, backgroundColor: '#f4f4f4' }}
                                                            outlineColor="#e2eaf4"
                                                            activeOutlineColor="#eef3fb"
                                                        />
                                                    </View>
                                                ))}
                                            </View>
                                        </>
                                    ) : (
                                        FIELD_CONFIG.map((field) => (
                                            <View key={field.key} style={styles.fieldWrapFull}>
                                                <CustomTextInput
                                                    leftIcon={field.leftIcon}
                                                    placeholder={field.label}
                                                    value={values[field.key]}
                                                    onChangeText={handleChange(field.key)}
                                                    keyboardType={field.keyboardType}
                                                    autoCapitalize={field.key === 'email' ? 'none' : 'sentences'}
                                                    error={touched[field.key] && !!errors[field.key]}
                                                    errorText={errors[field.key]}
                                                    inputStyle={styles.input}
                                                    outlineStyle={{ borderRadius: 10, backgroundColor: '#f4f4f4' }}
                                                    outlineColor="#e2eaf4"
                                                    activeOutlineColor="#eef3fb"
                                                />
                                            </View>
                                        ))
                                    )}

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
                                            UPDATE NOW
                                        </Button>
                                    </LinearGradient>
                                </>
                            )}
                        </Formik>
                    </View>
                </View>
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
export default UpdateProfileComponent;
export { UpdateProfileComponent };