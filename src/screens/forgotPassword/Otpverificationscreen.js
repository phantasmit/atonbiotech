// import React, { useMemo, useRef, useState, useEffect } from 'react';
// import {
//     View,
//     KeyboardAvoidingView,
//     Image,
//     Text,
//     ScrollView,
//     Platform,
//     useWindowDimensions,
//     TouchableOpacity,
//     TextInput
// } from "react-native";
// import LinearGradient from 'react-native-linear-gradient';
// import icon from '../../assets/images/icon.png';
// import { Button } from 'react-native-paper';
// import { useResponsiveLayout } from '../../component/Useresponsivelayout';
// import { request } from '../../services/services';
// // NOTE: assumed endpoint names — add these next to LOGIN_API in
// // api-end-points.js, e.g.:
// //   export const VERIFY_OTP_API = () => `${BASE_URL}/verify-otp`;
// //   export const RESEND_OTP_API = () => `${BASE_URL}/resend-otp`;
// // Rename these imports if your actual endpoints are named differently.
// import { VERIFY_OTP_API, RESEND_OTP_API } from "../../services/api-end-points";
// import { HTTP_METHODS } from "../../services/api-constants";
// import { makeAuthStyles } from './authStyles';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { showSuccessToast, showErrorToast } from '../../utils/Toastutils';
// import LottieView from 'lottie-react-native';

// // Flip this to 4 if your backend issues 4-digit codes instead of 6 —
// // everything else (boxes, focus handling, validation) adapts automatically.
// const OTP_LENGTH = 6;

// const RESEND_COOLDOWN_SECONDS = 900;

// const maskMobile = (mobile = '') => {
//     if (mobile.length < 4) return mobile;
//     return `${'*'.repeat(mobile.length - 4)}${mobile.slice(-4)}`;
// };

// const OtpVerificationScreen = () => {

//     const navigation = useNavigation();
//     const route = useRoute();
//     const { mobile = '', maskedEmail = '', purpose = 'forgot_password' } = route.params || {};

//     const layout = useResponsiveLayout();
//     const { height: screenHeight } = useWindowDimensions();
//     const styles = useMemo(() => makeAuthStyles(layout, screenHeight), [layout, screenHeight]);

//     const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
//     const [otpError, setOtpError] = useState('');
//     const [isVerifying, setIsVerifying] = useState(false);
//     const [isResending, setIsResending] = useState(false);
//     const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

//     const inputRefs = useRef([]);

//     useEffect(() => {
//         // navigation.navigate('ResetPassword', { email: mobile })
//         if (cooldown <= 0) return;
//         const timer = setInterval(() => {
//             setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
//         }, 1000);
//         return () => clearInterval(timer);
//     }, [cooldown]);

//     const focusBox = (index) => {
//         if (index >= 0 && index < OTP_LENGTH) {
//             inputRefs.current[index]?.focus();
//         }
//     };

//     const handleChangeDigit = (text, index) => {
//         // Guard against paste of the full code into one box
//         const cleaned = text.replace(/[^0-9]/g, '');
//         if (!cleaned) {
//             const next = [...digits];
//             next[index] = '';
//             setDigits(next);
//             return;
//         }

//         if (cleaned.length > 1) {
//             // Pasted a multi-digit string — spread it across remaining boxes
//             const next = [...digits];
//             let cursor = index;
//             for (const char of cleaned) {
//                 if (cursor >= OTP_LENGTH) break;
//                 next[cursor] = char;
//                 cursor += 1;
//             }
//             setDigits(next);
//             focusBox(Math.min(cursor, OTP_LENGTH - 1));
//             return;
//         }

//         const next = [...digits];
//         next[index] = cleaned;
//         setDigits(next);
//         setOtpError('');
//         if (index < OTP_LENGTH - 1) {
//             focusBox(index + 1);
//         }
//     };

//     const handleKeyPress = (e, index) => {
//         if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
//             focusBox(index - 1);
//             const next = [...digits];
//             next[index - 1] = '';
//             setDigits(next);
//         }
//     };

//     const otpValue = digits.join('');

//     const handleVerify = async () => {
//         if (otpValue.length !== OTP_LENGTH) {
//             setOtpError(`Enter the ${OTP_LENGTH}-digit code`);
//             return;
//         }
//         setOtpError('');
//         setIsVerifying(true);
//         try {
//             const result = await request(
//                 VERIFY_OTP_API(),
//                 HTTP_METHODS.POST,
//                 JSON.stringify({ email: mobile, otp: otpValue })
//             );

//             const resetToken = result?.response?.data?.resetToken;

//             showSuccessToast('', 'OTP verified successfully');

