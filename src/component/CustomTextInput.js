import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';

/**
 * Wraps react-native-paper's TextInput so icons are opt-in.
 *
 * - Pass `leftIcon` / `rightIcon` (icon name strings) only when you want
 *   that side to render. Omit either one and that slot simply isn't shown
 *   — no empty icon box, no extra padding reserved for it.
 * - `rightIcon` + `onRightIconPress` together make the right icon
 *   pressable (e.g. a password show/hide toggle). If you only pass
 *   `rightIcon` with no handler, it renders as a static (non-pressable)
 *   icon — useful for things like a "verified" checkmark.
 * - `errorText` renders inline under the field only when there's a
 *   message to show, so callers don't need their own conditional block.
 */
const CustomTextInput = ({
    leftIcon,
    rightIcon,
    onLeftIconPress,
    onRightIconPress,
    error,
    errorText,
    style,
    inputStyle,
    ...rest
}) => {
    return (
        <View style={[styles.wrapper, style]}>
            <TextInput
                mode="outlined"
                error={!!error}
                style={[styles.input, inputStyle]}
                left={
                    leftIcon ? (
                        <TextInput.Icon icon={leftIcon} onPress={onLeftIconPress} />
                    ) : undefined
                }
                right={
                    rightIcon ? (
                        <TextInput.Icon icon={rightIcon} onPress={onRightIconPress} />
                    ) : undefined
                }
                {...rest}
            />
            {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        marginBottom: 8,
    },
    input: {
        width: '100%',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
});

export default CustomTextInput;