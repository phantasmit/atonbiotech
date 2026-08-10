// import React, { useState } from 'react';
// import {
//     View,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     ScrollView,
//     StyleSheet,
//     useWindowDimensions,
//     KeyboardAvoidingView,
//     Platform,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import colors from '../../assets/appColor/colors';
// import fonts from '../../assets/fonts/fonts';
// import { useSelector } from 'react-redux';

// const FIELD_CONFIG = [
//     { key: 'firstName', label: 'First Name', keyboardType: 'default' },
//     { key: 'lastName', label: 'Last Name', keyboardType: 'default' },
//     { key: 'mobileNumber', label: 'Mobile Number', keyboardType: 'phone-pad' },
//     { key: 'email', label: 'Email', keyboardType: 'email-address' },
//     { key: 'city', label: 'City', keyboardType: 'default' },
//     { key: 'state', label: 'State', keyboardType: 'default' },
//     { key: 'address_line1', label: 'Address 1', keyboardType: 'default' },
//     { key: 'address_line2', label: 'Address 2', keyboardType: 'default' },
//     { key: 'zip_code', label: 'ZipCode', keyboardType: 'number' },
// ];

// const UpdateProfileComponent = () => {
//     const navigation = useNavigation();
//     const { width } = useWindowDimensions();
//     const insets = useSafeAreaInsets();
//     const isWideLayout = width >= 600; // tablet/iPad or landscape phone -> two columns

//     const userInfo = useSelector((state) => state.auth.userData);
//     const {
//         first_name = '',
//         last_name = "",
//         email = '',
//         avatarUrl = null,
//         company_name = '',
//         mobile_number = '',
//         address_line1 = '',
//         address_line2 = '',
//         zip_code = '',
//         city = "",
//         state = ""
//     } = userInfo;

//     const [form, setForm] = useState({
//         firstName: first_name,
//         lastName: last_name,
//         mobileNumber: mobile_number,
//         email: email,
//         city: city,
//         state: state,
//         address_line1: address_line1,
//         address_line2: address_line2,
//         zip_code: zip_code,
//     });




//     const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

//     const handleUpdate = () => {
//         // TODO: wire to real API / redux action
//         console.log('Updating profile:', form);
//     };

//     // Pair up fields into rows of 2 for wide layout
//     const fieldRows = [];
//     for (let i = 0; i < FIELD_CONFIG.length; i += 2) {
//         fieldRows.push(FIELD_CONFIG.slice(i, i + 2));
//     }

//     const renderField = (field) => (
//         <View key={field.key} style={styles.fieldCol}>
//             <Text style={styles.label}>{field.label}</Text>
//             <TextInput
//                 style={styles.input}
//                 value={form[field.key]}
//                 onChangeText={(v) => setField(field.key, v)}
//                 keyboardType={field.keyboardType}
//                 autoCapitalize={field.key === 'email' ? 'none' : 'sentences'}
//                 placeholderTextColor="#999"
//             />
//         </View>
//     );

//     return (
//         <View style={{ flex: 1, backgroundColor: '#F4F6F8' }}>
//             {/* Header */}
//             <View style={[styles.header, { paddingTop: insets.top > 0 ? 14 : 14, backgroundColor: '#f3f6fb' }]}>
//                 <TouchableOpacity
//                     onPress={() => navigation.goBack()}
//                     hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
//                 >
//                     <Icon name="arrow-left" size={16} color="black" />
//                 </TouchableOpacity>
//                 <Text style={styles.headerTitle}>Update Profile</Text>
//                 <View style={{ width: 20 }} />
//             </View>

