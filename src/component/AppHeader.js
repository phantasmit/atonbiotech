import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Icon as PaperIcon } from 'react-native-paper';
import fonts from '../assets/fonts/fonts';
import { useSelector } from 'react-redux';
import { IMAGE_BASE_URL } from '../services/api-end-points';


/**
 * ----------------------------------------------------------------------
 * AppHeader
 *
 * Reusable top app bar — drop into any screen.
 *
 * Required:
 * - title: string
 *
 * Left side (defaults to a hamburger menu icon that opens the drawer):
 * - leftIconName: FontAwesome5 icon name (default: 'bars')
 * - onLeftPress: () => void
 * - showLeftIcon: boolean (default: true) — set false to hide entirely
 *
 * Right side (defaults to a profile avatar):
 * - rightType: 'avatar' | 'icon' | 'none' (default: 'avatar')
 * - avatarUri: string (image URL for avatar)
 * - rightIconName: FontAwesome5 icon name (used when rightType='icon')
 * - onRightPress: () => void
 *
 * Styling:
 * - backgroundColor: string (default: '#6B9FE4')
 * - titleColor: string (default: '#fff')
 * - style: extra style override for the header container
 *
 * ----------------------------------------------------------------------
 * Usage:
 *
 * <AppHeader
 *   title="Konsyl Pharmaceuticals"
 *   onLeftPress={openDrawer}
 *   avatarUri={profile_picture ? `${IMAGE_BASE_URL}/${profile_picture}` : undefined}
 *   onRightPress={() => navigation.navigate('myProfile')}
 * />
 * ----------------------------------------------------------------------
 */
export default function AppHeader({
    title,
    leftIconName = 'bars',
    onLeftPress,
    showLeftIcon = true,
    rightType = 'avatar',
    avatarUri,
    rightIconName = 'user',
    onRightPress,
    backgroundColor = '#6B9FE4',
    titleColor = '#fff',
    style,
}) {
    const { profile_picture } = useSelector((state) => state.auth.userData);
    return (
        <View style={[styles.header, { backgroundColor }, style]}>
            {showLeftIcon ? (
                <TouchableOpacity
                    onPress={onLeftPress}
                    hitSlop={{ top: 12, left: 12, right: 12, bottom: 12 }}
                >
                    <Icon name={leftIconName} size={20} color={titleColor} solid />
                </TouchableOpacity>
            ) : (
                <View style={styles.leftSpacer} />
            )}

            <Text
                style={[styles.headerTitle, { color: titleColor }]}
                numberOfLines={1}
            >
                {title}
            </Text>

            {rightType === 'avatar' && (
                <TouchableOpacity onPress={onRightPress}>
                    {profile_picture ? (
                        <Image source={{ uri: `${IMAGE_BASE_URL}/${profile_picture}` }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarFallback]}>
                            <PaperIcon source="account" size={20} />
                        </View>
                    )}
                </TouchableOpacity>
            )}

            {rightType === 'icon' && (
                <TouchableOpacity
                    onPress={onRightPress}
                    hitSlop={{ top: 12, left: 12, right: 12, bottom: 12 }}
                >
                    <Icon name={rightIconName} size={20} color={titleColor} solid />
                </TouchableOpacity>
            )}

            {rightType === 'none' && <View style={styles.rightSpacer} />}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 16,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        fontFamily: fonts.POPPINS_REGULAR,
    },
    avatar: {
        width: 34,
        height: 34,
        borderRadius: 17,
        borderWidth: 2,
        borderColor: '#3562a6',
    },
    avatarFallback: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.25)',
    },
    leftSpacer: {
        width: 20,
    },
    rightSpacer: {
        width: 34,
    },
});