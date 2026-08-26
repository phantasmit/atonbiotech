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
    TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome';
import colors from '../assets/appColor/colors';
import fonts from '../assets/fonts/fonts';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { CREATE_APPOINTMENT_API } from '../services/api-end-points';
import { request } from '../services/services';
import { HTTP_METHODS } from '../services/api-constants';
import { fetchAppointment } from '../screens/addDoctor/hospitalThunks';
import { showErrorToast, showSuccessToast } from '../utils/Toastutils';

const formatTime = (d) =>
    d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

// --- Responsive helpers -----------------------------------------------
// Base reference width = 375 (iPhone SE / standard small phone)
const BASE_WIDTH = 375;

// Classify device by its SHORTER dimension so rotating a phone to
// landscape doesn't accidentally make it look like a tablet (which
// would change card sizing rules unexpectedly).
const getBreakpoint = (shortestSide) => {
    if (shortestSide >= 900) return 'largeTablet'; // big iPad, either orientation
    if (shortestSide >= 600) return 'tablet';       // iPad mini / Android tablet
    return 'phone';                                  // all phones, iOS & Android
};

// Clamped scale factor so text/padding never blow up on huge tablets
// or shrink too much on the smallest phones.
const scale = (width, size) => {
    const factor = width / BASE_WIDTH;
    const clamped = Math.min(Math.max(factor, 0.9), 1.25);
    return Math.round(size * clamped);
};

// Fixed-ish estimates used only to size the internal ScrollView so it
// has a real, bounded height to scroll within (RN needs this - a
// ScrollView with only `maxHeight` on its parent and no bounded height
// of its own will render at full content height and get clipped).
const HEADER_HEIGHT = 58;
const FOOTER_HEIGHT = 68;
// ------------------------------------------------------------------------

const AddAppointmentModal = ({ visible, onClose, onSubmit }) => {
    const navigation = useNavigation();
    const dispatch = useDispatch()
    //
    const { hospitalData } = useSelector((state) => state.hospitalReducer);
    //
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const isLandscape = width > height;
    const shortestSide = Math.min(width, height);
    const breakpoint = getBreakpoint(shortestSide);
    const isTabletWidth = breakpoint !== 'phone';

    const [doctorName, setDoctorName] = useState('');
    const [selectedItem, setSelectedItem] = useState({});
    const [doctorPickerOpen, setDoctorPickerOpen] = useState(false);
    const [labelDiscription, setLabelDiscription] = useState('')

    const [appointmentDate, setAppointmentDate] = useState(null);
    const [appointmentTime, setAppointmentTime] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const resetForm = () => {
        setDoctorName('');
        setSelectedItem({});
        setLabelDiscription('')
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

    function formatDate(isoString) {
        const date = new Date(isoString);

        // Add 5 hours 30 minutes (in milliseconds)
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

    // Human-readable display date (kept separate from the API formatter above,
    // which the original file re-used - that was fine for the payload but this
    // is what actually renders in the "Select date" field).
    const formatDisplayDate = (d) =>
        d ? d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

    const handleDone = async () => {
        try {
            const result = formatDate(appointmentDate);
            await request(CREATE_APPOINTMENT_API(), HTTP_METHODS.POST, JSON.stringify({
                "hospital_id": selectedItem.id,
                "appointment_at": result,
                "purpose": labelDiscription
            }))
            dispatch(fetchAppointment())
            showSuccessToast('', 'Appointment Create Successfully!')
            resetForm();
        } catch (e) {
            showErrorToast(e?.response?.data?.message)
        } finally {
            navigation.goBack()
        }
        //onSubmit?.({ doctorName, date: appointmentDate, time: appointmentTime });
    };

    const isValid = doctorName && appointmentDate && appointmentTime && labelDiscription;

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

    // --- Sizing -----------------------------------------------------------
    // How much vertical room we actually have, after safe areas + a small
    // outer margin so the card never touches the status/nav bars - this is
    // what was missing before, so on short landscape screens the card
    // (and the picker/description field inside it) had nowhere to go.
    const outerMargin = 24;
    const availableHeight = Math.max(
        220,
        height - insets.top - insets.bottom - outerMargin
    );

    const cardStyle = (() => {
        if (breakpoint === 'largeTablet') {
            return {
                width: Math.min(560, width * 0.45),
                maxHeight: Math.min(availableHeight, height * 0.85),
            };
        }
        if (breakpoint === 'tablet') {
            return {
                width: Math.min(560, width * 0.6),
                maxHeight: Math.min(availableHeight, height * 0.85),
            };
        }
        // phone
        if (isLandscape) {
            // Don't stretch edge-to-edge on a wide, short landscape phone -
            // a centered, capped-width dialog reads much better and leaves
            // more of the limited height for content instead of chrome.
            return {
                width: Math.min(560, width * 0.78),
                maxHeight: availableHeight,
            };
        }
        return { width: width - 32, maxHeight: availableHeight };
    })();

    // Real, bounded height for the scrollable body so RN can actually
    // scroll it instead of overflowing past the card and getting clipped.
    const scrollMaxHeight = Math.max(
        90,
        (cardStyle.maxHeight ?? availableHeight) - HEADER_HEIGHT - FOOTER_HEIGHT
    );

    const fontScale = (size) => scale(width, size);

    // Fields always stack vertically - no side-by-side row layout on
    // tablets or in landscape, per request.
    const descriptionHeight = isLandscape && !isTabletWidth ? 56 : 80;

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

                    {/* Scrollable body - given a real bounded height (not just
                        flexGrow:0) so it scrolls properly instead of getting
                        clipped when there isn't enough vertical space, which
                        is exactly what happened in landscape before. */}
                    <ScrollView
                        style={[styles.bodyScroll, { maxHeight: scrollMaxHeight }]}
                        contentContainerStyle={styles.body}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled
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
                                    data={hospitalData}
                                    keyExtractor={(d, idx) => d?.id?.toString?.() ?? String(idx)}
                                    style={{ maxHeight: Math.min(180, scrollMaxHeight * 0.4) }}
                                    nestedScrollEnabled
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.doctorOption}
                                            onPress={() => { setDoctorName(item.doctor_name); setSelectedItem(item); setDoctorPickerOpen(false); }}
                                        >
                                            <Text style={styles.doctorOptionText}>{item.doctor_name}</Text>
                                        </TouchableOpacity>
                                    )}
                                    ItemSeparatorComponent={() => <View style={styles.optionDivider} />}
                                />
                            </View>
                        )}

                        {/* Time + Date + Reason - always stacked vertically,
                            on every device and orientation. */}
                        <View style={[styles.rowFields, styles.rowFieldsStacked]}>
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
                                        {appointmentDate ? formatDisplayDate(appointmentDate) : 'Select date'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.fieldCol}>
                                <Text style={[styles.label, { fontSize: fontScale(13) }]}>Reason</Text>
                                <TextInput
                                    style={[styles.input, styles.addressInput, { height: descriptionHeight }]}
                                    value={labelDiscription}
                                    onChangeText={(v) => setLabelDiscription(v)}
                                    multiline
                                    textAlignVertical="top"
                                    placeholderTextColor="#999"
                                />
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
        height: 80,
        paddingTop: 14,
    }
});

export default AddAppointmentModal;