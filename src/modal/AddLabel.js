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
import { useDispatch } from 'react-redux';
import { fetchLabels } from '../screens/addDoctor/hospitalThunks';
import { showErrorToast, showSuccessToast } from '../utils/Toastutils';


// --- Responsive helpers -----------------------------------------------
// Base reference width = 375 (iPhone SE / standard small phone)
const BASE_WIDTH = 375;

// Classify device by its SHORTER dimension so rotating a phone to
// landscape doesn't accidentally make it look like a tablet.
const getBreakpoint = (shortestSide) => {
    if (shortestSide >= 900) return 'largeTablet'; // big iPad, either orientation
    if (shortestSide >= 600) return 'tablet';       // iPad mini / Android tablet
    return 'phone';                                  // all phones, iOS & Android
};

const scale = (width, size) => {
    const factor = width / BASE_WIDTH;
    const clamped = Math.min(Math.max(factor, 0.9), 1.25);
    return Math.round(size * clamped);
};

// Fixed-ish estimates used only to give the ScrollView a real bounded
// height to scroll within (see note below on why this matters).
const HEADER_HEIGHT = 58;
const FOOTER_HEIGHT = 68;
// ------------------------------------------------------------------------

const AddLabel = ({ visible, onClose, onSubmit }) => {
    const navigation = useNavigation();
    const dispatch = useDispatch()
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const isLandscape = width > height;
    const shortestSide = Math.min(width, height);
    const breakpoint = getBreakpoint(shortestSide);
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
            showSuccessToast('', 'Label Create Successfully!')
            navigation.goBack()
        } catch (e) {
            showErrorToast(e?.response?.data?.message)
        } finally {
            resetForm();
            setIsDisable(false)
        }
        //onSubmit?.({ name: "", description: "" });
    };

    const isValid = labelName && labelDiscription;

    // --- Sizing -----------------------------------------------------------
    // Actual vertical room available, after safe areas + a small outer
    // margin. This (not just `height * 0.85`) is what the card and the
    // scrollable body get measured against, so short landscape screens
    // no longer get clipped.
    const outerMargin = 24;
    const availableHeight = Math.max(
        200,
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
            // Capped-width centered dialog instead of edge-to-edge, which
            // both looks better and leaves more of the limited height for
            // the actual form content.
            return { width: Math.min(560, width * 0.78), maxHeight: availableHeight };
        }
        return { width: width - 32, maxHeight: availableHeight };
    })();

    // A real, bounded height for the scrollable body - previously the
    // ScrollView only had `flexGrow: 0` with no bounded height of its own,
    // so on short screens (landscape) it rendered at full content height
    // and got clipped by the card's `overflow: hidden`, which is exactly
    // what was happening to the description field + buttons in the
    // screenshot.
    const scrollMaxHeight = Math.max(
        80,
        (cardStyle.maxHeight ?? availableHeight) - HEADER_HEIGHT - FOOTER_HEIGHT
    );

    const fontScale = (size) => scale(width, size);

    // Description box height adapts to available space instead of a fixed
    // 140px, which was too tall to fit on short landscape screens.
    const descriptionHeight = Math.max(
        60,
        Math.min(140, scrollMaxHeight - 140)
    );

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

                    {/* Scrollable body - given a real bounded height so it
                        actually scrolls instead of overflowing past the card
                        and getting clipped (the landscape bug). */}
                    <ScrollView
                        style={[styles.bodyScroll, { maxHeight: scrollMaxHeight }]}
                        contentContainerStyle={styles.body}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View>
                            <Text style={[styles.label, { fontSize: fontScale(13) }]}>Label Name</Text>
                            <TextInput
                                style={styles.input}
                                value={labelName}
                                onChangeText={(v) => setLabelName(v)}
                                keyboardType={'default'}
                                autoCapitalize={'sentences'}
                                placeholderTextColor="#999"
                            />

                            <View style={styles.fieldColStacked}>
                                <Text style={[styles.label, { fontSize: fontScale(13) }]}>Label Description</Text>
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

    rowFields: { flexDirection: 'row', gap: 16 },
    fieldCol: { flex: 1 },
    fieldColStacked: { marginTop: 20 },

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
        paddingTop: 14,
    }
});

export default AddLabel;