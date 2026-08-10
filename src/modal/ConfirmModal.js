import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Pressable,
    useWindowDimensions,
} from 'react-native';
import colors from '../assets/appColor/colors';
import fonts from '../assets/fonts/fonts';

/**
 * Generic confirmation modal (Delete!, Are you sure?, etc).
 *
 * Everything is driven by route.params, so this one screen can be reused
 * anywhere you need a Yes/Cancel confirmation:
 *
 *   navigation.navigate('ConfirmModal', {
 *       title: 'Delete!',
 *       itemName: item.name,                 // bolded inside the message
 *       // OR pass a fully custom message instead of itemName:
 *       // message: 'This will remove all associated products.',
 *       confirmText: 'Yes',                  // default 'Yes'
 *       cancelText: 'Cancel',                // default 'Cancel'
 *       confirmColor: colors.DANGER,         // default colors.ICON_COLOR_PRIMARY
 *       onConfirm: () => handleDelete(item.id),
 *       onCancel: () => {},                  // optional
 *   });
 *
 * Register it in your navigator as a transparent modal screen, e.g.:
 *   <Stack.Screen
 *       name="ConfirmModal"
 *       component={ConfirmModal}
 *       options={{ headerShown: false, presentation: 'transparentModal' }}
 *   />
 */
const ConfirmModal = ({ navigation, route }) => {
    const {
        title = 'Delete!',
        itemName,
        message,                 // custom message; overrides the itemName template below
        messageTemplate = 'Are you sure to delete {item} ?',
        confirmText = 'Yes',
        cancelText = 'Cancel',
        confirmColor = colors.ICON_COLOR_PRIMARY,
        onConfirm,
        onCancel,
    } = route.params ?? {};

    const { width } = useWindowDimensions();
    const cardWidth = Math.min(340, width - 64);

    const close = () => navigation.goBack();

    const handleCancel = () => {
        onCancel && onCancel();
        close();
    };

    const handleConfirm = () => {
        onConfirm && onConfirm();
        close();
    };

    // Renders "Are you sure to delete <bold>ggggg</bold> ?" when itemName is
    // given, or falls back to a plain custom message / template as-is.
    const renderMessage = () => {
        if (message) {
            return <Text style={styles.message}>{message}</Text>;
        }
        if (itemName && messageTemplate.includes('{item}')) {
            const [before, after] = messageTemplate.split('{item}');
            return (
                <Text style={styles.message}>
                    {before}
                    <Text style={styles.messageBold}>{itemName}</Text>
                    {after}
                </Text>
            );
        }
        return <Text style={styles.message}>{messageTemplate}</Text>;
    };

    return (
        <Modal
            transparent
            animationType="fade"
            onRequestClose={handleCancel}
            statusBarTranslucent
        >
            <Pressable style={styles.backdrop} onPress={handleCancel}>
                {/* Stop taps on the card itself from bubbling to the backdrop */}
                <Pressable style={[styles.card, { width: cardWidth }]} onPress={() => {}}>
                    <View style={styles.body}>
                        <Text style={styles.title}>{title}</Text>
                        {renderMessage()}
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.actionBtn} onPress={handleCancel}>
                            <Text style={styles.cancelText}>{cancelText}</Text>
                        </TouchableOpacity>
                        <View style={styles.actionsDivider} />
                        <TouchableOpacity style={styles.actionBtn} onPress={handleConfirm}>
                            <Text style={[styles.confirmText, { color: confirmColor }]}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
    },
    body: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        fontFamily: fonts.POPPINS_MEDIUM ?? fonts.POPPINS_REGULAR,
        color: '#1a1a1a',
        marginBottom: 14,
    },
    message: {
        fontSize: 15,
        color: '#333',
        fontFamily: fonts.POPPINS_REGULAR,
        textAlign: 'center',
        lineHeight: 21,
    },
    messageBold: {
        fontWeight: '700',
        fontFamily: fonts.POPPINS_MEDIUM ?? fonts.POPPINS_REGULAR,
        color: '#1a1a1a',
    },
    actions: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    actionBtn: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionsDivider: {
        width: 1,
        backgroundColor: '#eee',
    },
    cancelText: {
        fontSize: 15,
        fontFamily: fonts.POPPINS_MEDIUM ?? fonts.POPPINS_REGULAR,
        color: colors.ICON_COLOR_PRIMARY,
    },
    confirmText: {
        fontSize: 15,
        fontWeight: '700',
        fontFamily: fonts.POPPINS_MEDIUM ?? fonts.POPPINS_REGULAR,
    },
});

export default ConfirmModal;