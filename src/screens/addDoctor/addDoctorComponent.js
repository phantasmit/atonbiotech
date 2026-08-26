import React, { useState, useMemo } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
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
    Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import colors from '../../assets/appColor/colors';
import fonts from '../../assets/fonts/fonts';
import DateTimePicker from '@react-native-community/datetimepicker';
import { request } from '../../services/services';
import { HTTP_METHODS } from '../../services/api-constants';
import { CREATE_HOSPITAL_API } from '../../services/api-end-points';
import { fetchHospitals } from './hospitalThunks';
import { useDispatch } from 'react-redux';
import AppHeader from '../../component/AppHeader';
import CustomTextInput from '../../component/CustomTextInput';
import { makeAuthStyles } from '../registration/authStyles';
import LinearGradient from 'react-native-linear-gradient';
import { Button } from 'react-native-paper';
import { useResponsiveLayout } from '../../component/Useresponsivelayout';

import { showSuccessToast, showErrorToast } from '../../utils/Toastutils';

// required: true fields are validated & show a red asterisk / error text
const FIELD_CONFIG = [
    { key: 'hospitalName', label: 'Hospital Name', keyboardType: 'default', required: true, icon: 'hospital' },
    { key: 'doctorName', label: 'Doctor Name', keyboardType: 'default', required: true, icon: 'user-md' },
    { key: 'email', label: 'Email', keyboardType: 'email-address', required: false, icon: 'envelope' },
    { key: 'contactNumber', label: 'Contact Number', keyboardType: 'phone-pad', required: true, icon: 'phone' },
    { key: 'city', label: 'City', keyboardType: 'default', required: false, icon: 'city' },
    { key: 'state', label: 'State', keyboardType: 'default', required: false, icon: 'map-marker-alt' },
];

const formatDate = (date) => {
    if (!date) return '';
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
};

const validationSchema = Yup.object().shape({
    hospitalName: Yup.string().trim().required('Hospital name is required'),
    doctorName: Yup.string().trim().required('Doctor name is required'),
    contactNumber: Yup.string()
        .trim()
        .required('Contact number is required')
        .matches(/^[0-9]{10}$/, 'Enter a valid 10-digit contact number'),
    email: Yup.string().trim().email('Enter a valid email').notRequired(),
    city: Yup.string().trim().notRequired(),
    state: Yup.string().trim().notRequired(),
    fullAddress: Yup.string().trim().notRequired(),
});