//             if (purpose === 'forgot_password') {
//                 // Hand off to your reset-password screen. Rename the route
//                 // and/or params below to match your actual navigator.
//                 navigation.navigate('ResetPassword', { email: mobile, otp: otpValue  });
//             } else {
//                 navigation.goBack();
//             }
//         } catch (e) {
//             console.log('OTP verify failed status:', e?.response?.status);
//             console.log('OTP verify failed body:', e?.response?.data?.message);
//             setOtpError(e?.response?.data?.message || 'Invalid or expired code');
//             showErrorToast(e?.response?.data?.message || 'Invalid or expired code');
//         } finally {
//             setIsVerifying(false);
//         }
//     };

//     const handleResend = async () => {
//         if (cooldown > 0 || isResending) return;
//         setIsResending(true);
//         try {
//             await request(
//                 RESEND_OTP_API(),
//                 HTTP_METHODS.POST,
//                 JSON.stringify({ mobile, purpose })
//             );
//             showSuccessToast('', 'A new OTP has been sent to your email');
//             setDigits(Array(OTP_LENGTH).fill(''));
//             setOtpError('');
//             setCooldown(RESEND_COOLDOWN_SECONDS);
//             focusBox(0);
//         } catch (e) {
//             showErrorToast(e?.response?.data?.message || 'Could not resend OTP. Please try again.');
//         } finally {
//             setIsResending(false);
//         }
//     };

//     const destinationLabel = maskedEmail
//         ? maskedEmail
//         : `the email linked to ${maskMobile(mobile)}`;
//     //sent to {destinationLabel}
//     return (
//         <KeyboardAvoidingView
//             style={styles.flexOne}
//             behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//             keyboardVerticalOffset={0}
//         >
//             <LottieView
//                 source={require('../../assets/dots_constellation_burst_landscape_new.json')}
//                 autoPlay
//                 loop
//                 resizeMode="cover"
//                 style={{ width: '100%', height: '100%', position: "absolute" }}
//             />
//             <ScrollView
//                 style={styles.scrollView}
//                 showsVerticalScrollIndicator={false}
//                 keyboardShouldPersistTaps="handled"
//                 contentContainerStyle={styles.scrollContent}
//                 automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
//             >
//                 <View style={styles.box}>
//                     {/* Header band */}
//                     <LinearGradient
//                         colors={['#1a73e8', '#3562a6']}
//                         start={{ x: 0, y: 0 }}
//                         end={{ x: 1, y: 1 }}
//                         style={styles.headerBand}
//                     >
//                         <Text style={styles.title}>Verify OTP</Text>
//                         <Text style={styles.subtitle}>
//                             Enter the {OTP_LENGTH}-digit code
//                         </Text>
//                     </LinearGradient>

//                     {/* Logo circle, straddling the header/body seam */}
//                     <View style={styles.logoCircleWrap}>
//                         <Image source={icon} style={styles.logo} resizeMode="contain" />
//                     </View>

//                     {/* White body: OTP boxes + actions */}
//                     <View style={styles.formPane}>

//                         <View style={styles.otpRow}>
//                             {digits.map((digit, index) => (
//                                 <TextInput
//                                     key={index}
//                                     ref={(el) => { inputRefs.current[index] = el; }}
//                                     style={[
//                                         styles.otpBox,
//                                         digit ? styles.otpBoxFilled : null,
//                                         otpError ? styles.otpBoxError : null,
//                                     ]}
//                                     value={digit}
//                                     onChangeText={(text) => handleChangeDigit(text, index)}
//                                     onKeyPress={(e) => handleKeyPress(e, index)}
//                                     keyboardType="number-pad"
//                                     maxLength={OTP_LENGTH} // allows pasting the full code into one box
//                                     textContentType="oneTimeCode"
//                                     autoComplete={index === 0 ? 'sms-otp' : 'off'}
//                                     returnKeyType="done"
//                                     selectTextOnFocus
//                                 />
//                             ))}
//                         </View>

//                         {!!otpError && (
//                             <Text style={[styles.errorText, { alignSelf: 'center', marginBottom: 8 }]}>
//                                 {otpError}
//                             </Text>
//                         )}

//                         <LinearGradient
//                             colors={['#1a73e8', '#3562a6']}
//                             start={{ x: 0, y: 0 }}
//                             end={{ x: 1, y: 1 }}
//                             style={styles.buttonGradient}
//                         >
//                             <Button
//                                 mode="contained"
//                                 onPress={handleVerify}
//                                 loading={isVerifying}
//                                 disabled={otpValue.length !== OTP_LENGTH}
//                                 style={styles.primaryButton}
//                                 contentStyle={styles.primaryButtonContent}
//                             >
//                                 VERIFY OTP
//                             </Button>
//                         </LinearGradient>

