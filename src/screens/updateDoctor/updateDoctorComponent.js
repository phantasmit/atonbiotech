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
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import colors from '../../assets/appColor/colors';
import fonts from '../../assets/fonts/fonts';
import DateTimePicker from '@react-native-community/datetimepicker';
import { request } from '../../services/services';
import { HTTP_METHODS } from '../../services/api-constants';
import { UPDATE_DOCTOR_NAME_API } from '../../services/api-end-points';
import { fetchHospitals } from '../addDoctor/hospitalThunks';
import { useDispatch } from 'react-redux';
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

// Accepts a Date, an ISO string, or a "DD/MM/YYYY" string and returns a Date or null
const toDateOrNull = (value) => {
    if (!value) return null;
    if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) return parsed;
    return null;
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

const UpdateDoctorComponent = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const dispatch = useDispatch();
    const { width, height: screenHeight } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const isWideLayout = width >= 600; // tablet/iPad or landscape phone -> two columns

    const layout = useResponsiveLayout();
    const styles = useMemo(() => makeAuthStyles(layout, screenHeight), [layout, screenHeight]);

    // NOTE: assumes the record being edited is passed via navigation params,
    // e.g. navigation.navigate('UpdateDoctor', { doctor }).
    // Adjust the param name / field names below to match your actual API response shape.
    const doctor = route?.params?.doctor || route?.params?.item || {};

    const [dateOfBirth, setDateOfBirth] = useState(() => toDateOrNull(doctor.date_of_birth));
    const [anniversaryDate, setAnniversaryDate] = useState(() => toDateOrNull(doctor.anniversary_date));
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
                <CustomTextInput
                    leftIcon={field.icon}
                    placeholder={field.label}
                    value={values[field.key]}
                    onChangeText={handleChange(field.key)}
                    onBlur={handleBlur(field.key)}
                    keyboardType={field.keyboardType}
                    error={touched[field.key] && !!errors[field.key]}
                    maxLength={field.key === 'contactNumber' ? 10 : undefined}
                    autoCapitalize={field.key === 'email' ? 'none' : 'sentences'}
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

    // Map the incoming record's field names to the form's field names.
    // Update the right-hand side keys if your API uses different property names.
    const initialValues = {
        hospitalName: doctor.hospital_name || '',
        doctorName: doctor.doctor_name || '',
        email: doctor.email || '',
        contactNumber: doctor.mobile_number || '',
        city: doctor.city || '',
        state: doctor.state || '',
        fullAddress: doctor.address || '',
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F4F6F8' }}>
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
                            <View style={{ flex: 1, alignItems: "flex-start", marginLeft: 30 }}>
                                <Text style={styles.title}>Update Doctor</Text>

                            </View>
                        </View>
                    </LinearGradient>
                    <View style={[stylesHeader.card, { width: '75%' }]}>
                        {/* White body: form */}
                        <View style={styles.formPane}>
                            <Formik
                                enableReinitialize
                                initialValues={initialValues}
                                validationSchema={validationSchema}
                                validateOnChange={true}
                                validateOnBlur={true}
                                onSubmit={async (values, { setSubmitting }) => {
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

                                        // UPDATE_HOSPITAL_API is assumed to accept the record id and
                                        // return the correct endpoint, e.g. UPDATE_HOSPITAL_API(doctor.id)
                                        await request(UPDATE_DOCTOR_NAME_API(doctor.id), HTTP_METHODS.PUT, payload)
                                        dispatch(fetchHospitals());
                                        showSuccessToast('', 'Updated Successfully');
                                        navigation.goBack();
                                    } catch (e) {
                                        console.log('Update doctor failed:', e?.response?.data?.message);
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
                                                    <React.Fragment key={`row-${rowIndex}`}>
                                                        {row.map((field) => (
                                                            <React.Fragment key={field.key}>
                                                                {renderField(field, formikProps)}
                                                            </React.Fragment>
                                                        ))}
                                                    </React.Fragment>
                                                ))
                                                : FIELD_CONFIG.map((field) => (
                                                    <React.Fragment key={field.key}>
                                                        {renderField(field, formikProps)}
                                                    </React.Fragment>
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
                                                    {isSubmitting ? 'UPDATING...' : 'UPDATE DOCTOR'}
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

export default UpdateDoctorComponent;
export { UpdateDoctorComponent };