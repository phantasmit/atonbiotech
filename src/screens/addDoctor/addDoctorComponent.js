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

// const FIELD_CONFIG = [
//     { key: 'hospitalName', label: 'Hospital Name', keyboardType: 'default' },
//     { key: 'doctorName', label: 'Doctor Name', keyboardType: 'default' },
//     { key: 'email', label: 'Email', keyboardType: 'email-address' },
//     { key: 'contactNumber', label: 'Contact Number', keyboardType: 'phone-pad' },
//     { key: 'city', label: 'City', keyboardType: 'default' },
//     { key: 'state', label: 'State', keyboardType: 'default' },
// ];

// const AddDoctorComponent = () => {
//     const navigation = useNavigation();
//     const { width } = useWindowDimensions();
//     const insets = useSafeAreaInsets();
//     const isWideLayout = width >= 600; // tablet/iPad or landscape phone -> two columns

//     const [form, setForm] = useState({
//         hospitalName: '',
//         doctorName: '',
//         contactNumber: '',
//         email: '',
//         city: '',
//         state: '',
//         fullAddress: '',
//     });

//     const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

//     const handleUpdate = () => {
//         // TODO: wire to real API / redux action
//         console.log('Updating profile:', form);
//         //CREATE_HOSPITAL_API
//     };

//     // Pair up fields into rows of 2 for wide layout
//     const fieldRows = [];
//     for (let i = 0; i < FIELD_CONFIG.length; i += 2) {
//         fieldRows.push(FIELD_CONFIG.slice(i, i + 2));
//     }

//     const renderField = (field) => (
//         <View key={field.key} style={[styles.fieldCol, field.key === 'hospitalName' && { marginBottom: 10 }]}>
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
//             <View style={[styles.header, { paddingTop: insets.top > 0 ? 14 : 14, backgroundColor: "#f3f6fb" }]}>
//                 <TouchableOpacity
//                     onPress={() => navigation.goBack()}
//                     hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
//                 >
//                     <Icon name="arrow-left" size={16} color="black" />
//                 </TouchableOpacity>
//                 <Text style={styles.headerTitle}>Add Hospital</Text>
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
//                             <View key={`row-${rowIndex}`} style={(rowIndex == 0) ? [styles.fieldRowStacked] : styles.fieldRow}>
//                                 {row.map(renderField)}
//                                 {/* {row.length === 1 && <View style={styles.fieldCol} />} */}
//                             </View>
//                         ))
//                         : FIELD_CONFIG.map((field) => (
//                             <View key={field.key} style={styles.fieldRowStacked}>
//                                 {renderField(field)}
//                             </View>
//                         ))}

//                     {/* Full Address — always full width */}
//                     <View style={styles.fieldFullWidth}>
//                         <Text style={styles.label}>Full Address</Text>
//                         <TextInput
//                             style={[styles.input, styles.addressInput]}
//                             value={form.fullAddress}
//                             onChangeText={(v) => setField('fullAddress', v)}
//                             multiline
//                             textAlignVertical="top"
//                             placeholderTextColor="#999"
//                         />
//                     </View>

//                     <View style={[styles.submitRow, !isWideLayout && styles.submitRowStacked]}>
//                         <TouchableOpacity
//                             style={[styles.updateBtn, !isWideLayout && { width: '100%' }]}
//                             onPress={handleUpdate}
//                             activeOpacity={0.85}
//                         >
//                             <Text style={styles.updateBtnText}>SAVE DOCTOR</Text>
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

// export default AddDoctorComponent;
// export { AddDoctorComponent };

import React, { useState } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import colors from '../../assets/appColor/colors';
import fonts from '../../assets/fonts/fonts';
import DateTimePicker from '@react-native-community/datetimepicker';
import { request } from '../../services/services';
import { HTTP_METHODS } from '../../services/api-constants';
import { CREATE_HOSPITAL_API } from '../../services/api-end-points';
import { fetchHospitals } from './hospitalThunks';
import { useDispatch } from 'react-redux';

