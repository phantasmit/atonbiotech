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
    FlatList,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome';
import colors from '../assets/appColor/colors';
import fonts from '../assets/fonts/fonts';
import { useNavigation } from '@react-navigation/native';

const MOCK_DOCTORS = [
    'Dr. Sarah Mitchell', 'Dr. James Carter', 'Dr. Emily Chen',
    'Dr. Michael Brown', 'Dr. Priya Nair', 'Dr. Robert Lee',
];

const formatTime = (d) =>
    d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
const formatDate = (d) =>
    d ? d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

// --- Responsive helpers -----------------------------------------------
// Base reference width = 375 (iPhone SE / standard small phone)
const BASE_WIDTH = 375;

const getBreakpoint = (width) => {
    if (width >= 900) return 'largeTablet'; // iPad Pro / landscape iPad
    if (width >= 600) return 'tablet';       // iPad mini/portrait, Android tablets
    return 'phone';                          // all phones, iOS & Android
};

// Clamped scale factor so text/padding never blow up on huge tablets
// or shrink too much on the smallest phones.
const scale = (width, size) => {
    const factor = width / BASE_WIDTH;
    const clamped = Math.min(Math.max(factor, 0.9), 1.25);
    return Math.round(size * clamped);
};
// ------------------------------------------------------------------------

