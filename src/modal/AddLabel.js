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
    TextInput,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import colors from '../assets/appColor/colors';
import fonts from '../assets/fonts/fonts';
import { useNavigation } from '@react-navigation/native';
import { request } from '../services/services';
import { CREATE_LABEL_API } from '../services/api-end-points';
import { HTTP_METHODS } from '../services/api-constants';
import { dispatch } from '../navigation/RootNavigation';
import { useDispatch } from 'react-redux';
import { fetchLabels } from '../screens/addDoctor/hospitalThunks';


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

const AddLabel = ({ visible, onClose, onSubmit }) => {
    const navigation = useNavigation();
    const dispatch = useDispatch()
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const breakpoint = getBreakpoint(width);
    const isTabletWidth = breakpoint !== 'phone';


    const [labelName, setLabelName] = useState('')
    const [labelDiscription, setLabelDiscription] = useState('')
    const [isDisable, setIsDisable] = useState(false)

    const resetForm = () => {
        setLabelName('')
        setLabelDiscription('')
    };

    const handleClose = () => {
        resetForm();
        onClose ? onClose() : navigation.goBack();
    };

    const handleDone = async () => {
        setIsDisable(true)

        try {
            await request(CREATE_LABEL_API(), HTTP_METHODS.POST, JSON.stringify({
                "name": labelName,
                "description": labelDiscription
            }))
            dispatch(fetchLabels())
        } catch (e) {

            alert(e?.response?.data?.message)
        } finally {
            resetForm();
            setIsDisable(false)
        }
        //onSubmit?.({ name: "", description: "" });
        //
    };

    const isValid = labelName && labelDiscription;


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
                        <Text style={[styles.headerTitle, { fontSize: fontScale(18) }]}>Create Label</Text>
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
                        {/* Doctor select labelName && labelDiscription*/}
                        <Text style={[styles.label, { fontSize: fontScale(13) }]}>Label Name</Text>
                        <TextInput
                            style={styles.input}
                            value={labelName}
                            onChangeText={(v) => setLabelName(v)}
                            keyboardType={'default'}
                            autoCapitalize={'sentences'}
                            placeholderTextColor="#999"
                        />


                        {/* Time + Date row: always stack on phones, side-by-side on tablets */}
                        <View style={[styles.rowFields, !isTabletWidth && styles.rowFieldsStacked]}>
                            <View style={styles.fieldCol}>
                                <Text style={[styles.label, { fontSize: fontScale(13) }]}>Label Description</Text>
                                <TextInput
                                    style={[styles.input, styles.addressInput]}
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


                    </ScrollView>

                    {/* Footer */}
                    <View style={[styles.footer, { paddingBottom: Math.max(16, insets.bottom) }]}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                            <Text style={styles.cancelText}>CANCEL</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.doneBtn, (!isValid || isDisable) && styles.doneBtnDisabled]}
                            onPress={handleDone}
                            disabled={!isValid || isDisable}
                        >
                            <Text style={styles.doneText}>Create</Text>
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
        height: 140,
        paddingTop: 14,
    }
});

export default AddLabel;