// required: true fields are validated & show a red asterisk / error text
const FIELD_CONFIG = [
    { key: 'hospitalName', label: 'Hospital Name', keyboardType: 'default', required: true },
    { key: 'doctorName', label: 'Doctor Name', keyboardType: 'default', required: true },
    { key: 'email', label: 'Email', keyboardType: 'email-address', required: false },
    { key: 'contactNumber', label: 'Contact Number', keyboardType: 'phone-pad', required: true },
    { key: 'city', label: 'City', keyboardType: 'default', required: false },
    { key: 'state', label: 'State', keyboardType: 'default', required: false },
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
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const isWideLayout = width >= 600; // tablet/iPad or landscape phone -> two columns

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
            <View key={field.key} style={[styles.fieldCol, field.key === 'hospitalName' && { marginBottom: 10 }]}>
                <Text style={styles.label}>
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
                />
                {showError ? <Text style={styles.errorText}>{errors[field.key]}</Text> : null}
            </View>
        );
    };

    const renderDateField = ({ label, value, onPress }) => (
        <View style={styles.fieldCol}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity style={styles.dateInput} onPress={onPress} activeOpacity={0.7}>
                <Text style={value ? styles.dateText : styles.datePlaceholder}>
                    {value ? formatDate(value) : 'Select date'}
                </Text>
                <Icon name="calendar" size={16} color="#888" />
            </TouchableOpacity>
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
                <Text style={styles.headerTitle}>Add Hospital</Text>
                <View style={{ width: 20 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
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
                            //
                        } catch (e) {
                            console.log('Create doctor failed:', e?.response?.data?.message);
                            alert(e?.response?.data?.message || 'Something went wrong. Please try again.');
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    {(formikProps) => {
                        const { handleSubmit, values, errors, touched, handleChange, handleBlur, isSubmitting } = formikProps;
                        return (
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
                                {isWideLayout
                                    ? fieldRows.map((row, rowIndex) => (
                                        <View
                                            key={`row-${rowIndex}`}
                                            style={rowIndex === 0 ? [styles.fieldRowStacked] : styles.fieldRow}
                                        >
                                            {row.map((field) => renderField(field, formikProps))}
                                        </View>
                                    ))
                                    : FIELD_CONFIG.map((field) => (
                                        <View key={field.key} style={styles.fieldRowStacked}>
                                            {renderField(field, formikProps)}
                                        </View>
                                    ))}

                                {/* Date of Birth & Anniversary Date — both optional */}
                                {isWideLayout ? (
                                    <View style={styles.fieldRow}>
                                        {renderDateField({
                                            label: 'Date of Birth',
                                            value: dateOfBirth,
                                            onPress: () => setShowDobPicker(true),
                                        })}
                                        {renderDateField({
                                            label: 'Anniversary Date',
                                            value: anniversaryDate,
                                            onPress: () => setShowAnniversaryPicker(true),
                                        })}
                                    </View>
                                ) : (
                                    <>
                                        <View style={styles.fieldRowStacked}>
                                            {renderDateField({
                                                label: 'Date of Birth',
                                                value: dateOfBirth,
                                                onPress: () => setShowDobPicker(true),
                                            })}
                                        </View>
                                        <View style={styles.fieldRowStacked}>
                                            {renderDateField({
                                                label: 'Anniversary Date',
                                                value: anniversaryDate,
                                                onPress: () => setShowAnniversaryPicker(true),
                                            })}
                                        </View>
                                    </>
                                )}

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
                                <View style={styles.fieldFullWidth}>
                                    <Text style={styles.label}>Full Address</Text>
                                    <TextInput
                                        style={[styles.input, styles.addressInput]}
                                        value={values.fullAddress}
                                        onChangeText={handleChange('fullAddress')}
                                        onBlur={handleBlur('fullAddress')}
                                        multiline
                                        textAlignVertical="top"
                                        placeholderTextColor="#999"
                                    />
                                </View>

                                <View style={[styles.submitRow, !isWideLayout && styles.submitRowStacked]}>
                                    <TouchableOpacity
                                        style={[
                                            styles.updateBtn,
                                            !isWideLayout && { width: '100%' },
                                            isSubmitting && { opacity: 0.6 },
                                        ]}
                                        onPress={handleSubmit}
                                        activeOpacity={0.85}
                                        disabled={isSubmitting}
                                    >
                                        <Text style={styles.updateBtnText}>
                                            {isSubmitting ? 'SAVING...' : 'SAVE DOCTOR'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        );
                    }}
                </Formik>
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
    required: {
        color: '#E74C3C',
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
    inputError: {
        borderColor: '#E74C3C',
    },
    errorText: {
        color: '#E74C3C',
        fontSize: 12,
        marginTop: 6,
        fontFamily: fonts.POPPINS_REGULAR,
    },
    addressInput: {
        height: 160,
        paddingTop: 14,
    },

    dateInput: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: '#E4E7EB',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dateText: {
        fontSize: 16,
        color: '#222',
    },
    datePlaceholder: {
        fontSize: 16,
        color: '#999',
    },

    iosPickerWrap: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E4E7EB',
        marginBottom: 22,
        overflow: 'hidden',
    },
    iosPickerHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E4E7EB',
    },
    iosDoneText: {
        color: colors.ICON_COLOR_PRIMARY,
        fontWeight: '600',
        fontSize: 15,
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

export default AddDoctorComponent;
export { AddDoctorComponent };