import { createNativeStackNavigator } from "@react-navigation/native-stack";
//
import { LoginComponent } from '../screens/login/loginComponent';
import { SplashComponent } from '../screens/splash/splashComponent';
import { RegistrationComponent } from '../screens/registration/registrationComponent';
import { ForgotPasswordComponent } from '../screens/forgotPassword/forgotPasswordComponent';
import { OtpVerificationScreen } from '../screens/forgotPassword/Otpverificationscreen';
import { ResetPassword } from '../screens/forgotPassword/ResetPassword';

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
                <Stack.Screen name="Register" component={RegistrationComponent} />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordComponent} />
                <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
                <Stack.Screen name="ResetPassword" component={ResetPassword} />

            </Stack.Group>
        </Stack.Navigator>
    )
}
//
export { OnBoardStack };