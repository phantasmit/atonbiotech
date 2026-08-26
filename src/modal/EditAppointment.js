// import React, { useState } from 'react';
// import {
//     Modal,
//     View,
//     Text,
//     TouchableOpacity,
//     StyleSheet,
//     useWindowDimensions,
//     KeyboardAvoidingView,
//     Platform,
//     Pressable,
//     ScrollView,
//     TextInput
// } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import colors from '../assets/appColor/colors';
// import fonts from '../assets/fonts/fonts';
// import { useNavigation } from '@react-navigation/native';
// import { useDispatch } from 'react-redux';
// import { RE_SCHEDULE_APPOINTMENT_API } from '../services/api-end-points';
// import { request } from '../services/services';
// import { HTTP_METHODS } from '../services/api-constants';
// import { fetchAppointment } from '../screens/addDoctor/hospitalThunks';
// import { showErrorToast, showSuccessToast } from '../utils/Toastutils';

// // const formatTime = (d) =>
// //     d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
// // const formatDate = (d) =>
// //     d ? d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
// const formatTime = (d) => {
//     const date = d instanceof Date ? d : new Date(d);
//     return d ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
// };

// const formatDate = (d) => {
//     const date = d instanceof Date ? d : new Date(d);
//     return d ? date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
// };
// // --- Responsive helpers -----------------------------------------------
// // Base reference width = 375 (iPhone SE / standard small phone)
// const BASE_WIDTH = 375;

// const getBreakpoint = (width) => {
//     if (width >= 900) return 'largeTablet'; // iPad Pro / landscape iPad
//     if (width >= 600) return 'tablet';       // iPad mini/portrait, Android tablets
//     return 'phone';                          // all phones, iOS & Android
// };

// // Clamped scale factor so text/padding never blow up on huge tablets
// // or shrink too much on the smallest phones.
// const scale = (width, size) => {
//     const factor = width / BASE_WIDTH;
//     const clamped = Math.min(Math.max(factor, 0.9), 1.25);
//     return Math.round(size * clamped);
// };

// const EditAppointment = ({ route }) => {
//     //
//     const navigation = useNavigation();
//     const dispatch = useDispatch()
//     //
//     const { doctor_name, appointment_at, id, reschedule_reason } = route?.params;
//     //
//     const { width, height } = useWindowDimensions();
//     const insets = useSafeAreaInsets();

//     const breakpoint = getBreakpoint(width);
//     const isTabletWidth = breakpoint !== 'phone';

//     const [doctorName, setDoctorName] = useState(doctor_name ?? "");
//     const [selectedItem, setSelectedItem] = useState({});
//     const [doctorPickerOpen, setDoctorPickerOpen] = useState(false);
//     const [labelDiscription, setLabelDiscription] = useState(reschedule_reason ?? "")

//     const [appointmentDate, setAppointmentDate] = useState(appointment_at);
//     const [appointmentTime, setAppointmentTime] = useState(appointment_at);
//     const [showDatePicker, setShowDatePicker] = useState(false);
//     const [showTimePicker, setShowTimePicker] = useState(false);

//     const resetForm = () => {
//         setDoctorName('');
//         setSelectedItem({});
//         setLabelDiscription('')
//         setAppointmentDate(null);
//         setAppointmentTime(null);
//         setDoctorPickerOpen(false);
//         setShowDatePicker(false);
//         setShowTimePicker(false);
//     };

//     const handleClose = () => {
//         resetForm();
//         navigation.goBack();
//     };

//     function addISTOffset(isoString) {
//         const date = new Date(isoString);

//         // Add 5 hours 30 minutes (in milliseconds)
//         const istOffsetMs = (5 * 60 + 30) * 60 * 1000;
//         const istDate = new Date(date.getTime() + istOffsetMs);

//         const pad = (num) => String(num).padStart(2, '0');

