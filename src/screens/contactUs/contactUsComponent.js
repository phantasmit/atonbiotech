import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    useWindowDimensions,
    Platform,
    Clipboard,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { WebView } from 'react-native-webview';
import colors from '../../assets/appColor/colors';
import fonts from '../../assets/fonts/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { request } from '../../services/services';
import { GET_ABOUT_US_API, GET_CONTACT_US_API } from '../../services/api-end-points';
import { HTTP_METHODS } from '../../services/api-constants';

// ---------- Helpers ----------

// Basic HTML-escaping so nothing in the response can break the markup
const esc = (val) => {
    if (val === null || val === undefined) return '';
    return String(val)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

// Strips anything not [+ digits] for tel:/wa.me links
const toDialNumber = (val) => (val ? String(val).replace(/[^\d+]/g, '') : '');

// Builds the full contact-card HTML document from the API JSON
const buildContactHtml = (data) => {
    const {
        address,
        primary_phone,
        secondary_phone,
        primary_email,
        secondary_email,
        map_link,
        whatsapp_number,
        social = {},
        company = {},
    } = data || {};

    const { facebook, linkedin, youtube, instagram } = social;
    const { gstin, cin } = company;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
    <title>Konsyl Pharma - Contact</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; width: 100%; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: #f5f7fb;
            color: #1f2937;
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
        }
        .contact-container { width: 100%; max-width: 600px; margin: 0 auto; padding: 12px; }
        .contact-card { width: 100%; background: #ffffff; border-radius: 18px; padding: 20px; box-shadow: 0 4px 18px rgba(0,0,0,0.07); }
        .company-header { text-align: center; margin-bottom: 28px; }
        .company-logo { width: 68px; height: 68px; margin: 0 auto 13px; display: flex; align-items: center; justify-content: center; border-radius: 18px; background: #eef2ff; color: #6b9fe4; font-size: 29px; }
        .company-name { margin: 0; font-size: 25px; line-height: 1.3; font-weight: 700; color: #111827; }
        .company-subtitle { margin-top: 5px; font-size: 13px; color: #6b7280; }
        .section { margin-bottom: 25px; }
        .section:last-child { margin-bottom: 0; }
        .section-title { display: flex; align-items: center; gap: 9px; margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #111827; }
        .section-title i { width: 18px; text-align: center; color: #6b9fe4; font-size: 15px; }
        .address-box { padding: 14px; border-radius: 11px; background: #f8fafc; border: 1px solid #e5e7eb; }
        .address { margin: 0; font-size: 14px; line-height: 1.65; color: #4b5563; }
        .map-button { width: 100%; min-height: 46px; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 10px; padding: 12px 15px; border-radius: 10px; background: #6b9fe4; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; }
        .map-button i { font-size: 16px; }
        .contact-list { display: flex; flex-direction: column; gap: 9px; }
        .contact-item { width: 100%; min-height: 64px; display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 11px; background: #f8fafc; border: 1px solid #e5e7eb; color: inherit; text-decoration: none; }
        .contact-icon { width: 42px; height: 42px; min-width: 42px; display: flex; align-items: center; justify-content: center; border-radius: 10px; background: #eef2ff; color: #6b9fe4; font-size: 17px; }
        .contact-content { display: flex; flex-direction: column; min-width: 0; flex: 1; }
        .contact-label { font-size: 11px; color: #6b7280; margin-bottom: 2px; }
        .contact-value { font-size: 14px; line-height: 1.4; color: #111827; word-break: break-word; }
        .whatsapp-item { background: #f0fdf4; border-color: #bbf7d0; }
        .whatsapp-item .contact-icon { background: #dcfce7; color: #25D366; }
        .whatsapp-item .contact-value { color: #15803d; font-weight: 600; }
        .social-icons { display: flex; align-items: center; justify-content: center; gap: 18px; padding: 5px 0 2px; }
        .social-icon { width: 50px; height: 50px; min-width: 50px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: #f3f4f6; text-decoration: none; font-size: 22px; }
        .facebook { color: #1877F2; }
        .linkedin { color: #0A66C2; }
        .youtube { color: #FF0000; }
        .instagram { color: #E4405F; }
        .company-info { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 11px; padding: 7px 13px; }
        .company-row { min-height: 45px; display: flex; align-items: center; justify-content: space-between; gap: 15px; padding: 9px 0; border-bottom: 1px solid #e5e7eb; }
        .company-row:last-child { border-bottom: none; }
        .company-label { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #6b7280; }
        .company-label i { width: 17px; text-align: center; color: #6b9fe4; }
        .company-value { font-size: 13px; font-weight: 600; color: #111827; text-align: right; word-break: break-word; }
        .footer { margin-top: 22px; padding-top: 14px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 11px; color: #9ca3af; }

        @media (max-width: 380px) {
            .contact-container { padding: 8px; }
            .contact-card { padding: 16px; border-radius: 15px; }
            .company-logo { width: 60px; height: 60px; font-size: 25px; }
            .company-name { font-size: 22px; }
            .company-subtitle { font-size: 12px; }
            .contact-item { min-height: 60px; padding: 9px 10px; }
            .contact-icon { width: 40px; height: 40px; min-width: 40px; }
            .contact-value { font-size: 13px; }
            .social-icons { gap: 14px; }
            .social-icon { width: 46px; height: 46px; min-width: 46px; font-size: 20px; }
            .company-row { flex-direction: column; align-items: flex-start; gap: 3px; }
            .company-value { text-align: left; }
        }

        @media (min-width: 768px) {
            .contact-container { max-width: 650px; padding: 30px; }
            .contact-card { padding: 30px; }
            .company-name { font-size: 29px; }
        }
    </style>
</head>
<body>
<div class="contact-container">
    <div class="contact-card">

        <div class="company-header">
            <div class="company-logo"><i class="fa-solid fa-building"></i></div>
            <h1 class="company-name">Konsyl Pharmaceuticals Private Limited</h1>
            <div class="company-subtitle">Contact Information</div>
        </div>

        ${address ? `
        <div class="section">
            <h2 class="section-title"><i class="fa-solid fa-location-dot"></i><span>Address</span></h2>
            <div class="address-box"><p class="address">${esc(address)}</p></div>
            ${map_link ? `
            <a class="map-button" href="${esc(map_link)}" target="_blank" rel="noopener noreferrer">
                <i class="fa-solid fa-map-location-dot"></i><span>View on Google Maps</span>
            </a>` : ''}
        </div>` : ''}

        <div class="section">
            <h2 class="section-title"><i class="fa-solid fa-address-book"></i><span>Contact Us</span></h2>
            <div class="contact-list">

                ${primary_phone ? `
                <a class="contact-item" href="tel:${toDialNumber(primary_phone)}">
                    <div class="contact-icon"><i class="fa-solid fa-phone"></i></div>
                    <div class="contact-content">
                        <span class="contact-label">Primary Phone</span>
                        <span class="contact-value">${esc(primary_phone)}</span>
                    </div>
                </a>` : ''}

                ${secondary_phone ? `
                <a class="contact-item" href="tel:${toDialNumber(secondary_phone)}">
                    <div class="contact-icon"><i class="fa-solid fa-mobile-screen-button"></i></div>
                    <div class="contact-content">
                        <span class="contact-label">Secondary Phone</span>
                        <span class="contact-value">${esc(secondary_phone)}</span>
                    </div>
                </a>` : ''}

                ${primary_email ? `
                <a class="contact-item" href="mailto:${esc(primary_email)}">
                    <div class="contact-icon"><i class="fa-solid fa-envelope"></i></div>
                    <div class="contact-content">
                        <span class="contact-label">Primary Email</span>
                        <span class="contact-value">${esc(primary_email)}</span>
                    </div>
                </a>` : ''}

                ${secondary_email ? `
                <a class="contact-item" href="mailto:${esc(secondary_email)}">
                    <div class="contact-icon"><i class="fa-solid fa-envelope-open"></i></div>
                    <div class="contact-content">
                        <span class="contact-label">Secondary Email</span>
                        <span class="contact-value">${esc(secondary_email)}</span>
                    </div>
                </a>` : ''}

                ${whatsapp_number ? `
                <a class="contact-item whatsapp-item" href="https://wa.me/${toDialNumber(whatsapp_number).replace('+', '')}" target="_blank" rel="noopener noreferrer">
                    <div class="contact-icon"><i class="fa-brands fa-whatsapp"></i></div>
                    <div class="contact-content">
                        <span class="contact-label">WhatsApp</span>
                        <span class="contact-value">Chat with us on WhatsApp</span>
                    </div>
                </a>` : ''}

            </div>
        </div>

        ${(facebook || linkedin || youtube || instagram) ? `
        <div class="section">
            <h2 class="section-title"><i class="fa-solid fa-share-nodes"></i><span>Follow Us</span></h2>
            <div class="social-icons">
                ${facebook ? `<a class="social-icon facebook" href="${esc(facebook)}" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>` : ''}
                ${linkedin ? `<a class="social-icon linkedin" href="${esc(linkedin)}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>` : ''}
                ${youtube ? `<a class="social-icon youtube" href="${esc(youtube)}" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a>` : ''}
                ${instagram ? `<a class="social-icon instagram" href="${esc(instagram)}" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>` : ''}
            </div>
        </div>` : ''}

        ${(gstin || cin) ? `
        <div class="section">
            <h2 class="section-title"><i class="fa-solid fa-building-circle-check"></i><span>Company Information</span></h2>
            <div class="company-info">
                ${gstin ? `
                <div class="company-row">
                    <div class="company-label"><i class="fa-solid fa-file-invoice"></i><span>GSTIN</span></div>
                    <div class="company-value">${esc(gstin)}</div>
                </div>` : ''}
                ${cin ? `
                <div class="company-row">
                    <div class="company-label"><i class="fa-solid fa-id-card"></i><span>CIN</span></div>
                    <div class="company-value">${esc(cin)}</div>
                </div>` : ''}
            </div>
        </div>` : ''}

        <div class="footer">© Konsyl Pharmaceuticals Private Limited. All rights reserved.</div>

    </div>
</div>
</body>
</html>
    `;
};

// ---------- Component ----------
const ContactUsComponent = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    const [contactData, setContactData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOffers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await request(
                GET_CONTACT_US_API(),
                HTTP_METHODS.GET,
                {}
            );
            Clipboard.setString(JSON.stringify(result?.response?.data?.data))
            const data = result?.response?.data?.data;
            if (!data) {
                setError('No data received');
                return;
            }
            setContactData(data);
        } catch (err) {
            setError(err?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOffers();
    }, [fetchOffers]);

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            {/* Header */}
            <View
                style={[
                    styles.header,
                    {
                        paddingTop: insets.top > 0 ? insets.top : 14,
                        paddingHorizontal: isTablet ? 24 : 16,
                        backgroundColor: '#f3f6fb',
                    },
                ]}
            >
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <Icon name="arrow-left" size={isTablet ? 20 : 16} color="black" />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { fontSize: isTablet ? 22 : 19 }]}>
                    {`Contact Us`}
                </Text>
                <View style={{ width: 20 }} />
            </View>

            {/* Content */}
            <View style={{ flex: 1 }}>
                {loading && (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={colors.ICON_COLOR_PRIMARY} />
                    </View>
                )}

                {!loading && error && (
                    <View style={styles.centerContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity onPress={fetchOffers} style={styles.retryButton}>
                            <Text style={styles.retryText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {!loading && !error && contactData && (
                    <WebView
                        originWhitelist={['*']}
                        source={{ html: buildContactHtml(contactData) }}
                        style={{
                            flex: 1,
                            maxWidth: isTablet ? 900 : '100%',
                            alignSelf: 'center',
                            width: '100%',
                        }}
                        scalesPageToFit={Platform.OS === 'android'}
                        showsVerticalScrollIndicator={false}
                        onError={(syntheticEvent) => {
                            const { nativeEvent } = syntheticEvent;
                            setError(nativeEvent?.description || 'Failed to load content');
                        }}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.ICON_COLOR_PRIMARY,
        paddingVertical: 14,
    },
    headerTitle: {
        flex: 1,
        color: 'black',
        fontWeight: '500',
        fontFamily: fonts.POPPINS_REGULAR,
        marginLeft: 20,
    },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    errorText: {
        fontSize: 15,
        color: '#c0392b',
        textAlign: 'center',
        marginBottom: 12,
        fontFamily: fonts.POPPINS_REGULAR,
    },
    retryButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: colors.ICON_COLOR_PRIMARY,
        borderRadius: 8,
    },
    retryText: {
        color: '#fff',
        fontWeight: '600',
        fontFamily: fonts.POPPINS_REGULAR,
    },
});

export default ContactUsComponent;
export { ContactUsComponent };