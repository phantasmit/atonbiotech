import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DrawerStack } from "./drawerStack";
import { TodayComponent } from "../screens/today/todayComponent";
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Tabs } from "./tabs";
import { DrawerOption } from './drawerOption';
import { Dimensions, View, Text } from "react-native";
//
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

//
const AppStack = () => {
    return (
        // <Drawer.Navigator
        //     headerMode="none"
        //     //initialRouteName="Tabs"
        //     openByDefault={false}
        //     screenOptions={{
        //         drawerType: 'front',
        //         headerShown: false,
        //         gestureEnabled: true,
        //         swipeEnabled: true,
        //         drawerPosition: 'left',
        //         drawerStyle: {
        //             overlayColor: "rgba(0 ,0 ,0, 0.5)",
        //             width: Dimensions.get('window').width / 3,
        //             backgroundColor: '#3C94FF'
        //         },
        //     }}
        //   //
        // >

        //     <Drawer.Screen name="Tabs" component={() => {
        //         return (
        //             <Stack.Navigator
        //                 screenOptions={{
        //                     headerShown: false,
        //                     cardStyle: { backgroundColor: '#fff' },
        //                 }}
        //             >
        //                 <Stack.Screen name="TabsRoot" component={Tabs} />

        //             </Stack.Navigator>
        //         )
        //     }} />


        // </Drawer.Navigator>
        <Stack.Navigator
            hideNavbar={true}
            initialRouteName="drawer"
            screenOptions={{
                headerShown: false,
                gestureEnabled: false,
                cardStyle: { backgroundColor: 'transparent' },
                cardOverlayEnabled: true,
            }}
        >
            <Stack.Group
                screenOptions={{
                    headerShown: false,
                    gestureEnable: true,
                }}
            >
                <Stack.Screen name="drawer" component={DrawerStack} />
            </Stack.Group>
        </Stack.Navigator>
    )
}

export { AppStack };