//                         {/* Resend row */}
//                         <View style={styles.resendRow}>
//                             {cooldown > 0 ? (
//                                 <Text style={styles.timerText}>
//                                     Resend code in {cooldown}s
//                                 </Text>
//                             ) : (
//                                 <TouchableOpacity onPress={handleResend} disabled={isResending}>
//                                     <Text style={[styles.resendText, isResending ? styles.resendTextDisabled : null]}>
//                                         {isResending ? 'Resending…' : 'Resend OTP'}
//                                     </Text>
//                                 </TouchableOpacity>
//                             )}
//                         </View>

//                         {/* Back to login link */}
//                         <View style={styles.inlineLinkRow}>
//                             <TouchableOpacity onPress={() => navigation.navigate('Login')}>
//                                 <Text style={styles.linkText}>Back to Login</Text>
//                             </TouchableOpacity>
//                         </View>
//                     </View>
//                 </View>
//             </ScrollView>
//         </KeyboardAvoidingView>
//     );
// };

// export { OtpVerificationScreen };

import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
    View,
    KeyboardAvoidingView,
    Image,
    Text,
    ScrollView,
    Platform,
    useWindowDimensions,
    TouchableOpacity,
    TextInput
} from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import icon from '../../assets/images/icon.png';
import { Button } from 'react-native-paper';
import { useResponsiveLayout } from '../../component/Useresponsivelayout';
import { request } from '../../services/services';
// NOTE: assumed endpoint names — add these next to LOGIN_API in
// api-end-points.js, e.g.:
//   export const VERIFY_OTP_API = () => `${BASE_URL}/verify-otp`;
//   export const RESEND_OTP_API = () => `${BASE_URL}/resend-otp`;
// Rename these imports if your actual endpoints are named differently.
import { VERIFY_OTP_API, RESEND_OTP_API } from "../../services/api-end-points";
import { HTTP_METHODS } from "../../services/api-constants";
import { makeAuthStyles } from './authStyles';
import { useNavigation, useRoute } from '@react-navigation/native';
import { showSuccessToast, showErrorToast } from '../../utils/Toastutils';
import LottieView from 'lottie-react-native';

// Flip this to 4 if your backend issues 4-digit codes instead of 6 —
// everything else (boxes, focus handling, validation) adapts automatically.
const OTP_LENGTH = 6;

const RESEND_COOLDOWN_SECONDS = 900;