//         const year = istDate.getUTCFullYear();
//         const month = pad(istDate.getUTCMonth() + 1);
//         const day = pad(istDate.getUTCDate());
//         const hours = pad(istDate.getUTCHours());
//         const minutes = pad(istDate.getUTCMinutes());
//         const seconds = pad(istDate.getUTCSeconds());

//         return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
//     }
//     const handleDone = async () => {
//         try {
//             const result = addISTOffset(appointmentDate);
//             await request(RE_SCHEDULE_APPOINTMENT_API(id), HTTP_METHODS.POST, JSON.stringify({
//                 "rescheduled_to": result,
//                 "reschedule_reason": labelDiscription
//             }))
//             dispatch(fetchAppointment())
//             showSuccessToast('', 'Appointment Re-schedule Successfully!')
//             resetForm();
//         } catch (e) {
//             showErrorToast(e?.response?.data?.message)
//         } finally {
//             navigation.goBack()
//         }
//     };

//     const isValid = doctorName && appointmentDate && appointmentTime && labelDiscription;

//     // Android: native dialog closes itself after pick, so just apply & close.
//     // iOS: keep the inline spinner open until the user taps "Done" explicitly
//     // (this is the part that was getting "stuck" on iOS before).
//     const onDateChange = (event, selected) => {
//         if (Platform.OS === 'android') {
//             setShowDatePicker(false);
//             if (event.type === 'set' && selected) setAppointmentDate(selected);
//         } else {
//             if (selected) setAppointmentDate(selected);
//         }
//     };

//     const onTimeChange = (event, selected) => {
//         if (Platform.OS === 'android') {
//             setShowTimePicker(false);
//             if (event.type === 'set' && selected) setAppointmentTime(selected);
//         } else {
//             if (selected) setAppointmentTime(selected);
//         }
//     };

//     // Card sizing: percentage/clamped width so it behaves correctly from a
//     // 360dp Android phone up through a 1024pt+ iPad Pro landscape.
//     const cardStyle = (() => {
//         if (breakpoint === 'largeTablet') {
//             return { width: Math.min(560, width * 0.45), maxHeight: height * 0.85 };
//         }
//         if (breakpoint === 'tablet') {
//             return { width: Math.min(560, width * 0.6), maxHeight: height * 0.85 };
//         }
//         // phone (iOS + Android)
//         return { width: width - 32, maxHeight: height * 0.88 };
//     })();

//     const fontScale = (size) => scale(width, size);

//     return (
//         <Modal
//             transparent
//             animationType="fade"
//             onRequestClose={handleClose}
//             statusBarTranslucent
//         >
//             <KeyboardAvoidingView
//                 style={styles.backdrop}
//                 behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//             >
//                 <Pressable style={StyleSheet.absoluteFillObject} onPress={handleClose} />

//                 <View style={[styles.card, cardStyle]}>
//                     {/* Header */}
//                     <View style={[styles.header, { paddingTop: Math.max(18, insets.top > 0 ? 18 : 18) }]}>
//                         <Text style={[styles.headerTitle, { fontSize: fontScale(18) }]}>Re-schedule Appointment</Text>
//                         <TouchableOpacity onPress={handleClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
//                             <Icon name="close" size={20} color="#333" />
//                         </TouchableOpacity>
//                     </View>

//                     {/* Scrollable body so nothing gets clipped on small phones
//                         when the dropdown + a picker are open at the same time */}
//                     <ScrollView
//                         style={styles.bodyScroll}
//                         contentContainerStyle={styles.body}
//                         keyboardShouldPersistTaps="handled"
//                         showsVerticalScrollIndicator={false}
//                     >
//                         {/* Doctor select */}
//                         <Text style={[styles.label, { fontSize: fontScale(13) }]}>Doctor Name</Text>
//                         <View
//                             style={[styles.doctorRow, { backgroundColor: 'lightgray' }]}
//                             activeOpacity={0.7}
//                         >
//                             <Icon name="user-circle-o" size={22} color="#777" />
//                             <Text
//                                 style={[styles.doctorText, { fontSize: fontScale(16) }, !doctorName && styles.placeholderText]}
//                                 numberOfLines={1}
//                             >
//                                 {doctorName || 'Doctor Name'}
//                             </Text>

