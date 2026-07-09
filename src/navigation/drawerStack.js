// import { createDrawerNavigator } from '@react-navigation/drawer';
// import { Dimensions, View, Text } from "react-native";
// import { Tabs } from "./tabs";
// //
// import { DrawerOption } from './drawerOption';
// //
// const Drawer = createDrawerNavigator();
// //
// const DrawerStack = () => {
//     return (
//         <Drawer.Navigator
//             headerMode="none"
//             initialRouteName="Tabs"
//             openByDefault={false}
//             screenOptions={{
//                 drawerType: 'front',
//                 headerShown: false,
//                 gestureEnabled: true,
//                 swipeEnabled: true,
//                 drawerPosition: 'left',
//                 drawerStyle: {
//                     overlayColor: "rgba(0 ,0 ,0, 0.5)",
//                     width: Dimensions.get('window').width / 3,
//                     backgroundColor: '#3C94FF'
//                 },
//             }}
//             drawerContent={() => <View style={{flex:1,backgroundColor:"pink"}}/>}
//         >
//             <Drawer.Screen name="Tabs" component={Tabs} />
//         </Drawer.Navigator>
//     )
// }

// export { DrawerStack };

import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useWindowDimensions } from "react-native";
import { Tabs } from "./tabs";
import { DrawerOption } from './drawerOption';
import colors from "../assets/appColor/colors";
//
const Drawer = createDrawerNavigator();
//
const DrawerStack = () => {
    const { width } = useWindowDimensions(); // reacts to rotation & split-screen
    const isTabletWidth = width >= 600;

    return (
        <Drawer.Navigator
            initialRouteName="Tabs"
            drawerContent={(props) => <DrawerOption {...props} />}
            screenOptions={{
                headerShown: false,
                gestureEnabled: true,
                // Pinned sidebar on tablet/iPad, standard swipe-in overlay on phone
                //drawerType: isTabletWidth ? 'permanent' : 'front',
                swipeEnabled: true,
                drawerPosition: 'left',
                //overlayColor: 'red',
                drawerStyle: {
                    width: isTabletWidth ? 320 : width * 0.7,
                },
                // Explicit background so the scene content never falls through
                // to the native root view (that was the source of your black screen)
                sceneContainerStyle: {
                    backgroundColor: colors.WHITE_COLOR,
                },
            }}
        >
            <Drawer.Screen name="Tabs" component={Tabs} />
        </Drawer.Navigator>
    );
};

export { DrawerStack };