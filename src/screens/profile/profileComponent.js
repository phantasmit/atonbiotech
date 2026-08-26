import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    useWindowDimensions,
    Platform,
    ScrollView,
    ImageBackground,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import colors from '../../assets/appColor/colors';
import fonts from '../../assets/fonts/fonts';
import { background } from '../../utils/images';
import LinearGradient from 'react-native-linear-gradient';
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

const InfoCard = ({ icon, iconColor, label, value, fontScale }) => (
    <View style={styles.infoCard}>
        <Icon name={icon} size={22} color={iconColor} style={styles.infoIcon} />
        <View style={styles.infoTextWrap}>
            <Text style={[styles.infoLabel, { fontSize: fontScale(13) }]}>{label}</Text>
            <Text style={[styles.infoValue, { fontSize: fontScale(17) }]} numberOfLines={2}>
                {value || '—'}
            </Text>
        </View>
    </View>
);

/**
 * My Profile screen.
 *
 * navigation.navigate('MyProfile', {
 *   profile: {
 *     name: 'Sumit',
 *     email: 'sumit.satva@gmail.com',
 *     avatarUrl: 'https://...',
 *     username: 'Jhon',
 *     mobileNumber: '9377327530',
 *     address: 'Varanas New, Lankaa - U.P',
 *   }
 * })
 */
const MyProfileScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const { profile = {} } = route.params ?? {};
    const {
        name = '',
        email = '',
        avatarUrl = null,
        username = '',
        mobileNumber = '',
        address = '',
    } = profile;

    const breakpoint = getBreakpoint(width);
    const fontScale = (size) => scale(width, size);

    const cardWidth = (() => {
        if (breakpoint === 'largeTablet') return Math.min(560, width * 0.42);
        if (breakpoint === 'tablet') return Math.min(500, width * 0.55);
        return width - 40; // phone: near full width, small margins
    })();

    const avatarSize = breakpoint === 'phone' ? 96 : 120;

    const handleEdit = () => navigation.navigate('EditProfile', { profile });

    return (
        <View style={styles.screen}>
            {/* Header bar */}
            {/* <View style={[styles.headerBar, { paddingTop: Math.max(12, insets.top), backgroundColor: "#f3f6fb" }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    style={styles.backBtn}
                >
                    <Icon name="arrow-left" size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { fontSize: fontScale(20) }]}>My Profile</Text>
                <View style={{ width: 32 }} />
            </View> */}

            {/* Patterned background body */}
            {/* <ImageBackground
                //source={un} // swap with your actual bg asset
                resizeMode="repeat"
                style={styles.bgBody}
            > */}
            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: Math.max(24, insets.bottom) },
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.card, { width: cardWidth }]}>
                    {/* Edit icon */}
                    <TouchableOpacity
                        style={styles.editBtn}
                        onPress={handleEdit}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Icon name="pencil-square-o" size={18} color="#fff" />
                    </TouchableOpacity>

                    {/* Avatar overlaps header/body boundary */}
                    <View style={[styles.avatarWrap, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}>
                        {avatarUrl ? (
                            <Image
                                source={{ uri: avatarUrl }}
                                style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }}
                            />
                        ) : (
                            <Icon name="user" size={avatarSize * 0.5} color="#fff" />
                        )}
                    </View>

                    <Text style={[styles.name, { fontSize: fontScale(24) }]} numberOfLines={1}>
                        {name}
                    </Text>
                    <Text style={[styles.email, { fontSize: fontScale(15) }]} numberOfLines={1}>
                        {email}
                    </Text>

                    {/* Info rows */}
                    <View style={styles.infoList}>
                        <InfoCard
                            icon="user-o"
                            iconColor={colors.ICON_COLOR_PRIMARY || '#3E8E7E'}
                            label="Username"
                            value={username}
                            fontScale={fontScale}
                        />
                        <InfoCard
                            icon="phone"
                            iconColor={colors.ICON_COLOR_PRIMARY || '#3E8E7E'}
                            label="Mobile Number"
                            value={mobileNumber}
                            fontScale={fontScale}
                        />
                        <InfoCard
                            icon="home"
                            iconColor="#E8A33D"
                            label="Address"
                            value={address}
                            fontScale={fontScale}
                        />
                    </View>
                </View>
            </ScrollView>
            {/* </ImageBackground> */}
        </View>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.ICON_COLOR_PRIMARY || '#3E8E7E' },
    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingBottom: 14,
        backgroundColor: colors.ICON_COLOR_PRIMARY || '#1E8E6E',
    },
    backBtn: { padding: 8 },
    headerTitle: { flex: 1, color: '#fff', fontWeight: '700', fontFamily: fonts.POPPINS_REGULAR, marginLeft: 4 },

    bgBody: { flex: 1 },
    scrollContent: {
        alignItems: 'center',
        paddingTop: 32,
        paddingHorizontal: 16,
        flexGrow: 1,
    },

    card: {
        backgroundColor: 'rgba(255,255,255,0.06)', // subtle so pattern shows through where transparent
        borderRadius: 18,
        overflow: 'hidden',
    },
    editBtn: {
        position: 'absolute',
        top: 14,
        right: 14,
        zIndex: 2,
        padding: 6,
    },
    avatarWrap: {
        alignSelf: 'center',
        marginTop: 28,
        marginBottom: 14,
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.7)',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    name: {
        textAlign: 'center',
        color: '#1a1a1a',
        fontWeight: '700',
        fontFamily: fonts.POPPINS_REGULAR,
    },
    email: {
        textAlign: 'center',
        color: '#333',
        marginTop: 4,
        marginBottom: 20,
    },

    infoList: { paddingHorizontal: 18, paddingBottom: 20, gap: 14 },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 14,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    infoIcon: { width: 24, textAlign: 'center' },
    infoTextWrap: { flex: 1 },
    infoLabel: { color: '#999', marginBottom: 2 },
    infoValue: { color: '#1a1a1a', fontWeight: '600' },
});

export default MyProfileScreen;