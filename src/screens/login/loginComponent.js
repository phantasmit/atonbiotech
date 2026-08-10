// import React, { useEffect, useMemo, useState } from 'react';
// import {
//     View,
//     StyleSheet,
//     KeyboardAvoidingView,
//     Image,
//     Text,
//     ScrollView,
//     Platform
// } from "react-native";
// import LinearGradient from 'react-native-linear-gradient';
// import icon from '../../assets/images/icon.png';
// import fonts from '../../assets/fonts/fonts';
// import { Formik } from 'formik';
// import * as Yup from "yup";
// import { Button } from 'react-native-paper';
// import colors from '../../assets/appColor/colors';
// import CustomTextInput from '../../component/CustomTextInput';
// import { useResponsiveLayout } from '../../component/Useresponsivelayout';
// import { useDispatch } from 'react-redux';
// import { changeStack } from '../../navigation/navigationSlice';
// import stackEnum from '../../navigation/stackEnum';
// import { request } from '../../services/services';
// import { LOGIN_API } from "../../services/api-end-points";
// import { HTTP_METHODS } from "../../services/api-constants";
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { saveUser } from './authSlice';
// const LoginComponent = () => {

//     const [isHidden, setIsHidden] = useState(true);

//     const layout = useResponsiveLayout();
//     const styles = useMemo(() => makeStyles(layout), [layout]);

//     const dispatch = useDispatch();

//     return (
//         <KeyboardAvoidingView
//             style={styles.flexOne}
//             behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//         >
//             <LinearGradient
//                 colors={['#f3f6fb', '#f3f6fb']}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 1 }}
//                 style={styles.gradient}
//             >
//                 <View style={styles.box}>
//                     <ScrollView
//                         style={styles.scrollView}
//                         showsVerticalScrollIndicator={false}
//                         keyboardShouldPersistTaps="handled"
//                         contentContainerStyle={styles.scrollContent}
//                     >
//                         <View style={styles.contentWrapper}>
//                             {/* Branding pane - sits on the left in split
//                                 layout (tablet / landscape), on top otherwise */}
//                             <View style={styles.brandingPane}>
//                                 <Image
//                                     source={icon}
//                                     style={styles.logo}
//                                     resizeMode="contain"
//                                 />
//                                 <Text style={styles.title}>
//                                     Welcome to Konsyl Pharmaceuticals
//                                 </Text>
//                             </View>

//                             {/* Form pane */}
//                             <View style={styles.formPane}>
//                                 <Formik
//                                     initialValues={{
//                                         emailId: "",
//                                         password: "",
//                                         isLoading: false,
//                                     }}
//                                     validationSchema={Yup.object().shape({
//                                         emailId: Yup.string()
//                                             .trim()
//                                             .required('Please enter a username'),
//                                         password: Yup.string()
//                                             .trim()
//                                             .required('Password is required')
//                                             .min(6, "Minimum 6 characters required"),
//                                     })}
//                                     validateOnChange={true}
//                                     validateOnBlur={true}
//                                     onSubmit={async (values, { setSubmitting }) => {
//                                         setSubmitting(true);
//                                         try {
//                                             const result = await request(LOGIN_API(), HTTP_METHODS.POST, JSON.stringify({
//                                                 "login": values.emailId,
//                                                 "password": values.password,
//                                                 "device_name": (Platform.OS === 'android') ? "android" : "ios"
//                                             }))
//                                             const { token, user } = result?.response?.data;
//                                             try {
//                                                 await AsyncStorage.setItem('authToken', token);
//                                                 dispatch(saveUser(user));
//                                                 dispatch(changeStack(stackEnum.APP_STACK));
//                                             } catch (error) {
//                                                 console.error('Error saving token:', error);
//                                             }

//                                         } catch (e) {
//                                             console.log('Login failed status:', e?.response?.status);
//                                             console.log('Login failed body:', e?.response?.data?.message);
//                                             alert(e?.response?.data?.message)
//                                         } finally {
//                                             setSubmitting(false);
//                                         }
//                                     }}
//                                 >
//                                     {({
//                                         handleChange,
//                                         handleSubmit,
//                                         values,
//                                         errors,
//                                         touched,
//                                         isSubmitting,
//                                     }) => (
//                                         <>
//                                             <CustomTextInput
//                                                 leftIcon="account"
//                                                 placeholder="Username"
//                                                 value={values.emailId}
//                                                 onChangeText={handleChange('emailId')}
//                                                 error={touched.emailId && !!errors.emailId}
//                                                 errorText={errors.emailId}
//                                                 inputStyle={styles.input}
//                                                 outlineStyle={{ borderRadius: 10 }}
//                                                 outlineColor="#e2eaf4"
//                                                 activeOutlineColor="#eef3fb"
//                                             />

