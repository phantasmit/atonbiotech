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
import { GET_ABOUT_US_API, GET_CONTACT_US_API, GET_PRIVACY_POLICY_API, GET_TERM_CONDITION_API } from '../../services/api-end-points';
import { HTTP_METHODS } from '../../services/api-constants';

// ---------- Component ----------
const WebPageComponent = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();

    // Basic breakpoint: treat anything >= 768pt as tablet/iPad
    const isTablet = width >= 768;

    const [headerTitle, setTitle] = useState('')
    const [htmlContent, setHtmlContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOffers = useCallback(async (type) => {
        try {
            setLoading(true);
            setError(null);
            const result = await request(
                (type == 'aboutus') ? GET_ABOUT_US_API() : (type == 'term_condition') ? GET_TERM_CONDITION_API() : GET_PRIVACY_POLICY_API(),
                HTTP_METHODS.GET,
                {}
            );
            const data = result?.response?.data?.data;
            setTitle(data.title)
            setHtmlContent(data.content);
        } catch (err) {
            setError(err?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOffers(route.params?.type);
    }, [fetchOffers]);

    // Wrap the raw HTML fragment in a full document with responsive, readable styling
    const buildHtmlDocument = useCallback((bodyHtml) => {
        const baseFontSize = isTablet ? 18 : 15;
        const headingFontSize = isTablet ? 24 : 19;
        const contentPadding = isTablet ? 32 : 16;

        return `
            <!DOCTYPE html>
            <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
                <style>
                  * { box-sizing: border-box; }
                  html, body {
                    margin: 0;
                    padding: 0;
                    -webkit-text-size-adjust: 100%;
                  }
                  body {
                    font-family: -apple-system, Roboto, 'Segoe UI', sans-serif;
                    font-size: ${baseFontSize}px;
                    line-height: 1.6;
                    color: #333333;
                    padding: ${contentPadding}px;
                    max-width: 100%;
                    overflow-x: hidden;
                    word-wrap: break-word;
                  }
                  h1, h2, h3 {
                    color: #111111;
                    font-size: ${headingFontSize}px;
                    line-height: 1.3;
                    margin-top: 20px;
                    margin-bottom: 10px;
                  }
                  h2:first-child {
                    margin-top: 0;
                  }
                  p {
                    margin: 0 0 12px 0;
                  }
                  img {
                    max-width: 100%;
                    height: auto;
                  }
                  a {
                    color: #1a73e8;
                  }
                </style>
              </head>
              <body>
                ${bodyHtml}
              </body>
            </html>
        `;
    }, [isTablet]);

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
                <Text
                    style={[
                        styles.headerTitle,
                        { fontSize: isTablet ? 22 : 19 },
                    ]}
                >{headerTitle}</Text>
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

                {!loading && !error && (
                    <WebView
                        originWhitelist={['*']}
                        source={{ html: buildHtmlDocument(htmlContent) }}
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

export default WebPageComponent;
export { WebPageComponent };