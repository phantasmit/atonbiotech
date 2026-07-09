// import React from 'react';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { Text, useWindowDimensions, Platform } from "react-native";
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import colors from '../assets/appColor/colors';
// import Icon from 'react-native-vector-icons/FontAwesome';
// //
// import { TodayComponent } from '../screens/today/todayComponent';
// import { TomorrowComponent } from '../screens/tomorrow/tomorrowComponent';

// //
// const Tab = createBottomTabNavigator();

// const Tabs = () => {
//     const insets = useSafeAreaInsets();
//     const { width } = useWindowDimensions();
//     const isTabletWidth = width >= 600;

//     const iconSize = isTabletWidth ? 22 : 20;
//     const labelSize = isTabletWidth ? 11 : 10;
//     const barHeight = (isTabletWidth ? 50 : 56) + insets.bottom;

//     return (
//         <Tab.Navigator
//             screenOptions={{
//                 headerShown: false,
//                 gestureEnabled: false,
//                 tabBarShowLabel: true,
//                 tabBarStyle: {
//                     backgroundColor: colors.WHITE_COLOR,
//                     height: barHeight,
//                     paddingTop: 6,
//                     paddingBottom: insets.bottom || 6,
//                     // Cap width on large tablets so tabs don't stretch edge-to-edge with huge gaps
//                     maxWidth: isTabletWidth ? 600 : '100%',
//                     alignSelf: 'center',
//                     width: '100%',
//                     shadowColor: '#000',
//                     shadowOffset: { width: 0, height: -2 },
//                     shadowOpacity: 0.08,
//                     shadowRadius: 4,
//                     elevation: 5,
//                     borderTopWidth: 0,
//                 },
//                 tabBarActiveTintColor: colors.ICON_COLOR_PRIMARY,
//                 tabBarInactiveTintColor: colors.ICON_COLOR_MEDIUM_SHADE,
//                 tabBarLabelPosition: 'below-icon',
//                 tabBarPosition: 'bottom',
//             }}
//         >
//             <Tab.Screen
//                 name="Today"
//                 component={TodayComponent}
//                 options={{
//                     tabBarIcon: ({ color }) => (<Icon name="calendar" size={iconSize} color={color} />),
//                     tabBarLabel: ({ color }) => (
//                         <Text numberOfLines={1} style={{ color, fontSize: labelSize }}>Today</Text>
//                     ),
//                 }}
//             />
//             <Tab.Screen
//                 name="Tomorrow"
//                 component={TomorrowComponent}
//                 options={{
//                     tabBarIcon: ({ color }) => (<Icon name="calendar-o" size={iconSize} color={color} />),
//                     tabBarLabel: ({ color }) => (
//                         <Text numberOfLines={1} style={{ color, fontSize: labelSize }}>Tomorrow</Text>
//                     ),
//                 }}
//             />
//             {/* <Tab.Screen
//                 name="AllAppointment"
//                 component={TodayComponent}
//                 options={{
//                     tabBarIcon: ({ color }) => (<Icon name="calendar-check-o" size={iconSize} color={color} />),
//                     tabBarLabel: ({ color }) => (
//                         <Text numberOfLines={1} style={{ color, fontSize: labelSize }}>All Appointments</Text>
//                     ),
//                 }}
//             /> */}
//         </Tab.Navigator>
//     )
// }
// //
// export { Tabs };

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../assets/appColor/colors';
import Icon from 'react-native-vector-icons/FontAwesome';
//
import { TodayComponent } from '../screens/today/todayComponent';
import { TomorrowComponent } from '../screens/tomorrow/tomorrowComponent';
import { AllAppointmentComponent } from '../screens/allAppointment/allAppointmentComponent';
//
const Tab = createBottomTabNavigator();

const Tabs = () => {
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const isTabletWidth = width >= 600;

    const iconSize = isTabletWidth ? 24 : 20;
    const labelSize = isTabletWidth ? 12 : 10;
    const barHeight = (isTabletWidth ? 56 : 60) + insets.bottom;

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                gestureEnabled: false,
                tabBarShowLabel: true,
                tabBarStyle: {
                    backgroundColor: colors.WHITE_COLOR,
                    height: barHeight,
                    paddingTop: 6,
                    paddingBottom: insets.bottom || 6,
                    maxWidth: isTabletWidth ? 600 : '100%',
                    alignSelf: 'center',
                    width: '100%',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                    elevation: 5,
                    borderTopWidth: 0,
                },
                tabBarActiveTintColor: colors.ICON_COLOR_PRIMARY,
                tabBarInactiveTintColor: colors.ICON_COLOR_MEDIUM_SHADE,
                tabBarLabelPosition: 'below-icon',
                tabBarPosition: 'bottom',
            }}
        >
            <Tab.Screen
                name="Today"
                component={TodayComponent}
                options={{
                    tabBarIcon: ({ color }) => (<Icon name="calendar" size={iconSize} color={color} />),
                    tabBarLabel: ({ color }) => (
                        <Text numberOfLines={1} style={{ color, fontSize: labelSize }}>Today</Text>
                    ),
                }}
            />
            <Tab.Screen
                name="Tomorrow"
                component={TomorrowComponent}
                options={{
                    tabBarIcon: ({ color }) => (<Icon name="calendar-o" size={iconSize} color={color} />),
                    tabBarLabel: ({ color }) => (
                        <Text numberOfLines={1} style={{ color, fontSize: labelSize }}>Tomorrow</Text>
                    ),
                }}
            />
            <Tab.Screen
                name="AllAppointment"
                component={AllAppointmentComponent}
                options={{
                    tabBarIcon: ({ color }) => (<Icon name="calendar-o" size={iconSize} color={color} />),
                    tabBarLabel: ({ color }) => (
                        <Text numberOfLines={1} style={{ color, fontSize: labelSize }}>All Appointment</Text>
                    ),
                }}
            />
        </Tab.Navigator>
    );
};
//
export { Tabs };