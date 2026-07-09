import React from 'react';
import {
    Modal,
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    useWindowDimensions,
    Platform,
    Pressable,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import colors from '../assets/appColor/colors';
import fonts from '../assets/fonts/fonts';
import { useNavigation, useRoute } from '@react-navigation/native';
// --- Responsive helpers -----------------------------------------------
const BASE_WIDTH = 375;

const getBreakpoint = (width) => {
    if (width >= 900) return 'largeTablet'; // iPad Pro / landscape iPad
    if (width >= 600) return 'tablet';      // iPad mini/portrait, Android tablets
    return 'phone';                         // all phones, iOS & Android
};

const scale = (width, size) => {
    const factor = width / BASE_WIDTH;
    const clamped = Math.min(Math.max(factor, 0.9), 1.25);
    return Math.round(size * clamped);
};
// ------------------------------------------------------------------------

/**
 * Doctor profile modal.
 *
 * Usage:
 * <DoctorProfileModal
 *   visible={modalVisible}
 *   onClose={() => setModalVisible(false)}
 *   onEdit={() => navigation.navigate('EditDoctor', { id: doctor.id })}
 *   doctor={{
 *     name: 'Harsh Harani',
 *     specialty: 'xyz',
 *     avatarUrl: null, // fallback icon used if null
 *     hospitalName: 'Harsh Dental',
 *     contactNumber: '9879660667',
 *     address: 'Maninagar',
 *     state: 'Gujarat',
 *     city: 'Ahmedabad',
 *   }}
 * />
 */
const InfoRow = ({ icon, iconBg, iconColor, label, value, fontScale }) => (
    <View style={styles.infoRow}>
        <View style={[styles.infoIconWrap, { backgroundColor: iconBg }]}>
            <Icon name={icon} size={20} color={iconColor} />
        </View>
        <View style={styles.infoTextWrap}>
            <Text style={[styles.infoLabel, { fontSize: fontScale(13) }]}>{label}</Text>
            <Text style={[styles.infoValue, { fontSize: fontScale(16) }]} numberOfLines={2}>
                {value || '—'}
            </Text>
        </View>
    </View>
);

const DoctorProfileModal = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const { doctor = {} } = route.params ?? {};

    const breakpoint = getBreakpoint(width);
    const fontScale = (size) => scale(width, size);

    const cardStyle = (() => {
        if (breakpoint === 'largeTablet') {
            return { width: Math.min(560, width * 0.45), maxHeight: height * 0.85 };
        }
        if (breakpoint === 'tablet') {
            return { width: Math.min(520, width * 0.6), maxHeight: height * 0.85 };
        }
        return { width: width - 32, maxHeight: height * 0.88 };
    })();

    const avatarSize = breakpoint === 'phone' ? 120 : 150;
    const headerPaddingTop = Math.max(24, insets.top);
    const handleClose = () => navigation.goBack();
    const handleEdit = () =>
        navigation.navigate('updateDoctor', { doctorId: doctor.id, doctor });
    const {
        name = 'dsfds',
        specialty = 'asfd',
        avatarUrl = null,
        hospitalName = 'asdf',
        contactNumber = 'asdf',
        address = 'adf',
        state = 'sadf',
        city = 'asdf',
    } = doctor;

    return (

        <View style={styles.backdrop}>
            <Pressable style={StyleSheet.absoluteFillObject} onPress={handleClose} />

            <View style={[styles.card, cardStyle]}>
                <ScrollView
                    style={{ flexGrow: 0 }}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    {/* Header */}
                    <LinearGradient
                        colors={['#5FBFA0', '#3E8E7E']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={[styles.header, { paddingTop: headerPaddingTop }]}
                    >
                        <TouchableOpacity
                            style={styles.editBtn}
                            onPress={handleEdit}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Icon name="pencil-square-o" size={18} color={colors.ICON_COLOR_PRIMARY || '#3E8E7E'} />
                        </TouchableOpacity>

                        <View
                            style={[
                                styles.avatarWrap,
                                { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
                            ]}
                        >
                            {avatarUrl ? (
                                <Image
                                    source={{ uri: avatarUrl }}
                                    style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }}
                                />
                            ) : (
                                <Icon name="user-md" size={avatarSize * 0.55} color="#fff" />
                            )}
                        </View>

                        <Text style={[styles.name, { fontSize: fontScale(24) }]} numberOfLines={1}>
                            {name}
                        </Text>
                        {!!specialty && (
                            <Text style={[styles.specialty, { fontSize: fontScale(16) }]} numberOfLines={1}>
                                {specialty}
                            </Text>
                        )}
                    </LinearGradient>

                    {/* Info list */}
                    <View style={styles.body}>
                        <InfoRow
                            icon="building-o"
                            iconBg="#F0F0F0"
                            iconColor="#555"
                            label="Hospital Name"
                            value={hospitalName}
                            fontScale={fontScale}
                        />
                        <View style={styles.divider} />
                        <InfoRow
                            icon="phone"
                            iconBg="#FCE4E4"
                            iconColor="#E05C5C"
                            label="Contact Number"
                            value={contactNumber}
                            fontScale={fontScale}
                        />
                        <View style={styles.divider} />
                        <InfoRow
                            icon="home"
                            iconBg="#E3F3EA"
                            iconColor="#3E8E7E"
                            label="Doctor Address"
                            value={address}
                            fontScale={fontScale}
                        />
                        <View style={styles.divider} />
                        <InfoRow
                            icon="map-o"
                            iconBg="#E3F3EA"
                            iconColor="#3E8E7E"
                            label="Doctor State"
                            value={state}
                            fontScale={fontScale}
                        />
                        <View style={styles.divider} />
                        <InfoRow
                            icon="location-arrow"
                            iconBg="#EEE"
                            iconColor="#333"
                            label="Doctor City"
                            value={city}
                            fontScale={fontScale}
                        />
                    </View>
                </ScrollView>

                {/* Footer */}
                <View style={[styles.footer, { paddingBottom: Math.max(16, insets.bottom) }]}>
                    <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                        <Text style={styles.closeText}>CLOSE</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>

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
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
    },
    header: {
        alignItems: 'center',
        paddingBottom: 28,
        paddingHorizontal: 20,
    },
    editBtn: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 54 : 18,
        right: 18,
        backgroundColor: '#fff',
        width: 42,
        height: 42,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    avatarWrap: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 16,
        overflow: 'hidden',
    },
    name: {
        color: '#fff',
        fontWeight: '700',
        fontFamily: fonts.POPPINS_REGULAR,
        textAlign: 'center',
    },
    specialty: {
        color: 'rgba(255,255,255,0.85)',
        marginTop: 4,
        textAlign: 'center',
    },
    body: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        gap: 14,
    },
    infoIconWrap: {
        width: 48,
        height: 48,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoTextWrap: { flex: 1 },
    infoLabel: { color: '#999', marginBottom: 2 },
    infoValue: { color: '#1a1a1a', fontWeight: '600' },
    divider: { height: 1, backgroundColor: '#F0F0F0' },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    closeBtn: {
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
        backgroundColor: '#F3F5F7',
        width: '100%',
        alignItems: 'center',
    },
    closeText: { fontSize: 14, fontWeight: '700', color: '#333', letterSpacing: 0.5 },
});

export default DoctorProfileModal;