//             <KeyboardAvoidingView
//                 style={{ flex: 1 }}
//                 behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//                 keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
//             >
//                 <ScrollView
//                     contentContainerStyle={[
//                         styles.scrollContent,
//                         {
//                             paddingHorizontal: isWideLayout ? 32 : 20,
//                             maxWidth: isWideLayout ? 900 : undefined,
//                             alignSelf: isWideLayout ? 'center' : 'stretch',
//                             width: '100%',
//                         },
//                         { paddingBottom: insets.bottom + 40 },
//                     ]}
//                     showsVerticalScrollIndicator={false}
//                     keyboardShouldPersistTaps="handled"
//                 >
//                     {isWideLayout
//                         ? fieldRows.map((row, rowIndex) => (
//                             <View key={`row-${rowIndex}`} style={styles.fieldRow}>
//                                 {row.map(renderField)}
//                                 {row.length === 1 && <View style={styles.fieldCol} />}
//                             </View>
//                         ))
//                         : FIELD_CONFIG.map((field) => (
//                             <View key={field.key} style={styles.fieldRowStacked}>
//                                 {renderField(field)}
//                             </View>
//                         ))}

//                     <View style={[styles.submitRow, !isWideLayout && styles.submitRowStacked]}>
//                         <TouchableOpacity
//                             style={[styles.updateBtn, !isWideLayout && { width: '100%' }]}
//                             onPress={handleUpdate}
//                             activeOpacity={0.85}
//                         >
//                             <Text style={styles.updateBtnText}>UPDATE NOW</Text>
//                         </TouchableOpacity>
//                     </View>
//                 </ScrollView>
//             </KeyboardAvoidingView>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     header: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         backgroundColor: colors.ICON_COLOR_PRIMARY,
//         paddingHorizontal: 16,
//         paddingVertical: 14,
//     },
//     headerTitle: {
//         flex: 1,
//         color: 'black',
//         fontSize: 19,
//         fontWeight: '500',
//         fontFamily: fonts.POPPINS_REGULAR,
//         marginLeft: 20,
//     },

//     scrollContent: {
//         paddingTop: 28,
//     },

//     fieldRow: {
//         flexDirection: 'row',
//         gap: 24,
//         marginBottom: 22,
//     },
//     fieldRowStacked: {
//         marginBottom: 18,
//     },
//     fieldCol: {
//         flex: 1,
//     },
//     fieldFullWidth: {
//         marginTop: 6,
//         marginBottom: 28,
//     },

//     label: {
//         fontSize: 14,
//         color: '#666',
//         marginBottom: 8,
//         fontFamily: fonts.POPPINS_REGULAR,
//     },
//     input: {
//         backgroundColor: '#fff',
//         borderRadius: 8,
//         paddingHorizontal: 16,
//         paddingVertical: 14,
//         fontSize: 16,
//         color: '#222',
//         borderWidth: 1,
//         borderColor: '#E4E7EB',
//     },
//     addressInput: {
//         height: 160,
//         paddingTop: 14,
//     },

//     submitRow: {
//         flexDirection: 'row',
//         justifyContent: 'flex-end',
//     },
//     submitRowStacked: {
//         justifyContent: 'center',
//     },
//     updateBtn: {
//         backgroundColor: colors.ICON_COLOR_PRIMARY,
//         paddingVertical: 16,
//         paddingHorizontal: 40,
//         borderRadius: 8,
//         alignItems: 'center',
//         elevation: 2,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.15,
//         shadowRadius: 4,
//     },
//     updateBtnText: {
//         color: '#fff',
//         fontSize: 15,
//         fontWeight: '700',
//         letterSpacing: 0.5,
//     },
// });

// export default UpdateProfileComponent;
// export { UpdateProfileComponent };

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
    Image,
    Alert,
    ActionSheetIOS,
    PermissionsAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import colors from '../../assets/appColor/colors';
import fonts from '../../assets/fonts/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { request } from '../../services/services';
import { IMAGE_BASE_URL, UPDATE_PROFILE_API } from '../../services/api-end-points';
import { HTTP_METHODS } from '../../services/api-constants';
import { saveUser } from '../login/authSlice';

