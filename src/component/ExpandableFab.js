// import React, { useRef, useState } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, useWindowDimensions } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import Icon from 'react-native-vector-icons/FontAwesome';

// /**
//  * Reusable expandable floating action button (speed-dial pattern).
//  * Responsive across phone / tablet / iPad, safe-area aware.
//  * Labels always render on a single line (auto-shrinks font slightly if tight,
//  * never wraps, never truncates with ellipsis).
//  */
// const ExpandableFab = ({ actions = [], mainColor = '#268872', bottom, right }) => {
//     const [open, setOpen] = useState(false);
//     const animation = useRef(new Animated.Value(0)).current;
//     const { width } = useWindowDimensions();
//     const insets = useSafeAreaInsets();
//     const isTabletWidth = width >= 600;

//     const mainSize = isTabletWidth ? 64 : 56;
//     const actionSize = isTabletWidth ? 56 : 48;
//     const mainIconSize = isTabletWidth ? 26 : 22;
//     const actionIconSize = isTabletWidth ? 22 : 20;
//     // Enough vertical gap for a single-line bubble (~40-44pt tall) plus clearance
//     const spacing = isTabletWidth ? 82 : 70;
//     const labelFontSize = isTabletWidth ? 14 : 13;

//     const resolvedBottom = bottom ?? (insets.bottom || (isTabletWidth ? 24 : 16)) + (isTabletWidth ? 20 : 12);
//     const resolvedRight = right ?? (insets.right + (isTabletWidth ? 32 : 20));
//     const resolvedLeft = insets.left + 16;

//     // Generous cap so normal labels always fit on one line; only extremely
//     // long labels would ever trigger the font auto-shrink fallback below.
//     const maxRowWidth = width - resolvedRight - resolvedLeft;
//     const maxLabelWidth = Math.max(120, maxRowWidth - actionSize - 12 - 28);

//     const toggle = () => {
//         const toValue = open ? 0 : 1;
//         Animated.timing(animation, {
//             toValue,
//             duration: 220,
//             easing: Easing.out(Easing.cubic),
//             useNativeDriver: true,
//         }).start();
//         setOpen(!open);
//     };

//     const handleActionPress = (action) => {
//         toggle();
//         action.onPress?.();
//     };

//     const rotation = animation.interpolate({
//         inputRange: [0, 1],
//         outputRange: ['0deg', '135deg'],
//     });

//     return (
//         <View
//             pointerEvents="box-none"
//             style={[styles.container, { bottom: resolvedBottom, right: resolvedRight }]}
//         >
//             {open && (
//                 <TouchableOpacity
//                     style={StyleSheet.absoluteFillObject}
//                     activeOpacity={1}
//                     onPress={toggle}
//                 />
//             )}

//             {actions.map((action, index) => {
//                 const distance = (index + 1) * spacing;
//                 const translateY = animation.interpolate({
//                     inputRange: [0, 1],
//                     outputRange: [0, -distance],
//                 });
//                 const opacity = animation.interpolate({
//                     inputRange: [0, 0.5, 1],
//                     outputRange: [0, 0, 1],
//                 });
//                 const scale = animation.interpolate({
//                     inputRange: [0, 1],
//                     outputRange: [0.6, 1],
//                 });

//                 return (
//                     <Animated.View
//                         key={action.label}
//                         pointerEvents={open ? 'auto' : 'none'}
//                         style={[
//                             styles.actionRow,
//                             { transform: [{ translateY }, { scale }], opacity },
//                         ]}
//                     >
//                         <View style={[styles.labelBubble, { maxWidth: maxLabelWidth }]}>
//                             <Text
//                                 style={[styles.labelText, { fontSize: labelFontSize }]}
//                                 numberOfLines={1}
//                             //adjustsFontSizeToFit
//                             //minimumFontScale={0.8}
//                             >
//                                 {action.label}
//                             </Text>
//                         </View>
//                         <TouchableOpacity
//                             style={[
//                                 styles.actionBtn,
//                                 {
//                                     width: actionSize,
//                                     height: actionSize,
//                                     borderRadius: actionSize / 2,
//                                     backgroundColor: action.color || mainColor,
//                                 },
//                             ]}
//                             activeOpacity={0.85}
//                             onPress={() => handleActionPress(action)}
//                         >
//                             <Icon name={action.icon || 'plus'} size={actionIconSize} color="#fff" />
//                         </TouchableOpacity>
//                     </Animated.View>
//                 );
//             })}