//                         </View>



//                         {/* Time + Date row: always stack on phones, side-by-side on tablets */}
//                         <View style={[styles.rowFields, !isTabletWidth && styles.rowFieldsStacked]}>
//                             <View style={styles.fieldCol}>
//                                 <Text style={[styles.label, { fontSize: fontScale(13) }]}>Appointment Time</Text>
//                                 <TouchableOpacity
//                                     style={styles.fieldInput}
//                                     activeOpacity={0.7}
//                                     onPress={() => setShowTimePicker(true)}
//                                 >
//                                     <Icon name="clock-o" size={18} color="#777" />
//                                     <Text style={[styles.fieldText, { fontSize: fontScale(14) }, !appointmentTime && styles.placeholderText]}>
//                                         {appointmentTime ? formatTime(appointmentTime) : 'Select time'}
//                                     </Text>
//                                 </TouchableOpacity>
//                             </View>

//                             <View style={styles.fieldCol}>
//                                 <Text style={[styles.label, { fontSize: fontScale(13) }]}>Appointment Date</Text>
//                                 <TouchableOpacity
//                                     style={styles.fieldInput}
//                                     activeOpacity={0.7}
//                                     onPress={() => setShowDatePicker(true)}
//                                 >
//                                     <Icon name="calendar" size={17} color="#777" />
//                                     <Text style={[styles.fieldText, { fontSize: fontScale(14) }, !appointmentDate && styles.placeholderText]}>
//                                         {appointmentDate ? formatDate(appointmentDate) : 'Select date'}
//                                     </Text>
//                                 </TouchableOpacity>
//                             </View>

//                             <View style={styles.fieldCol}>
//                                 <Text style={[styles.label, { fontSize: fontScale(13) }]}>Reason</Text>
//                                 <TextInput
//                                     style={[styles.input, styles.addressInput]}
//                                     value={labelDiscription}
//                                     onChangeText={(v) => setLabelDiscription(v)}
//                                     multiline
//                                     textAlignVertical="top"
//                                     placeholderTextColor="#999"
//                                 />
//                             </View>
//                         </View>

//                         {/* iOS inline spinners get an explicit Done/Cancel bar
//                             since the OS never dismisses them on its own */}
//                         {showTimePicker && (
//                             <View style={styles.pickerWrap}>
//                                 <DateTimePicker
//                                     value={new Date()}
//                                     mode="time"
//                                     is24Hour={false}
//                                     display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//                                     onChange={onTimeChange}
//                                 />
//                                 {Platform.OS === 'ios' && (
//                                     <View style={styles.pickerActions}>
//                                         <TouchableOpacity onPress={() => setShowTimePicker(false)}>
//                                             <Text style={styles.pickerActionCancel}>Cancel</Text>
//                                         </TouchableOpacity>
//                                         <TouchableOpacity onPress={() => setShowTimePicker(false)}>
//                                             <Text style={styles.pickerActionDone}>Done</Text>
//                                         </TouchableOpacity>
//                                     </View>
//                                 )}
//                             </View>
//                         )}
//                         {showDatePicker && (
//                             <View style={styles.pickerWrap}>
//                                 <DateTimePicker
//                                     value={new Date()}
//                                     mode="date"
//                                     minimumDate={new Date()}
//                                     display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//                                     onChange={onDateChange}
//                                 />
//                                 {Platform.OS === 'ios' && (
//                                     <View style={styles.pickerActions}>
//                                         <TouchableOpacity onPress={() => setShowDatePicker(false)}>
//                                             <Text style={styles.pickerActionCancel}>Cancel</Text>
//                                         </TouchableOpacity>
//                                         <TouchableOpacity onPress={() => setShowDatePicker(false)}>
//                                             <Text style={styles.pickerActionDone}>Done</Text>
//                                         </TouchableOpacity>
//                                     </View>
//                                 )}
//                             </View>
//                         )}
//                     </ScrollView>

