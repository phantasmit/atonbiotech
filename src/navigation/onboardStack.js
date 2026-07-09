import { createNativeStackNavigator } from "@react-navigation/native-stack";
//
import { LoginComponent } from '../screens/login/loginComponent';
import { SplashComponent } from '../screens/splash/splashComponent';

const Stack = createNativeStackNavigator();
//
const OnBoardStack = () => {
    return (
        <Stack.Navigator
            hideNavbar={true}
            initialRouteName="Splash"
            screenOptions={{
                headerShown: false,
                gestureEnabled: false,
                cardStyle: { backgroundColor: 'transparent' },
                cardOverlayEnabled: true,
            }}
        >
            <Stack.Group>
                <Stack.Screen name="Splash" component={SplashComponent} />
                <Stack.Screen name="Login" component={LoginComponent} />
            </Stack.Group>
        </Stack.Navigator>
    )
}
//
export { OnBoardStack };