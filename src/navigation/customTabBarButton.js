// import React from 'react';
// import { TouchableOpacity, StyleSheet, Text, useWindowDimensions } from 'react-native';
// import colors from '../assets/appColor/colors';
// import fonts from '../assets/fonts/fonts';
// import { normalize } from '../utils/normalize';
// import Icon from 'react-native-vector-icons/FontAwesome';

// const tabsData = [
//     { title: 'Today', icon: 'calendar' },
//     { title: 'Tomorrow', icon: 'calendar-o' },
//     { title: 'All Appointments', icon: 'calendar-check-o' },
// ];

// const CustomTabBarButton = (props) => {
//     const { accessibilityState, onPress, position = -1 } = props;
//     const focused = accessibilityState?.selected;
//     const { width } = useWindowDimensions();
//     const isTabletWidth = width >= 600;

//     const tab = tabsData[position];
//     if (!tab) return null; // guard against bad/missing position prop

//     const iconSize = isTabletWidth ? normalize(20) : normalize(18);
//     const labelSize = isTabletWidth ? normalize(11) : normalize(10);
//     const color = focused ? colors.ICON_COLOR_PRIMARY : colors.ICON_COLOR_MEDIUM_SHADE;

//     return (
//         <TouchableOpacity
//             onPress={onPress}
//             style={styles.button}
//             activeOpacity={0.7}
//             accessibilityRole="button"
//             accessibilityState={{ selected: focused }}
//         >
//             <Icon name={tab.icon} size={iconSize} color={color} />
//             <Text
//                 numberOfLines={1}
//                 style={{
//                     fontSize: labelSize,
//                     color,
//                     fontWeight: focused ? '600' : '500',
//                     fontFamily: fonts.POPPINS_REGULAR,
//                     marginTop: normalize(2),
//                 }}
//             >
//                 {tab.title}
//             </Text>
//         </TouchableOpacity>
//     );
// };

// export default CustomTabBarButton;

// const styles = StyleSheet.create({
//     button: {
//         flex: 1,
//         height: '100%',
//         justifyContent: 'center',
//         alignItems: 'center',
//         paddingHorizontal: normalize(4),
//     },
// });

import React from 'react';
import { TouchableOpacity, StyleSheet, Text, useWindowDimensions } from 'react-native';
import colors from '../assets/appColor/colors';
import fonts from '../assets/fonts/fonts';
import Icon from 'react-native-vector-icons/FontAwesome';

const tabsData = [
    { title: 'Today', icon: 'calendar' },
    { title: 'Tomorrow', icon: 'calendar-o' },
    { title: 'All Appointments', icon: 'calendar-check-o' },
];

const CustomTabBarButton = (props) => {
    const { accessibilityState, onPress, position = -1 } = props;
    const focused = accessibilityState?.selected;
    const { width } = useWindowDimensions();
    const isTabletWidth = width >= 600;

    const tab = tabsData[position];
    if (!tab) return null;

    const iconSize = isTabletWidth ? 24 : 20;
    const labelSize = isTabletWidth ? 12 : 10;
    const color = focused ? colors.ICON_COLOR_PRIMARY : colors.ICON_COLOR_MEDIUM_SHADE;

    return (
        <TouchableOpacity
            onPress={onPress}
            style={styles.button}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
        >
            <Icon name={tab.icon} size={iconSize} color={color} />
            <Text
                numberOfLines={1}
                style={{
                    fontSize: labelSize,
                    color,
                    fontWeight: focused ? '600' : '500',
                    fontFamily: fonts.POPPINS_REGULAR,
                    marginTop: 2,
                }}
            >
                {tab.title}
            </Text>
        </TouchableOpacity>
    );
};

export default CustomTabBarButton;

const styles = StyleSheet.create({
    button: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
});