//                     {/* Footer */}
//                     <View style={[styles.footer, { paddingBottom: Math.max(16, insets.bottom) }]}>
//                         <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
//                             <Text style={styles.cancelText}>CANCEL</Text>
//                         </TouchableOpacity>
//                         <TouchableOpacity
//                             style={[styles.doneBtn, !isValid && styles.doneBtnDisabled]}
//                             onPress={handleDone}
//                             disabled={!isValid}
//                         >
//                             <Text style={styles.doneText}>DONE</Text>
//                         </TouchableOpacity>
//                     </View>
//                 </View>
//             </KeyboardAvoidingView>
//         </Modal>
//     );
// };

// const styles = StyleSheet.create({
//     backdrop: {
//         flex: 1,
//         backgroundColor: 'rgba(0,0,0,0.45)',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     card: {
//         backgroundColor: '#fff',
//         borderRadius: 14,
//         overflow: 'hidden',
//         elevation: 10,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.25,
//         shadowRadius: 10,
//     },
//     header: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         paddingHorizontal: 20,
//         paddingVertical: 18,
//         backgroundColor: '#F3F5F7',
//     },
//     headerTitle: { fontWeight: '700', color: '#1a1a1a', fontFamily: fonts.POPPINS_REGULAR },
//     bodyScroll: { flexGrow: 0 },
//     body: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8 },
//     label: { fontWeight: '700', color: '#333', marginBottom: 8 },

//     doctorRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         borderWidth: 1,
//         borderColor: '#DDD',
//         borderRadius: 8,
//         paddingHorizontal: 14,
//         paddingVertical: 14,
//         gap: 10,
//     },
//     doctorText: { flex: 1, color: '#222', fontWeight: '500' },
//     placeholderText: { color: '#999', fontWeight: '400' },
//     selectOneText: { fontSize: 13, color: '#999' },

//     doctorDropdown: {
//         marginTop: 6,
//         borderWidth: 1,
//         borderColor: '#EEE',
//         borderRadius: 8,
//         backgroundColor: '#fff',
//         elevation: 3,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//     },
//     doctorOption: { paddingHorizontal: 16, paddingVertical: 13 },
//     doctorOptionText: { fontSize: 14, color: '#222' },
//     optionDivider: { height: 1, backgroundColor: '#F0F0F0' },

//     rowFields: { flexDirection: 'row', gap: 16, marginTop: 20 },
//     rowFieldsStacked: { flexDirection: 'column', gap: 20 },
//     fieldCol: { flex: 1 },
//     fieldInput: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         borderWidth: 1,
//         borderColor: '#DDD',
//         borderRadius: 8,
//         paddingHorizontal: 14,
//         height: 52,
//         gap: 10,
//     },
//     fieldText: { color: '#222' },

//     pickerWrap: { marginTop: 8 },
//     pickerActions: {
//         flexDirection: 'row',
//         justifyContent: 'flex-end',
//         gap: 24,
//         paddingHorizontal: 8,
//         paddingVertical: 4,
//     },
//     pickerActionCancel: { color: '#888', fontWeight: '600', fontSize: 14 },
//     pickerActionDone: { color: colors.ICON_COLOR_PRIMARY, fontWeight: '700', fontSize: 14 },

//     footer: {
//         flexDirection: 'row',
//         justifyContent: 'flex-end',
//         alignItems: 'center',
//         gap: 24,
//         paddingHorizontal: 20,
//         paddingTop: 20,
//     },
//     cancelBtn: { paddingVertical: 12, paddingHorizontal: 8 },
//     cancelText: { fontSize: 14, fontWeight: '700', color: '#333', letterSpacing: 0.5 },
//     doneBtn: {
//         paddingHorizontal: 24,
//         paddingVertical: 12,
//         borderRadius: 8,
//         backgroundColor: colors.ICON_COLOR_PRIMARY,
//     },
//     doneBtnDisabled: { opacity: 0.4 },
//     doneText: { fontSize: 14, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
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
//         height: 80,
//         paddingTop: 14,
//     }
// });