// Above 90s, show as "m:ss" (e.g. "14:45"); at or below 90s, show as
// plain seconds (e.g. "58s") since a bare "1:30" reads oddly that close
// to zero.
const formatCooldown = (totalSeconds) => {
    if (totalSeconds > 90) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${String(seconds).padStart(2, '0')}`;
    }
    return `${totalSeconds}s`;
};

const maskMobile = (mobile = '') => {
    if (mobile.length < 4) return mobile;
    return `${'*'.repeat(mobile.length - 4)}${mobile.slice(-4)}`;
};

const OtpVerificationScreen = () => {

    const navigation = useNavigation();
    const route = useRoute();
    const { mobile = '', maskedEmail = '', purpose = 'forgot_password' } = route.params || {};

    const layout = useResponsiveLayout();
    const { height: screenHeight } = useWindowDimensions();
    const styles = useMemo(() => makeAuthStyles(layout, screenHeight), [layout, screenHeight]);

    const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
    const [otpError, setOtpError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

    const inputRefs = useRef([]);

    useEffect(() => {
        // navigation.navigate('ResetPassword', { email: mobile })
        if (cooldown <= 0) return;
        const timer = setInterval(() => {
            setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    const focusBox = (index) => {
        if (index >= 0 && index < OTP_LENGTH) {
            inputRefs.current[index]?.focus();
        }
    };

    const handleChangeDigit = (text, index) => {
        // Guard against paste of the full code into one box
        const cleaned = text.replace(/[^0-9]/g, '');
        if (!cleaned) {
            const next = [...digits];
            next[index] = '';
            setDigits(next);
            return;
        }

        if (cleaned.length > 1) {
            // Pasted a multi-digit string — spread it across remaining boxes
            const next = [...digits];
            let cursor = index;
            for (const char of cleaned) {
                if (cursor >= OTP_LENGTH) break;
                next[cursor] = char;
                cursor += 1;
            }
            setDigits(next);
            focusBox(Math.min(cursor, OTP_LENGTH - 1));
            return;
        }

        const next = [...digits];
        next[index] = cleaned;
        setDigits(next);
        setOtpError('');
        if (index < OTP_LENGTH - 1) {
            focusBox(index + 1);
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
            focusBox(index - 1);
            const next = [...digits];
            next[index - 1] = '';
            setDigits(next);
        }
    };

    const otpValue = digits.join('');

    const handleVerify = async () => {
        if (otpValue.length !== OTP_LENGTH) {
            setOtpError(`Enter the ${OTP_LENGTH}-digit code`);
            return;
        }
        setOtpError('');
        setIsVerifying(true);
        try {
            const result = await request(
                VERIFY_OTP_API(),
                HTTP_METHODS.POST,
                JSON.stringify({ email: mobile, otp: otpValue })
            );

            const resetToken = result?.response?.data?.resetToken;

            showSuccessToast('', 'OTP verified successfully');

            if (purpose === 'forgot_password') {
                // Hand off to your reset-password screen. Rename the route
                // and/or params below to match your actual navigator.
                navigation.navigate('ResetPassword', { email: mobile, otp: otpValue  });
            } else {
                navigation.goBack();
            }
        } catch (e) {
            console.log('OTP verify failed status:', e?.response?.status);
            console.log('OTP verify failed body:', e?.response?.data?.message);
            setOtpError(e?.response?.data?.message || 'Invalid or expired code');
            showErrorToast(e?.response?.data?.message || 'Invalid or expired code');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        if (cooldown > 0 || isResending) return;
        setIsResending(true);
        try {
            await request(
                RESEND_OTP_API(),
                HTTP_METHODS.POST,
                JSON.stringify({ mobile, purpose })
            );
            showSuccessToast('', 'A new OTP has been sent to your email');
            setDigits(Array(OTP_LENGTH).fill(''));
            setOtpError('');
            setCooldown(RESEND_COOLDOWN_SECONDS);
            focusBox(0);
        } catch (e) {
            showErrorToast(e?.response?.data?.message || 'Could not resend OTP. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    const destinationLabel = maskedEmail
        ? maskedEmail
        : `the email linked to ${maskMobile(mobile)}`;
    //sent to {destinationLabel}
    return (
        <KeyboardAvoidingView
            style={styles.flexOne}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
        >
            <LottieView
                source={require('../../assets/dots_constellation_burst_landscape_new.json')}
                autoPlay
                loop
                resizeMode="cover"
                style={{ width: '100%', height: '100%', position: "absolute" }}
            />
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
                automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            >
                <View style={styles.box}>
                    {/* Header band */}
                    <LinearGradient
                        colors={['#1a73e8', '#3562a6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.headerBand}
                    >
                        <Text style={styles.title}>Verify OTP</Text>
                        <Text style={styles.subtitle}>
                            Enter the {OTP_LENGTH}-digit code
                        </Text>
                    </LinearGradient>

                    {/* Logo circle, straddling the header/body seam */}
                    <View style={styles.logoCircleWrap}>
                        <Image source={icon} style={styles.logo} resizeMode="contain" />
                    </View>

                    {/* White body: OTP boxes + actions */}
                    <View style={styles.formPane}>

                        <View style={styles.otpRow}>
                            {digits.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    style={[
                                        styles.otpBox,
                                        digit ? styles.otpBoxFilled : null,
                                        otpError ? styles.otpBoxError : null,
                                    ]}
                                    value={digit}
                                    onChangeText={(text) => handleChangeDigit(text, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    keyboardType="number-pad"
                                    maxLength={OTP_LENGTH} // allows pasting the full code into one box
                                    textContentType="oneTimeCode"
                                    autoComplete={index === 0 ? 'sms-otp' : 'off'}
                                    returnKeyType="done"
                                    selectTextOnFocus
                                />
                            ))}
                        </View>

                        {!!otpError && (
                            <Text style={[styles.errorText, { alignSelf: 'center', marginBottom: 8 }]}>
                                {otpError}
                            </Text>
                        )}

                        <LinearGradient
                            colors={['#1a73e8', '#3562a6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.buttonGradient}
                        >
                            <Button
                                mode="contained"
                                onPress={handleVerify}
                                loading={isVerifying}
                                disabled={otpValue.length !== OTP_LENGTH}
                                style={styles.primaryButton}
                                contentStyle={styles.primaryButtonContent}
                            >
                                VERIFY OTP
                            </Button>
                        </LinearGradient>

                        {/* Resend row */}
                        <View style={styles.resendRow}>
                            {cooldown > 0 ? (
                                <Text style={styles.timerText}>
                                    Resend code in {formatCooldown(cooldown)}
                                </Text>
                            ) : (
                                <TouchableOpacity onPress={handleResend} disabled={isResending}>
                                    <Text style={[styles.resendText, isResending ? styles.resendTextDisabled : null]}>
                                        {isResending ? 'Resending…' : 'Resend OTP'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Back to login link */}
                        <View style={styles.inlineLinkRow}>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.linkText}>Back to Login</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export { OtpVerificationScreen };