const AddAppointmentModal = ({ visible, onClose, onSubmit }) => {
    const navigation = useNavigation();
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const breakpoint = getBreakpoint(width);
    const isTabletWidth = breakpoint !== 'phone';

    const [doctorName, setDoctorName] = useState('');
    const [doctorPickerOpen, setDoctorPickerOpen] = useState(false);

    const [appointmentDate, setAppointmentDate] = useState(null);
    const [appointmentTime, setAppointmentTime] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const resetForm = () => {
        setDoctorName('');
        setAppointmentDate(null);
        setAppointmentTime(null);
        setDoctorPickerOpen(false);
        setShowDatePicker(false);
        setShowTimePicker(false);
    };

    const handleClose = () => {
        resetForm();
        onClose ? onClose() : navigation.goBack();
    };

    const handleDone = () => {
        onSubmit?.({ doctorName, date: appointmentDate, time: appointmentTime });
        resetForm();
    };

    const isValid = doctorName && appointmentDate && appointmentTime;

    // Android: native dialog closes itself after pick, so just apply & close.
    // iOS: keep the inline spinner open until the user taps "Done" explicitly
    // (this is the part that was getting "stuck" on iOS before).
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

    // Card sizing: percentage/clamped width so it behaves correctly from a
    // 360dp Android phone up through a 1024pt+ iPad Pro landscape.
    const cardStyle = (() => {
        if (breakpoint === 'largeTablet') {
            return { width: Math.min(560, width * 0.45), maxHeight: height * 0.85 };
        }
        if (breakpoint === 'tablet') {
            return { width: Math.min(560, width * 0.6), maxHeight: height * 0.85 };
        }
        // phone (iOS + Android)
        return { width: width - 32, maxHeight: height * 0.88 };
    })();

    const fontScale = (size) => scale(width, size);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
            statusBarTranslucent
        >
            <KeyboardAvoidingView
                style={styles.backdrop}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <Pressable style={StyleSheet.absoluteFillObject} onPress={handleClose} />

                <View style={[styles.card, cardStyle]}>
                    {/* Header */}
                    <View style={[styles.header, { paddingTop: Math.max(18, insets.top > 0 ? 18 : 18) }]}>
                        <Text style={[styles.headerTitle, { fontSize: fontScale(18) }]}>Add Appointment</Text>
                        <TouchableOpacity onPress={handleClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                            <Icon name="close" size={20} color="#333" />
                        </TouchableOpacity>
                    </View>

                    {/* Scrollable body so nothing gets clipped on small phones
                        when the dropdown + a picker are open at the same time */}
                    <ScrollView
                        style={styles.bodyScroll}
                        contentContainerStyle={styles.body}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Doctor select */}
                        <Text style={[styles.label, { fontSize: fontScale(13) }]}>Doctor Name</Text>
                        <TouchableOpacity
                            style={styles.doctorRow}
                            activeOpacity={0.7}
                            onPress={() => setDoctorPickerOpen((v) => !v)}
                        >
                            <Icon name="user-circle-o" size={22} color="#777" />
                            <Text
                                style={[styles.doctorText, { fontSize: fontScale(16) }, !doctorName && styles.placeholderText]}
                                numberOfLines={1}
                            >
                                {doctorName || 'Doctor Name'}
                            </Text>
                            <Text style={styles.selectOneText}>
                                {doctorPickerOpen ? 'Close' : 'Select One'}
                            </Text>
                            <Icon name={doctorPickerOpen ? 'caret-up' : 'caret-down'} size={13} color="#999" style={{ marginLeft: 6 }} />
                        </TouchableOpacity>

                        {doctorPickerOpen && (
                            <View style={styles.doctorDropdown}>
                                <FlatList
                                    data={MOCK_DOCTORS}
                                    keyExtractor={(d) => d}
                                    style={{ maxHeight: Math.min(200, height * 0.3) }}
                                    nestedScrollEnabled
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.doctorOption}
                                            onPress={() => { setDoctorName(item); setDoctorPickerOpen(false); }}
                                        >
                                            <Text style={styles.doctorOptionText}>{item}</Text>
                                        </TouchableOpacity>
                                    )}
                                    ItemSeparatorComponent={() => <View style={styles.optionDivider} />}
                                />
                            </View>
                        )}

                        {/* Time + Date row: always stack on phones, side-by-side on tablets */}
                        <View style={[styles.rowFields, !isTabletWidth && styles.rowFieldsStacked]}>
                            <View style={styles.fieldCol}>
                                <Text style={[styles.label, { fontSize: fontScale(13) }]}>Appointment Time</Text>
                                <TouchableOpacity
                                    style={styles.fieldInput}
                                    activeOpacity={0.7}
                                    onPress={() => setShowTimePicker(true)}
                                >
                                    <Icon name="clock-o" size={18} color="#777" />
                                    <Text style={[styles.fieldText, { fontSize: fontScale(14) }, !appointmentTime && styles.placeholderText]}>
                                        {appointmentTime ? formatTime(appointmentTime) : 'Select time'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.fieldCol}>
                                <Text style={[styles.label, { fontSize: fontScale(13) }]}>Appointment Date</Text>
                                <TouchableOpacity
                                    style={styles.fieldInput}
                                    activeOpacity={0.7}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Icon name="calendar" size={17} color="#777" />
                                    <Text style={[styles.fieldText, { fontSize: fontScale(14) }, !appointmentDate && styles.placeholderText]}>
                                        {appointmentDate ? formatDate(appointmentDate) : 'Select date'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* iOS inline spinners get an explicit Done/Cancel bar
                            since the OS never dismisses them on its own */}
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
        borderRadius: 14,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 18,
        backgroundColor: '#F3F5F7',
    },
    headerTitle: { fontWeight: '700', color: '#1a1a1a', fontFamily: fonts.POPPINS_REGULAR },
    bodyScroll: { flexGrow: 0 },
    body: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8 },
    label: { fontWeight: '700', color: '#333', marginBottom: 8 },

    doctorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 14,
        gap: 10,
    },
    doctorText: { flex: 1, color: '#222', fontWeight: '500' },
    placeholderText: { color: '#999', fontWeight: '400' },
    selectOneText: { fontSize: 13, color: '#999' },

    doctorDropdown: {
        marginTop: 6,
        borderWidth: 1,
        borderColor: '#EEE',
        borderRadius: 8,
        backgroundColor: '#fff',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    doctorOption: { paddingHorizontal: 16, paddingVertical: 13 },
    doctorOptionText: { fontSize: 14, color: '#222' },
    optionDivider: { height: 1, backgroundColor: '#F0F0F0' },

    rowFields: { flexDirection: 'row', gap: 16, marginTop: 20 },
    rowFieldsStacked: { flexDirection: 'column', gap: 20 },
    fieldCol: { flex: 1 },
    fieldInput: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        paddingHorizontal: 14,
        height: 52,
        gap: 10,
    },
    fieldText: { color: '#222' },

    pickerWrap: { marginTop: 8 },
    pickerActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 24,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    pickerActionCancel: { color: '#888', fontWeight: '600', fontSize: 14 },
    pickerActionDone: { color: colors.ICON_COLOR_PRIMARY, fontWeight: '700', fontSize: 14 },

    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 24,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    cancelBtn: { paddingVertical: 12, paddingHorizontal: 8 },
    cancelText: { fontSize: 14, fontWeight: '700', color: '#333', letterSpacing: 0.5 },
    doneBtn: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: colors.ICON_COLOR_PRIMARY,
    },
    doneBtnDisabled: { opacity: 0.4 },
    doneText: { fontSize: 14, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
});

export default AddAppointmentModal;