//                                             <CustomTextInput
//                                                 leftIcon="lock"
//                                                 rightIcon={isHidden ? 'eye-off' : 'eye'}
//                                                 onRightIconPress={() => setIsHidden(prev => !prev)}
//                                                 placeholder="Password"
//                                                 value={values.password}
//                                                 onChangeText={handleChange('password')}
//                                                 secureTextEntry={isHidden}
//                                                 error={touched.password && !!errors.password}
//                                                 errorText={touched.password ? errors.password : ''}
//                                                 inputStyle={styles.input}
//                                                 outlineStyle={{ borderRadius: 10 }}
//                                                 outlineColor="#e2eaf4"
//                                                 activeOutlineColor="#eef3fb"
//                                             />
//                                             <LinearGradient
//                                                 colors={['#1a73e8', '#3562a6']}
//                                                 start={{ x: 0, y: 0 }}
//                                                 end={{ x: 1, y: 1 }}
//                                                 style={{ borderRadius: 10, paddingVertical: 8 }}
//                                             >
//                                                 <Button
//                                                     mode="contained"
//                                                     onPress={handleSubmit}
//                                                     loading={isSubmitting}
//                                                     style={styles.loginButton}
//                                                     contentStyle={styles.loginButtonContent}
//                                                 >
//                                                     LOGIN
//                                                 </Button>
//                                             </LinearGradient>
//                                         </>
//                                     )}
//                                 </Formik>
//                             </View>
//                         </View>
//                     </ScrollView>
//                 </View>
//             </LinearGradient>
//         </KeyboardAvoidingView>
//     );
// };

// const makeStyles = (layout) =>
//     StyleSheet.create({
//         flexOne: {
//             flex: 1
//         },
//         gradient: {
//             flex: 1,
//             alignItems: "center",
//             justifyContent: "center",
//         },
//         box: {
//             width: layout.boxWidth,
//             height: layout.boxHeight,
//             maxWidth: 900,
//             backgroundColor: '#fff',
//             borderRadius: 10,
//             shadowColor: '#000',
//             shadowOffset: { width: 0, height: 2 },
//             shadowOpacity: 0.25,
//             shadowRadius: 3.84,
//             elevation: 4,
//             overflow: 'hidden',
//         },
//         scrollView: {
//             width: '100%',
//         },
//         scrollContent: {
//             flexGrow: 1,
//             padding: layout.horizontalPadding,
//         },
//         contentWrapper: {
//             flex: 1,
//             flexDirection: layout.useSplitLayout ? 'row' : 'column',
//             alignItems: 'center',
//             justifyContent: 'center',
//         },
//         brandingPane: {
//             flex: layout.useSplitLayout ? 1 : undefined,
//             alignItems: 'center',
//             justifyContent: 'center',
//             paddingHorizontal: layout.gap,
//             paddingBottom: layout.useSplitLayout ? 0 : layout.gap,
//         },
//         logo: {
//             width: layout.imageSize,
//             height: layout.imageSize,
//             aspectRatio: layout.imageSize * 0.01
//         },
//         title: {
//             fontSize: layout.titleSize,
//             color: "#000",
//             fontWeight: "800",
//             marginTop: 10,
//             textAlign: 'center',
//             fontFamily: fonts.POPPINS_REGULAR,
//         },
//         formPane: {
//             flex: layout.useSplitLayout ? 1 : undefined,
//             width: layout.useSplitLayout ? undefined : '100%',
//             paddingHorizontal: layout.gap,
//             justifyContent: 'center',
//         },
//         input: {
//             width: '100%',
//             marginBottom: 8,
//             fontSize: layout.bodySize
//         },
//         errorText: {
//             color: colors.ERROR_COLOR || 'red',
//             fontSize: layout.bodySize - 2,
//             marginBottom: 6,
//             alignSelf: 'flex-start',
//         },
//         loginButton: {
//             width: '100%',
//             borderRadius: 10,
//             //marginTop: 8,
//             backgroundColor: 'transparent'
//         },
//         loginButtonContent: {
//             //paddingBottom:10
//         },
//     });

// export { LoginComponent };

import React, { useMemo, useState } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Image,
    Text,
    ScrollView,
    Platform,
    useWindowDimensions,
} from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import icon from '../../assets/images/icon.png';
import fonts from '../../assets/fonts/fonts';
import { Formik } from 'formik';
import * as Yup from "yup";
import { Button } from 'react-native-paper';
import colors from '../../assets/appColor/colors';
import CustomTextInput from '../../component/CustomTextInput';
import { useResponsiveLayout } from '../../component/Useresponsivelayout';
import { useDispatch } from 'react-redux';
import { changeStack } from '../../navigation/navigationSlice';
import stackEnum from '../../navigation/stackEnum';
import { request } from '../../services/services';
import { LOGIN_API } from "../../services/api-end-points";
import { HTTP_METHODS } from "../../services/api-constants";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveUser } from './authSlice';