const AddDoctorComponent = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { width, height: screenHeight } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const isWideLayout = width >= 600; // tablet/iPad or landscape phone -> two columns

    const layout = useResponsiveLayout();
    const styles = useMemo(() => makeAuthStyles(layout, screenHeight), [layout, screenHeight]);

    const [dateOfBirth, setDateOfBirth] = useState(null);
    const [anniversaryDate, setAnniversaryDate] = useState(null);
    const [showDobPicker, setShowDobPicker] = useState(false);
    const [showAnniversaryPicker, setShowAnniversaryPicker] = useState(false);

    // ---- Date picker handlers ----
    // Android: dialog auto-dismisses, event.type tells us if user confirmed or cancelled
    // iOS: stays open inline/spinner until user taps Done, so we just update on change
    const onChangeDob = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowDobPicker(false);
            if (event.type === 'set' && selectedDate) {
                setDateOfBirth(selectedDate);
            }
        } else if (selectedDate) {
            setDateOfBirth(selectedDate);
        }
    };

    const onChangeAnniversary = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowAnniversaryPicker(false);
            if (event.type === 'set' && selectedDate) {
                setAnniversaryDate(selectedDate);
            }
        } else if (selectedDate) {
            setAnniversaryDate(selectedDate);
        }
    };

    // Pair up fields into rows of 2 for wide layout
    const fieldRows = [];
    for (let i = 0; i < FIELD_CONFIG.length; i += 2) {
        fieldRows.push(FIELD_CONFIG.slice(i, i + 2));
    }

    const renderField = (field, { values, handleChange, handleBlur, errors, touched }) => {
        const showError = touched[field.key] && errors[field.key];
        return (
            <View style={styles.fieldWrapFull}>
                {/* <Text style={styles.label}>
                    {field.label}
                    {field.required && <Text style={styles.required}> *</Text>}
                </Text>
                <TextInput
                    style={[styles.input, showError && styles.inputError]}
                    value={values[field.key]}
                    onChangeText={handleChange(field.key)}
                    onBlur={handleBlur(field.key)}
                    keyboardType={field.keyboardType}
                    autoCapitalize={field.key === 'email' ? 'none' : 'sentences'}
                    placeholderTextColor="#999"
                /> */}
                <CustomTextInput
                    leftIcon={field.icon}
                    placeholder={field.label}
                    value={values[field.key]}
                    onChangeText={handleChange(field.key)}
                    onBlur={handleBlur(field.key)}
                    keyboardType={field.keyboardType}
                    error={touched.emailId && !!errors.emailId}
                    maxLength={field.key === 'contactNumber' ? 10 : undefined}
                    autoCapitalize={field.key === 'email' ? 'none' : 'sentences'}
                    //errorText={errors.[field.key]}
                    inputStyle={styles.input}
                    outlineStyle={{ borderRadius: 10, backgroundColor: '#f4f4f4' }}
                    outlineColor="#e2eaf4"
                    activeOutlineColor="#eef3fb"
                />
                {showError ? <Text style={styles.errorText}>{errors[field.key]}</Text> : null}
            </View>
        );
    };

    const renderDateField = ({ label, value, icon, onPress }) => (
        // <View style={styles.fieldCol}>
        //     <Text style={styles.label}>{label}</Text>
        //     <TouchableOpacity style={styles.dateInput} onPress={onPress} activeOpacity={0.7}>
        //         <Text style={value ? styles.dateText : styles.datePlaceholder}>
        //             {value ? formatDate(value) : 'Select date'}
        //         </Text>
        //         <Icon name="calendar" size={16} color="#888" />
        //     </TouchableOpacity>
        // </View>
        <View style={styles.fieldWrap}>
            <Pressable onPress={onPress}>
                <CustomTextInput
                    leftIcon={icon}
                    placeholder={label}
                    editable={false}
                    value={value ? formatDate(value) : ''}
                    inputStyle={styles.input}
                    outlineStyle={{ borderRadius: 10, backgroundColor: '#f4f4f4' }}
                    outlineColor="#e2eaf4"
                    activeOutlineColor="#eef3fb"
                />
            </Pressable>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#F4F6F8' }}>
            {/* Header */}
            {/* <View style={[styles.header, { paddingTop: insets.top > 0 ? 14 : 14, backgroundColor: '#f3f6fb' }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <Icon name="arrow-left" size={16} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Hospital</Text>
                <View style={{ width: 20 }} />
            </View> */}
            {/* <AppHeader
                title="Add Hospital"
                onLeftPress={() => navigation.goBack()}
                leftIconName="chevron-left"
                rightType="none"
            /> */}
            <KeyboardAvoidingView
                style={styles.flexOne}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
            >

                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={stylesHeader.scrollContent}
                    automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
                >

                    {/* Header band: colored, holds title + subtitle */}
                    {/* <LinearGradient
                            colors={['#1a73e8', '#3562a6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[styles.headerBand]}
                        >
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                                style={{ position: 'absolute', top: layout.cardPadding, left: layout.gap, zIndex: 3 }}
                            >
                                <Icon name="chevron-left" size={18} color="#ffffff" />
                            </TouchableOpacity>
                            <Text style={styles.title}>Add Hospital</Text>
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
                                <Text style={styles.title}>Add Hospital</Text>

                            </View>
                        </View>
                    </LinearGradient>
                    {/* Logo circle, straddling the header/body seam */}
                    {/* <View style={styles.logoCircleWrap}>
                        <Icon name="clinic-medical" size={28} color="#1a73e8" />
                    </View> */}
                    <View style={[stylesHeader.card, { width: '75%' }]}>
                        {/* White body: form */}
                        <View style={styles.formPane}>
                            <Formik
                                initialValues={{
                                    hospitalName: '',
                                    doctorName: '',
                                    email: '',
                                    contactNumber: '',
                                    city: '',
                                    state: '',
                                    fullAddress: '',
                                }}
                                validationSchema={validationSchema}
                                validateOnChange={true}
                                validateOnBlur={true}
                                onSubmit={async (values, { setSubmitting, resetForm }) => {
                                    setSubmitting(true);
                                    try {
                                        const payload = JSON.stringify({
                                            hospital_name: values.hospitalName.trim(),
                                            doctor_name: values.doctorName.trim(),
                                            email: values.email?.trim() || null,
                                            mobile_number: values.contactNumber.trim(),
                                            city: values.city?.trim() || null,
                                            state: values.state?.trim() || null,
                                            address: values.fullAddress?.trim() || null,
                                            date_of_birth: dateOfBirth ? dateOfBirth.toISOString() : null,
                                            anniversary_date: anniversaryDate ? anniversaryDate.toISOString() : null,
                                        });

                                        // TODO: wire to real API / redux action
                                        //console.log('Creating doctor/hospital:', payload);
                                        await request(CREATE_HOSPITAL_API(), HTTP_METHODS.POST, payload)
                                        resetForm();
                                        setDateOfBirth(null);
                                        setAnniversaryDate(null);
                                        setShowDobPicker(false);
                                        setShowAnniversaryPicker(false);
                                        dispatch(fetchHospitals());
                                        showSuccessToast('', 'Assign Successfully');
                                        navigation.goBack();
                                        //
                                    } catch (e) {
                                        console.log('Create doctor failed:', e?.response?.data?.message);
                                        showErrorToast(e?.response?.data?.message || 'Something went wrong. Please try again.');
                                    } finally {
                                        setSubmitting(false);
                                    }
                                }}
                            >
                                {(formikProps) => {
                                    const { handleSubmit, values, errors, touched, handleChange, handleBlur, isSubmitting } = formikProps;
                                    return (
                                        <View style={styles.fieldsGrid}>
                                            {isWideLayout
                                                ? fieldRows.map((row, rowIndex) => (
                                                    <>
                                                        {row.map((field) => renderField(field, formikProps))}
                                                    </>
                                                ))
                                                : FIELD_CONFIG.map((field) => (
                                                    <>
                                                        {renderField(field, formikProps)}
                                                    </>
                                                ))}

                                            {renderDateField({
                                                label: 'Date of Birth',
                                                value: dateOfBirth,
                                                icon: 'birthday-cake',
                                                onPress: () => setShowDobPicker(true),
                                            })}


                                            {renderDateField({
                                                label: 'Anniversary Date',
                                                value: anniversaryDate,
                                                icon: 'heart',
                                                onPress: () => setShowAnniversaryPicker(true),
                                            })}


                                            {/* Android: dialog picker, shown imperatively */}
                                            {Platform.OS === 'android' && showDobPicker && (
                                                <DateTimePicker
                                                    value={dateOfBirth || new Date()}
                                                    mode="date"
                                                    display="default"
                                                    maximumDate={new Date()}
                                                    onChange={onChangeDob}
                                                />
                                            )}
                                            {Platform.OS === 'android' && showAnniversaryPicker && (
                                                <DateTimePicker
                                                    value={anniversaryDate || new Date()}
                                                    mode="date"
                                                    display="default"
                                                    maximumDate={new Date()}
                                                    onChange={onChangeAnniversary}
                                                />
                                            )}

                                            {/* iOS: inline spinner with Done button */}
                                            {Platform.OS === 'ios' && showDobPicker && (
                                                <View style={styles.iosPickerWrap}>
                                                    <View style={styles.iosPickerHeader}>
                                                        <TouchableOpacity onPress={() => setShowDobPicker(false)}>
                                                            <Text style={styles.iosDoneText}>Done</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                    <DateTimePicker
                                                        value={dateOfBirth || new Date()}
                                                        mode="date"
                                                        display="spinner"
                                                        maximumDate={new Date()}
                                                        onChange={onChangeDob}
                                                    />
                                                </View>
                                            )}
                                            {Platform.OS === 'ios' && showAnniversaryPicker && (
                                                <View style={styles.iosPickerWrap}>
                                                    <View style={styles.iosPickerHeader}>
                                                        <TouchableOpacity onPress={() => setShowAnniversaryPicker(false)}>
                                                            <Text style={styles.iosDoneText}>Done</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                    <DateTimePicker
                                                        value={anniversaryDate || new Date()}
                                                        mode="date"
                                                        display="spinner"
                                                        maximumDate={new Date()}
                                                        onChange={onChangeAnniversary}
                                                    />
                                                </View>
                                            )}
                                            {/* Full Address — always full width, optional */}

                                            <CustomTextInput
                                                leftIcon="address-card"
                                                placeholder={'Full Address'}
                                                value={values.fullAddress}
                                                onChangeText={handleChange('fullAddress')}
                                                onBlur={handleBlur('fullAddress')}
                                                multiline
                                                textAlignVertical="top"
                                                inputStyle={[styles.input, { height: 120, paddingTop: 5 }]}
                                                outlineStyle={{ borderRadius: 10, backgroundColor: '#f4f4f4' }}
                                                outlineColor="#e2eaf4"
                                                activeOutlineColor="#eef3fb"
                                            />
                                            <LinearGradient
                                                colors={['#1a73e8', '#3562a6']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                                style={[styles.buttonGradient, { width: '100%' }]}
                                            >
                                                <Button
                                                    mode="contained"
                                                    onPress={handleSubmit}
                                                    loading={isSubmitting}
                                                    style={styles.primaryButton}
                                                    contentStyle={styles.primaryButtonContent}
                                                >
                                                    {isSubmitting ? 'SAVING...' : 'SAVE DOCTOR'}
                                                </Button>
                                            </LinearGradient>


                                        </View>
                                    );
                                }}
                            </Formik>
                        </View>
                    </View>
                </ScrollView>

            </KeyboardAvoidingView>

        </View>
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
// const stylesss = StyleSheet.create({
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
//     required: {
//         color: '#E74C3C',
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
//     inputError: {
//         borderColor: '#E74C3C',
//     },
//     errorText: {
//         color: '#E74C3C',
//         fontSize: 12,
//         marginTop: 6,
//         fontFamily: fonts.POPPINS_REGULAR,
//     },
//     addressInput: {
//         height: 160,
//         paddingTop: 14,
//     },

//     dateInput: {
//         backgroundColor: '#fff',
//         borderRadius: 8,
//         paddingHorizontal: 16,
//         paddingVertical: 14,
//         borderWidth: 1,
//         borderColor: '#E4E7EB',
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//     },
//     dateText: {
//         fontSize: 16,
//         color: '#222',
//     },
//     datePlaceholder: {
//         fontSize: 16,
//         color: '#999',
//     },

//     iosPickerWrap: {
//         backgroundColor: '#fff',
//         borderRadius: 8,
//         borderWidth: 1,
//         borderColor: '#E4E7EB',
//         marginBottom: 22,
//         overflow: 'hidden',
//     },
//     iosPickerHeader: {
//         flexDirection: 'row',
//         justifyContent: 'flex-end',
//         paddingHorizontal: 16,
//         paddingVertical: 10,
//         borderBottomWidth: 1,
//         borderBottomColor: '#E4E7EB',
//     },
//     iosDoneText: {
//         color: colors.ICON_COLOR_PRIMARY,
//         fontWeight: '600',
//         fontSize: 15,
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

export default AddDoctorComponent;
export { AddDoctorComponent };