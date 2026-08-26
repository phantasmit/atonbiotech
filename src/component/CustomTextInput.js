import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import GradientIconBadge from './GradientIconBadge';
import { background } from '../utils/images';

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
                        <TextInput.Icon
                            icon={() => (
                                <GradientIconBadge
                                    colors={['transparent', 'transparent']}
                                    iconName={leftIcon}
                                    iconColor="#6b7785"
                                    style={{
                                        width: 20,
                                        height: 20
                                    }}
                                    iconSize={18}
                                />
                            )}
                        />
                    ) : undefined
                }
                right={
                    rightIcon ? (
                        <TextInput.Icon
                            icon={() => (
                                <GradientIconBadge
                                    colors={['transparent', 'transparent']}
                                    iconName={rightIcon}
                                    iconColor="#6b7785"
                                    style={{
                                        width: 20,
                                        height: 20
                                    }}
                                    iconSize={18}
                                />
                            )}
                            onPress={onRightIconPress}
                        />
                    ) : undefined
                }
                {...rest}
            />
            {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
        </View>
    );
};
//<TextInput.Icon icon={leftIcon} onPress={onLeftIconPress} />
//<TextInput.Icon icon={rightIcon} onPress={onRightIconPress} />
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