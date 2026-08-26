// authStyles.js
// Shared responsive styling for all auth screens (Login, Registration, Forgot Password, OTP).
//
// Same header band / logo circle / white body card pattern used everywhere.
// Added in this update: OTP box row styles, resend-link styles, and a
// generic "infoText" style used by ForgotPassword to explain that the
// code goes to the account's email.

import { StyleSheet } from 'react-native';
import fonts from '../../assets/fonts/fonts';
import colors from '../../assets/appColor/colors';
import DeviceInfo from 'react-native-device-info';

export const makeAuthStyles = (layout, screenHeight) =>
    StyleSheet.create({
        flexOne: {
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

        // Outer card. No overflow:'hidden' here on purpose — the logo
        // circle needs to sit half in / half out of the header band via a
        // negative margin, and clipping the box would cut it off.
        box: {
            width: layout.boxWidth,
            maxWidth: 900,
            backgroundColor: '#ffffff',
            borderRadius: layout.cardRadius,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.14,
            shadowRadius: 24,
            elevation: 10,
        },

        // Colored header band — same blue gradient as the submit button,
        // just applied here as the card's top section. Extra bottom
        // padding reserves room for the logo circle to overlap into.
        headerBand: {
            borderTopLeftRadius: layout.cardRadius,
            borderTopRightRadius: layout.cardRadius,
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: layout.cardPadding,
            paddingBottom: layout.imageSize / 2 + layout.gap,
            paddingHorizontal: layout.gap,
        },
        title: {
            fontSize: layout.titleSize,
            color: '#ffffff',
            fontWeight: '800',
            marginTop: 0,
            marginBottom: 6,
            maxWidth: 320,
            flexWrap: 'wrap',
            textAlign: 'center',
            fontFamily: fonts.POPPINS_REGULAR,
        },
        subtitle: {
            fontSize: layout.bodySize,
            color: 'rgba(255,255,255,0.85)',
            textAlign: 'center',
            marginTop: 2,
            maxWidth: 320,
            fontFamily: fonts.POPPINS_REGULAR,
        },

        // Logo circle — sits on the seam between header and body. The
        // negative marginTop pulls it up so half overlaps the header band,
        // matching the reference. zIndex/elevation keep it above both.
        logoCircleWrap: {
            alignSelf: 'center',
            width: layout.imageSize + 24,
            height: layout.imageSize + 24,
            borderRadius: (layout.imageSize + 24) / 2,
            backgroundColor: '#ffffff',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: -(layout.imageSize / 2 + 12),
            zIndex: 2,
            elevation: 6,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
        },
        logo: {
            width: layout.imageSize,
            height: layout.imageSize,
        },

        // White body — holds the form. Rounded on the bottom to match the
        // card's outer radius since the box itself isn't clipped.
        formPane: {
            width: '100%',
            backgroundColor: '#ffffff',
            borderBottomLeftRadius: layout.cardRadius,
            borderBottomRightRadius: layout.cardRadius,
            paddingHorizontal: layout.cardPadding,
            paddingTop: layout.gap / 2,
            paddingBottom: layout.cardPadding,
        },

        // Field grid: two columns in landscape/wide layout, single column
        // in portrait/narrow layout.
        fieldsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
        },
        fieldWrap: {
            width: layout.useSplitLayout ? '48%' : '100%',
            marginBottom: layout.gap / 2,
        },
        fieldWrapFull: {
            width: '100%',
            marginBottom: layout.gap / 2,
        },
        input: {
            width: '100%',
            fontSize: layout.bodySize,
            height: (DeviceInfo.isTablet()) ? (layout.height / 12) : (layout.height / 7)
        },
        errorText: {
            color: colors.ERROR_COLOR || '#D32F2F',
            fontSize: layout.bodySize - 2,
            marginBottom: 6,
            alignSelf: 'flex-start',
        },

        primaryButton: {
            width: '100%',
            borderRadius: 12,
            backgroundColor: 'transparent',
        },
        primaryButtonContent: {
            paddingVertical: 2,
        },
        buttonGradient: {
            borderRadius: 12,
            paddingVertical: 6,
            marginTop: layout.gap / 2,
            shadowColor: '#1a73e8',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.28,
            shadowRadius: 10,
            elevation: 5,
        },

        linksRow: {
            flexDirection: layout.useSplitLayout ? 'row' : 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: layout.gap,
            width: '100%',
        },
        linkText: {
            color: '#1a73e8',
            fontSize: layout.bodySize,
            fontWeight: '600',
            fontFamily: fonts.POPPINS_REGULAR,
            paddingVertical: 6,
            textAlign: 'center',
        },
        plainText: {
            color: '#5a6b82',
            fontSize: layout.bodySize,
            fontFamily: fonts.POPPINS_REGULAR,
        },
        inlineLinkRow: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: layout.gap,
        },

        // ---------------------------------------------------------------
        // NEW: informational banner used on ForgotPassword to tell the
        // user the code goes to their email, not shown as a raw input.
        // ---------------------------------------------------------------
        infoBanner: {
            backgroundColor: '#eef4ff',
            borderRadius: 10,
            paddingVertical: 10,
            paddingHorizontal: 12,
            marginBottom: layout.gap,
            flexDirection: 'row',
            alignItems: 'flex-start',
        },
        infoBannerText: {
            color: '#2b4c7e',
            fontSize: layout.bodySize - 1,
            fontFamily: fonts.POPPINS_REGULAR,
            flex: 1,
            marginLeft: 8,
            lineHeight: (layout.bodySize - 1) * 1.4,
        },

        // ---------------------------------------------------------------
        // NEW: OTP entry boxes
        // ---------------------------------------------------------------
        otpRow: {
            flexDirection: 'row',
            justifyContent: 'center',
            width: '100%',
            marginTop: layout.gap / 2,
            marginBottom: layout.gap / 2,
        },
        otpBox: {
            width: layout.useSplitLayout ? 52 : 44,
            height: layout.useSplitLayout ? 58 : 50,
            marginHorizontal: 6,
            borderRadius: 10,
            borderWidth: 1.5,
            borderColor: '#e2eaf4',
            backgroundColor: '#f4f4f4',
            textAlign: 'center',
            fontSize: layout.titleSize ? layout.titleSize * 0.55 : 20,
            fontWeight: '700',
            color: '#1a1a1a',
            fontFamily: fonts.POPPINS_REGULAR,
        },
        otpBoxFilled: {
            borderColor: '#1a73e8',
            backgroundColor: '#ffffff',
        },
        otpBoxError: {
            borderColor: colors.ERROR_COLOR || '#D32F2F',
        },

        resendRow: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 4,
            marginBottom: layout.gap,
        },
        resendText: {
            color: '#1a73e8',
            fontSize: layout.bodySize,
            fontWeight: '600',
            fontFamily: fonts.POPPINS_REGULAR,
        },
        resendTextDisabled: {
            color: '#9aa7b8',
        },
        timerText: {
            color: '#5a6b82',
            fontSize: layout.bodySize,
            fontFamily: fonts.POPPINS_REGULAR,
        },
    });