const FIELD_CONFIG = [
    { key: 'firstName', label: 'First Name', keyboardType: 'default' },
    { key: 'lastName', label: 'Last Name', keyboardType: 'default' },
    { key: 'mobileNumber', label: 'Mobile Number', keyboardType: 'phone-pad' },
    { key: 'email', label: 'Email', keyboardType: 'email-address' },
    { key: 'city', label: 'City', keyboardType: 'default' },
    { key: 'state', label: 'State', keyboardType: 'default' },
    { key: 'address_line1', label: 'Address 1', keyboardType: 'default' },
    { key: 'address_line2', label: 'Address 2', keyboardType: 'default' },
    { key: 'zip_code', label: 'ZipCode', keyboardType: 'number' },
];

const UpdateProfileComponent = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const isWideLayout = width >= 600; // tablet/iPad or landscape phone -> two columns

    // Responsive avatar sizing: bigger on tablets, scales down on small phones
    const avatarSize = Math.min(Math.max(width * 0.28, 90), 160);

    const userInfo = useSelector((state) => state.auth.userData);
    const {
        first_name = '',
        last_name = "",
        email = '',
        avatarUrl = null,
        company_name = '',
        mobile_number = '',
        address_line1 = '',
        address_line2 = '',
        zip_code = '',
        city = "",
        state = "",
        profile_picture = ""
    } = userInfo;

    const [form, setForm] = useState({
        firstName: first_name,
        lastName: last_name,
        mobileNumber: mobile_number,
        email: email,
        city: city,
        state: state,
        address_line1: address_line1,
        address_line2: address_line2,
        zip_code: zip_code,
    });

    const [photo, setPhoto] = useState(avatarUrl ? { uri: avatarUrl } : null);
    const [uploading, setUploading] = useState(false);

    const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleUpdate = async () => {
        // TODO: wire to real API / redux action
        // form fields + photo?.uri (or photo?.base64) can be sent together, e.g. via FormData
        //alert(JSON.stringify(form) + " >> " + photo?.uri)
        console.log('Updating profile:', form, photo?.uri);
        const formData = new FormData();

        formData.append('first_name', form.firstName);
        formData.append('last_name', form.lastName);
        formData.append('mobile_number', form.mobileNumber);

        if (photo?.uri) {
            formData.append('profile_picture', {
                uri: photo?.uri,
                type: 'image/jpeg',
                name: 'profile.jpg',
            });
        }

        const result = await request(UPDATE_PROFILE_API(), HTTP_METHODS.MULTIPART, formData)
        //alert(JSON.stringify(result.response.data.data))
        dispatch(saveUser(result.response.data.data));
    };

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
                Alert.alert('Error', response.errorMessage);
            }
            return;
        }
        const asset = response.assets && response.assets[0];
        if (!asset?.uri) return;

        setPhoto({ uri: asset.uri });

        // Save camera captures to the device gallery (optional)
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
            Alert.alert('Permission required', 'Camera permission is needed to take a photo.');
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

    const initials = `${first_name?.[0] ?? ''}${last_name?.[0] ?? ''}`.toUpperCase() || '?';

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
                    {/* Avatar / photo capture section */}
                    <View style={styles.avatarSection}>
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={handleChangePhoto}
                            style={[
                                styles.avatarWrapper,
                                { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
                            ]}
                        >
                            {photo?.uri || profile_picture ? (
                                <Image
                                    source={{ uri: profile_picture ? `${IMAGE_BASE_URL}/${profile_picture}` : photo.uri }}
                                    style={{
                                        width: avatarSize,
                                        height: avatarSize,
                                        borderRadius: avatarSize / 2,
                                    }}
                                />
                            ) : (
                                <View
                                    style={[
                                        styles.avatarPlaceholder,
                                        { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
                                    ]}
                                >
                                    <Text style={[styles.avatarInitials, { fontSize: avatarSize * 0.32 }]}>
                                        {initials}
                                    </Text>
                                </View>
                            )}

                            <View style={styles.editBadge}>
                                <Icon name="camera" size={14} color="#fff" />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleChangePhoto} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Text style={styles.changePhotoText}>Change Photo</Text>
                        </TouchableOpacity>
                    </View>

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
});

export default UpdateProfileComponent;
export { UpdateProfileComponent };