// export default EditAppointment;

import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    useWindowDimensions,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    TextInput
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome';
import colors from '../assets/appColor/colors';
import fonts from '../assets/fonts/fonts';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { RE_SCHEDULE_APPOINTMENT_API } from '../services/api-end-points';
import { request } from '../services/services';
import { HTTP_METHODS } from '../services/api-constants';
import { fetchAppointment } from '../screens/addDoctor/hospitalThunks';
import { showErrorToast, showSuccessToast } from '../utils/Toastutils';

const formatTime = (d) => {
    const date = d instanceof Date ? d : new Date(d);
    return d ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
};

const formatDate = (d) => {
    const date = d instanceof Date ? d : new Date(d);
    return d ? date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
};

// --- Responsive helpers -----------------------------------------------
const BASE_WIDTH = 375;

const getBreakpoint = (width) => {
    if (width >= 900) return 'largeTablet';
    if (width >= 600) return 'tablet';
    return 'phone';
};

const scale = (width, size) => {
    const factor = width / BASE_WIDTH;
    const clamped = Math.min(Math.max(factor, 0.9), 1.25);
    return Math.round(size * clamped);
};

const EditAppointment = ({ route }) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();

    const { doctor_name, appointment_at, id, reschedule_reason } = route?.params;

    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const breakpoint = getBreakpoint(width);
    const isTabletWidth = breakpoint !== 'phone';

    const [doctorName, setDoctorName] = useState(doctor_name ?? '');
    const [labelDiscription, setLabelDiscription] = useState(reschedule_reason ?? '');

    const [appointmentDate, setAppointmentDate] = useState(
        appointment_at ? new Date(appointment_at) : new Date()
    );
    const [appointmentTime, setAppointmentTime] = useState(
        appointment_at ? new Date(appointment_at) : new Date()
    );
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const resetForm = () => {
        setDoctorName('');
        setLabelDiscription('');
        setAppointmentDate(null);
        setAppointmentTime(null);
        setShowDatePicker(false);
        setShowTimePicker(false);
    };

    const handleClose = () => {
        resetForm();
        navigation.goBack();
    };

    function addISTOffset(isoString) {
        const date = new Date(isoString);
        const istOffsetMs = (5 * 60 + 30) * 60 * 1000;
        const istDate = new Date(date.getTime() + istOffsetMs);

        const pad = (num) => String(num).padStart(2, '0');

        const year = istDate.getUTCFullYear();
        const month = pad(istDate.getUTCMonth() + 1);
        const day = pad(istDate.getUTCDate());
        const hours = pad(istDate.getUTCHours());
        const minutes = pad(istDate.getUTCMinutes());
        const seconds = pad(istDate.getUTCSeconds());

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    const handleDone = async () => {
        try {
            const result = addISTOffset(appointmentDate);
            await request(
                RE_SCHEDULE_APPOINTMENT_API(id),
                HTTP_METHODS.POST,
                JSON.stringify({
                    rescheduled_to: result,
                    reschedule_reason: labelDiscription
                })
            );
            dispatch(fetchAppointment());
            showSuccessToast('', 'Appointment Re-schedule Successfully!');
            resetForm();
        } catch (e) {
            showErrorToast(e?.response?.data?.message);
        } finally {
            navigation.goBack();
        }
    };

    const isValid = doctorName && appointmentDate && appointmentTime && labelDiscription;

    const onDateChange = (event, selected) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
            if (event.type === 'set' && selected) setAppointmentDate(selected);
        } else {
            if (selected) setAppointmentDate(selected);
        }
    };

    const onTimeChange = (event, selected) => {
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
            if (event.type === 'set' && selected) setAppointmentTime(selected);
        } else {
            if (selected) setAppointmentTime(selected);
        }
    };

    const cardStyle = (() => {
        if (breakpoint === 'largeTablet') {
            return { width: Math.min(560, width * 0.45), maxHeight: height * 0.85 };
        }
        if (breakpoint === 'tablet') {
            return { width: Math.min(560, width * 0.6), maxHeight: height * 0.85 };
        }
        return { width: width - 32, maxHeight: height * 0.9 };
    })();

    const fontScale = (size) => scale(width, size);

    return (
        <Modal transparent animationType="fade" onRequestClose={handleClose} statusBarTranslucent>
            <KeyboardAvoidingView
                style={styles.backdrop}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <Pressable style={StyleSheet.absoluteFillObject} onPress={handleClose} />

                <View style={[styles.card, cardStyle]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.headerTitle, { fontSize: fontScale(18) }]}>
                            Re-schedule Appointment
                        </Text>
                        <TouchableOpacity
                            onPress={handleClose}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                            style={styles.closeBtn}
                        >
                            <Icon name="close" size={18} color="#555" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.bodyScroll}
                        contentContainerStyle={styles.body}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Doctor */}
                        <Text style={[styles.label, { fontSize: fontScale(12) }]}>DOCTOR NAME</Text>
                        <View style={styles.doctorRow}>
                            <View style={styles.iconBubble}>
                                <Icon name="user-circle-o" size={20} color={colors.ICON_COLOR_PRIMARY} />
                            </View>
                            <Text
                                style={[
                                    styles.doctorText,
                                    { fontSize: fontScale(15) },
                                    !doctorName && styles.placeholderText
                                ]}
                                numberOfLines={1}
                            >
                                {doctorName || 'Doctor Name'}
                            </Text>
                        </View>

                        {/* Time + Date row */}
                        <View style={[styles.rowFields, !isTabletWidth && styles.rowFieldsStacked]}>
                            <View style={styles.fieldCol}>
                                <Text style={[styles.label, { fontSize: fontScale(12) }]}>
                                    APPOINTMENT TIME
                                </Text>
                                <TouchableOpacity
                                    style={styles.fieldInput}
                                    activeOpacity={0.7}
                                    onPress={() => setShowTimePicker(true)}
                                >
                                    <Icon name="clock-o" size={17} color="#8A8F98" />
                                    <Text
                                        style={[
                                            styles.fieldText,
                                            { fontSize: fontScale(14) },
                                            !appointmentTime && styles.placeholderText
                                        ]}
                                    >
                                        {appointmentTime ? formatTime(appointmentTime) : 'Select time'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.fieldCol}>
                                <Text style={[styles.label, { fontSize: fontScale(12) }]}>
                                    APPOINTMENT DATE
                                </Text>
                                <TouchableOpacity
                                    style={styles.fieldInput}
                                    activeOpacity={0.7}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Icon name="calendar" size={16} color="#8A8F98" />
                                    <Text
                                        style={[
                                            styles.fieldText,
                                            { fontSize: fontScale(14) },
                                            !appointmentDate && styles.placeholderText
                                        ]}
                                    >
                                        {appointmentDate ? formatDate(appointmentDate) : 'Select date'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Reason — its own full-width row, always below Time/Date */}
                        <View style={styles.reasonSection}>
                            <Text style={[styles.label, { fontSize: fontScale(12) }]}>REASON</Text>
                            <TextInput
                                style={[styles.input, styles.addressInput, { fontSize: fontScale(14) }]}
                                value={labelDiscription}
                                onChangeText={(v) => setLabelDiscription(v)}
                                placeholder="Add a reason for rescheduling"
                                placeholderTextColor="#9AA0A6"
                                multiline
                                textAlignVertical="top"
                            />
                        </View>

                        {showTimePicker && (
                            <View style={styles.pickerWrap}>
                                <DateTimePicker
                                    value={appointmentTime || new Date()}
                                    mode="time"
                                    is24Hour={false}
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={onTimeChange}
                                />
                                {Platform.OS === 'ios' && (
                                    <View style={styles.pickerActions}>
                                        <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                                            <Text style={styles.pickerActionCancel}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                                            <Text style={styles.pickerActionDone}>Done</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        )}
                        {showDatePicker && (
                            <View style={styles.pickerWrap}>
                                <DateTimePicker
                                    value={appointmentDate || new Date()}
                                    mode="date"
                                    minimumDate={new Date()}
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={onDateChange}
                                />
                                {Platform.OS === 'ios' && (
                                    <View style={styles.pickerActions}>
                                        <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                            <Text style={styles.pickerActionCancel}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                            <Text style={styles.pickerActionDone}>Done</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        )}
                    </ScrollView>

                    {/* Footer */}
                    <View style={[styles.footer, { paddingBottom: Math.max(16, insets.bottom) }]}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                            <Text style={styles.cancelText}>CANCEL</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.doneBtn, !isValid && styles.doneBtnDisabled]}
                            onPress={handleDone}
                            disabled={!isValid}
                        >
                            <Text style={styles.doneText}>DONE</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 18,
        backgroundColor: '#F6F7F9',
        borderBottomWidth: 1,
        borderBottomColor: '#ECEEF1',
    },
    headerTitle: { fontWeight: '700', color: '#1A1A1A', fontFamily: fonts.POPPINS_REGULAR, flexShrink: 1, paddingRight: 12 },
    closeBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#EAECEF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bodyScroll: { flexGrow: 0 },
    body: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
    label: { fontWeight: '700', color: '#6B7280', marginBottom: 8, letterSpacing: 0.4 },

    doctorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E4E7EB',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        gap: 10,
        backgroundColor: '#FAFBFC',
    },
    iconBubble: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    doctorText: { flex: 1, color: '#222', fontWeight: '500' },
    placeholderText: { color: '#9AA0A6', fontWeight: '400' },

    rowFields: { flexDirection: 'row', gap: 16, marginTop: 22 },
    rowFieldsStacked: { flexDirection: 'column', gap: 18 },
    fieldCol: { flex: 1 },
    fieldInput: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E4E7EB',
        borderRadius: 10,
        paddingHorizontal: 14,
        height: 50,
        gap: 10,
        backgroundColor: '#FAFBFC',
    },
    fieldText: { color: '#222' },

    reasonSection: { marginTop: 22 },

    pickerWrap: {
        marginTop: 14,
        borderWidth: 1,
        borderColor: '#ECEEF1',
        borderRadius: 12,
        paddingTop: 4,
        backgroundColor: '#FAFBFC',
    },
    pickerActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 24,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#ECEEF1',
    },
    pickerActionCancel: { color: '#888', fontWeight: '600', fontSize: 14 },
    pickerActionDone: { color: colors.ICON_COLOR_PRIMARY, fontWeight: '700', fontSize: 14 },

    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 20,
        paddingHorizontal: 20,
        paddingTop: 18,
        borderTopWidth: 1,
        borderTopColor: '#ECEEF1',
        marginTop: 4,
    },
    cancelBtn: { paddingVertical: 12, paddingHorizontal: 8 },
    cancelText: { fontSize: 14, fontWeight: '700', color: '#333', letterSpacing: 0.5 },
    doneBtn: {
        paddingHorizontal: 26,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: colors.ICON_COLOR_PRIMARY,
    },
    doneBtnDisabled: { opacity: 0.4 },
    doneText: { fontSize: 14, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
    input: {
        backgroundColor: '#FAFBFC',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: '#222',
        borderWidth: 1,
        borderColor: '#E4E7EB',
    },
    addressInput: {
        minHeight: 80,
        paddingTop: 12,
    },
});

export default EditAppointment;