const LoginComponent = () => {

    const [isHidden, setIsHidden] = useState(true);

    const layout = useResponsiveLayout();
    const { height: screenHeight } = useWindowDimensions();
    const styles = useMemo(() => makeStyles(layout, screenHeight), [layout, screenHeight]);

    const dispatch = useDispatch();

    return (
        <KeyboardAvoidingView
            style={styles.flexOne}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <LinearGradient
                colors={['#f3f6fb', '#f3f6fb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scrollContent}
                    // Ensures the focused input is scrolled above the keyboard automatically
                    automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
                >
                    <View style={styles.box}>
                        <View style={styles.contentWrapper}>
                            {/* Branding pane - sits on the left in split
                                layout (tablet / landscape), on top otherwise */}
                            <View style={styles.brandingPane}>
                                <Image
                                    source={icon}
                                    style={styles.logo}
                                    resizeMode="contain"
                                />
                                <Text style={styles.title}>
                                    Welcome to Konsyl Pharmaceuticals
                                </Text>
                            </View>

                            {/* Form pane */}
                            <View style={styles.formPane}>
                                <Formik
                                    initialValues={{
                                        emailId: "",
                                        password: "",
                                        isLoading: false,
                                    }}
                                    validationSchema={Yup.object().shape({
                                        emailId: Yup.string()
                                            .trim()
                                            .required('Please enter a username'),
                                        password: Yup.string()
                                            .trim()
                                            .required('Password is required')
                                            .min(6, "Minimum 6 characters required"),
                                    })}
                                    validateOnChange={true}
                                    validateOnBlur={true}
                                    onSubmit={async (values, { setSubmitting }) => {
                                        setSubmitting(true);
                                        try {
                                            const result = await request(LOGIN_API(), HTTP_METHODS.POST, JSON.stringify({
                                                "login": values.emailId,
                                                "password": values.password,
                                                "device_name": (Platform.OS === 'android') ? "android" : "ios"
                                            }))
                                            const { token, user } = result?.response?.data;
                                            try {
                                                await AsyncStorage.setItem('authToken', token);
                                                dispatch(saveUser(user));
                                                dispatch(changeStack(stackEnum.APP_STACK));
                                            } catch (error) {
                                                console.error('Error saving token:', error);
                                            }

                                        } catch (e) {
                                            console.log('Login failed status:', e?.response?.status);
                                            console.log('Login failed body:', e?.response?.data?.message);
                                            alert(e?.response?.data?.message)
                                        } finally {
                                            setSubmitting(false);
                                        }
                                    }}
                                >
                                    {({
                                        handleChange,
                                        handleSubmit,
                                        values,
                                        errors,
                                        touched,
                                        isSubmitting,
                                    }) => (
                                        <>
                                            <CustomTextInput
                                                leftIcon="account"
                                                placeholder="Username"
                                                value={values.emailId}
                                                onChangeText={handleChange('emailId')}
                                                error={touched.emailId && !!errors.emailId}
                                                errorText={errors.emailId}
                                                inputStyle={styles.input}
                                                outlineStyle={{ borderRadius: 10 }}
                                                outlineColor="#e2eaf4"
                                                activeOutlineColor="#eef3fb"
                                            />

                                            <CustomTextInput
                                                leftIcon="lock"
                                                rightIcon={isHidden ? 'eye-off' : 'eye'}
                                                onRightIconPress={() => setIsHidden(prev => !prev)}
                                                placeholder="Password"
                                                value={values.password}
                                                onChangeText={handleChange('password')}
                                                secureTextEntry={isHidden}
                                                error={touched.password && !!errors.password}
                                                errorText={touched.password ? errors.password : ''}
                                                inputStyle={styles.input}
                                                outlineStyle={{ borderRadius: 10 }}
                                                outlineColor="#e2eaf4"
                                                activeOutlineColor="#eef3fb"
                                            />
                                            <LinearGradient
                                                colors={['#1a73e8', '#3562a6']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                                style={{ borderRadius: 10, paddingVertical: 8 }}
                                            >
                                                <Button
                                                    mode="contained"
                                                    onPress={handleSubmit}
                                                    loading={isSubmitting}
                                                    style={styles.loginButton}
                                                    contentStyle={styles.loginButtonContent}
                                                >
                                                    LOGIN
                                                </Button>
                                            </LinearGradient>
                                        </>
                                    )}
                                </Formik>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
};

const makeStyles = (layout, screenHeight) =>
    StyleSheet.create({
        flexOne: {
            flex: 1
        },
        gradient: {
            flex: 1,
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            flexGrow: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: layout.horizontalPadding,
            minHeight: screenHeight,
        },
        box: {
            width: layout.boxWidth,
            maxWidth: 900,
            // No fixed height / maxHeight here — let the card size to its
            // own content. The outer ScrollView takes care of anything
            // that doesn't fit once the keyboard opens.
            backgroundColor: '#fff',
            borderRadius: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 4,
            padding: layout.horizontalPadding,
        },
        contentWrapper: {
            flexDirection: layout.useSplitLayout ? 'row' : 'column',
            alignItems: 'center',
            justifyContent: 'center',
        },
        brandingPane: {
            flex: layout.useSplitLayout ? 1 : undefined,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: layout.gap,
            paddingBottom: layout.useSplitLayout ? 0 : layout.gap,
        },
        logo: {
            width: layout.imageSize,
            height: layout.imageSize,
            aspectRatio: layout.imageSize * 0.01
        },
        title: {
            fontSize: layout.titleSize,
            color: "#000",
            fontWeight: "800",
            marginTop: 10,
            textAlign: 'center',
            fontFamily: fonts.POPPINS_REGULAR,
        },
        formPane: {
            flex: layout.useSplitLayout ? 1 : undefined,
            width: layout.useSplitLayout ? undefined : '100%',
            paddingHorizontal: layout.gap,
            justifyContent: 'center',
        },
        input: {
            width: '100%',
            marginBottom: 8,
            fontSize: layout.bodySize
        },
        errorText: {
            color: colors.ERROR_COLOR || 'red',
            fontSize: layout.bodySize - 2,
            marginBottom: 6,
            alignSelf: 'flex-start',
        },
        loginButton: {
            width: '100%',
            borderRadius: 10,
            backgroundColor: 'transparent'
        },
        loginButtonContent: {
        },
    });

// const makeStyles = (layout, screenHeight) =>
//     StyleSheet.create({
//         flexOne: {
//             flex: 1
//         },
//         gradient: {
//             flex: 1,
//         },
//         scrollView: {
//             flex: 1,
//         },
//         scrollContent: {
//             flexGrow: 1,
//             alignItems: 'center',
//             justifyContent: 'center',
//             padding: layout.horizontalPadding,
//             minHeight: screenHeight,
//         },
//         box: {
//             width: layout.boxWidth,
//             maxWidth: 900,
//             // Let height follow content instead of a rigid fixed value,
//             // so nothing gets clipped when the keyboard shrinks visible space.
//             maxHeight: layout.boxHeight,
//             backgroundColor: '#fff',
//             borderRadius: 10,
//             shadowColor: '#000',
//             shadowOffset: { width: 0, height: 2 },
//             shadowOpacity: 0.25,
//             shadowRadius: 3.84,
//             elevation: 4,
//             padding: layout.horizontalPadding,
//         },
//         contentWrapper: {
//             flexDirection: layout.useSplitLayout ? 'row' : 'column',
//             alignItems: 'center',
//             justifyContent: 'center',
//         },
//         brandingPane: {
//             flex: layout.useSplitLayout ? 1 : undefined,
//             alignItems: 'center',
//             justifyContent: 'center',
//             paddingHorizontal: layout.gap,
//             paddingBottom: layout.useSplitLayout ? 0 : layout.gap,
//         },
//         logo: {
//             width: layout.imageSize,
//             height: layout.imageSize,
//             aspectRatio: layout.imageSize * 0.01
//         },
//         title: {
//             fontSize: layout.titleSize,
//             color: "#000",
//             fontWeight: "800",
//             marginTop: 10,
//             textAlign: 'center',
//             fontFamily: fonts.POPPINS_REGULAR,
//         },
//         formPane: {
//             flex: layout.useSplitLayout ? 1 : undefined,
//             width: layout.useSplitLayout ? undefined : '100%',
//             paddingHorizontal: layout.gap,
//             justifyContent: 'center',
//         },
//         input: {
//             width: '100%',
//             marginBottom: 8,
//             fontSize: layout.bodySize
//         },
//         errorText: {
//             color: colors.ERROR_COLOR || 'red',
//             fontSize: layout.bodySize - 2,
//             marginBottom: 6,
//             alignSelf: 'flex-start',
//         },
//         loginButton: {
//             width: '100%',
//             borderRadius: 10,
//             backgroundColor: 'transparent'
//         },
//         loginButtonContent: {
//         },
//     });

export { LoginComponent };