//             <TouchableOpacity
//                 style={[
//                     styles.mainBtn,
//                     {
//                         width: mainSize,
//                         height: mainSize,
//                         borderRadius: mainSize / 2,
//                         backgroundColor: mainColor,
//                     },
//                 ]}
//                 activeOpacity={0.85}
//                 onPress={toggle}
//             >
//                 <Animated.View style={{ transform: [{ rotate: rotation }] }}>
//                     <Icon name="plus" size={mainIconSize} color="#fff" />
//                 </Animated.View>
//             </TouchableOpacity>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         position: 'absolute',
//         alignItems: 'flex-end',
//         zIndex: 50,
//     },
//     mainBtn: {
//         alignItems: 'center',
//         justifyContent: 'center',
//         elevation: 6,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.25,
//         shadowRadius: 4,
//     },
//     actionRow: {
//         position: 'absolute',
//         bottom: 0,
//         right: 0,
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     actionBtn: {
//         alignItems: 'center',
//         justifyContent: 'center',
//         elevation: 5,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.2,
//         shadowRadius: 3,
//     },
//     labelBubble: {
//         backgroundColor: '#EFEFEF',
//         width: 140,
//         paddingHorizontal: 14,
//         paddingVertical: 10,
//         borderRadius: 8,
//         marginRight: 12,
//         elevation: 2,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.15,
//         shadowRadius: 2,
//         alignSelf: 'center',
//     },
//     labelText: {
//         textAlign: "right",
//         fontWeight: '600',
//         color: '#333',
//     },
// });

// export default ExpandableFab;

import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

/**
 * Reusable expandable floating action button (speed-dial pattern).
 * Responsive across phone / tablet / iPad, safe-area aware.
 * Labels always render on a single line (auto-shrinks font slightly if tight,
 * never wraps, never truncates with ellipsis).
 */
const ExpandableFab = ({ actions = [], mainColor = '#268872', bottom, right, topOffset = 0 }) => {
    const [open, setOpen] = useState(false);
    const animation = useRef(new Animated.Value(0)).current;
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    // Use the SHORTER side to classify device size so a phone in landscape
    // (wide but short) isn't mistaken for a tablet. This is the standard
    // approach — a device's "tablet-ness" doesn't change on rotation.
    const shortestSide = Math.min(width, height);
    const isTabletWidth = shortestSide >= 600;

    // Base (ideal) sizes — same numbers as before, used as an upper bound.
    const baseMainSize = isTabletWidth ? 64 : 56;
    const baseActionSize = isTabletWidth ? 56 : 48;
    const baseMainIconSize = isTabletWidth ? 26 : 22;
    const baseActionIconSize = isTabletWidth ? 22 : 20;
    const baseSpacing = isTabletWidth ? 82 : 70;
    const baseLabelFontSize = isTabletWidth ? 14 : 13;

    const resolvedBottom = bottom ?? (insets.bottom || (isTabletWidth ? 24 : 16)) + (isTabletWidth ? 20 : 12);
    const resolvedRight = right ?? (insets.right + (isTabletWidth ? 32 : 20));
    const resolvedLeft = insets.left + 16;

    // Vertical room actually available above the main button, up to the
    // safe area top (plus any reserved header height passed via topOffset).
    const topLimit = insets.top + topOffset + 12;
    const availableHeight = Math.max(0, height - resolvedBottom - baseMainSize - topLimit);

    // How much height the full-size stack would need.
    const idealStackHeight = actions.length * baseSpacing;

    // Shrink everything proportionally if it doesn't fit — floor at 0.55x
    // so buttons never get unreasonably tiny/untappable.
    const shrinkFactor =
        actions.length > 0 && idealStackHeight > availableHeight && availableHeight > 0
            ? Math.max(0.55, availableHeight / idealStackHeight)
            : 1;

    const MIN_TOUCH = 40; // minimum comfortable tap target
    const mainSize = Math.max(MIN_TOUCH + 8, Math.round(baseMainSize * shrinkFactor));
    const actionSize = Math.max(MIN_TOUCH, Math.round(baseActionSize * shrinkFactor));
    const mainIconSize = Math.max(16, Math.round(baseMainIconSize * shrinkFactor));
    const actionIconSize = Math.max(14, Math.round(baseActionIconSize * shrinkFactor));
    const labelFontSize = Math.max(11, Math.round(baseLabelFontSize * Math.max(shrinkFactor, 0.85)));
    // Spacing must still clear the (possibly shrunk) action button + gap.
    const spacing = Math.max(actionSize + 14, Math.round(baseSpacing * shrinkFactor));

    // Generous cap so normal labels always fit on one line; only extremely
    // long labels would ever trigger the font auto-shrink fallback below.
    const maxRowWidth = width - resolvedRight - resolvedLeft;
    const maxLabelWidth = Math.max(100, maxRowWidth - actionSize - 12 - 28);

    const toggle = () => {
        const toValue = open ? 0 : 1;
        Animated.timing(animation, {
            toValue,
            duration: 220,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
        setOpen(!open);
    };

    const handleActionPress = (action) => {
        toggle();
        action.onPress?.();
    };

    const rotation = animation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '135deg'],
    });

    return (
        <View
            pointerEvents="box-none"
            style={[styles.container, { bottom: resolvedBottom, right: resolvedRight }]}
        >
            {open && (
                <TouchableOpacity
                    style={StyleSheet.absoluteFillObject}
                    activeOpacity={1}
                    onPress={toggle}
                />
            )}

            {actions.map((action, index) => {
                const distance = (index + 1) * spacing;
                const translateY = animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -distance],
                });
                const opacity = animation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 0, 1],
                });
                const scale = animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, 1],
                });

                return (
                    <Animated.View
                        key={action.label}
                        pointerEvents={open ? 'auto' : 'none'}
                        style={[
                            styles.actionRow,
                            { transform: [{ translateY }, { scale }], opacity },
                        ]}
                    >
                        <View style={[styles.labelBubble, { maxWidth: maxLabelWidth }]}>
                            <Text
                                style={[styles.labelText, { fontSize: labelFontSize }]}
                                numberOfLines={1}
                            //adjustsFontSizeToFit
                            //minimumFontScale={0.8}
                            >
                                {action.label}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[
                                styles.actionBtn,
                                {
                                    width: actionSize,
                                    height: actionSize,
                                    borderRadius: actionSize / 2,
                                    backgroundColor: action.color || mainColor,
                                },
                            ]}
                            activeOpacity={0.85}
                            onPress={() => handleActionPress(action)}
                        >
                            <Icon name={action.icon || 'plus'} size={actionIconSize} color="#fff" />
                        </TouchableOpacity>
                    </Animated.View>
                );
            })}

            <TouchableOpacity
                style={[
                    styles.mainBtn,
                    {
                        width: mainSize,
                        height: mainSize,
                        borderRadius: mainSize / 2,
                        backgroundColor: mainColor,
                    },
                ]}
                activeOpacity={0.85}
                onPress={toggle}
            >
                <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                    <Icon name="plus" size={mainIconSize} color="#fff" />
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        alignItems: 'flex-end',
        zIndex: 50,
    },
    mainBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    actionRow: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    labelBubble: {
        backgroundColor: '#EFEFEF',
        width: 140,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 8,
        marginRight: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        alignSelf: 'center',
    },
    labelText: {
        textAlign: "right",
        fontWeight: '600',
        color: '#333',
    },
});

export default ExpandableFab;