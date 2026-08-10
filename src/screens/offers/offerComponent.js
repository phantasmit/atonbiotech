// import React, { useState, useCallback, useEffect } from 'react';
// import {
//     View,
//     Text,
//     TouchableOpacity,
//     FlatList,
//     StyleSheet,
//     Image,
//     RefreshControl,
//     ActivityIndicator,
//     useWindowDimensions,
//     Platform,
// } from 'react-native';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import colors from '../../assets/appColor/colors';
// import fonts from '../../assets/fonts/fonts';
// import { useDispatch, useSelector } from 'react-redux';
// import { request } from '../../services/services';
// import { GET_OFFERS_API } from '../../services/api-end-points';
// import { HTTP_METHODS } from '../../services/api-constants';

// // ---------- Helpers ----------

// // Formats an ISO date string -> "05 Aug 2026"
// const formatDate = (isoString) => {
//     if (!isoString) return '';
//     const d = new Date(isoString);
//     if (isNaN(d.getTime())) return '';
//     const day = String(d.getDate()).padStart(2, '0');
//     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//     return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
// };

// const isOfferExpired = (endDate) => {
//     if (!endDate) return false;
//     const end = new Date(endDate);
//     if (isNaN(end.getTime())) return false;
//     return end.getTime() < Date.now();
// };

// // ---------- Component ----------
// const OfferComponent = () => {
//     const route = useRoute();
//     const navigation = useNavigation();
//     const dispatch = useDispatch();
//     const insets = useSafeAreaInsets();
//     const { width } = useWindowDimensions();

//     // Responsive column count: phone = 1, tablet/iPad = 2, large tablet/landscape = 3
//     const numColumns = width >= 1000 ? 3 : width >= 700 ? 2 : 1;
//     const isTablet = width >= 700;

//     const [offers, setOffers] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [refreshing, setRefreshing] = useState(false);
//     const [error, setError] = useState(null);

//     const fetchOffers = useCallback(async (isRefresh = false) => {
//         try {
//             if (isRefresh) {
//                 setRefreshing(true);
//             } else {
//                 setLoading(true);
//             }
//             setError(null);
//             const result = await request(
//                 GET_OFFERS_API(),
//                 HTTP_METHODS.GET,
//                 {}
//             );
//             const data = result?.response?.data?.data;
//             setOffers(Array.isArray(data) ? data : []);
//         } catch (err) {
//             setError(err?.message || 'Something went wrong');
//         } finally {
//             setLoading(false);
//             setRefreshing(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchOffers();
//     }, [fetchOffers]);

//     const renderOfferCard = useCallback(({ item }) => {
//         const expired = isOfferExpired(item.end_date);

//         return (
//             <View
//                 style={[
//                     styles.card,
//                     numColumns > 1 && { flex: 1 / numColumns, marginHorizontal: 6 },
//                     numColumns === 1 && { marginHorizontal: 0 },
//                 ]}
//             >
//                 <View style={styles.imageWrapper}>
//                     {item.image ? (
//                         <Image
//                             source={{ uri: item.image }}
//                             style={styles.image}
//                             resizeMode="cover"
//                         />
//                     ) : (
//                         <View style={[styles.image, styles.imagePlaceholder]}>
//                             <Icon name="picture-o" size={32} color="#c7cdd6" />
//                         </View>
//                     )}

//                     {expired && (
//                         <View style={styles.expiredBadge}>
//                             <Text style={styles.expiredBadgeText}>Expired</Text>
//                         </View>
//                     )}
//                 </View>

//                 <View style={styles.cardBody}>
//                     <Text
//                         style={[styles.cardTitle, { fontSize: isTablet ? 17 : 15 }]}
//                         numberOfLines={2}
//                     >
//                         {item.title}
//                     </Text>

//                     <View style={styles.dateRow}>
//                         <View style={styles.dateItem}>
//                             <Icon name="calendar" size={11} color="#4f46e5" />
//                             <Text style={styles.dateLabel}>Starts</Text>
//                             <Text style={styles.dateValue}>{formatDate(item.start_date)}</Text>
//                         </View>

//                         <View style={styles.dateDivider} />

//                         <View style={styles.dateItem}>
//                             <Icon name="calendar-times-o" size={11} color="#e11d48" />
//                             <Text style={styles.dateLabel}>Ends</Text>
//                             <Text style={styles.dateValue}>{formatDate(item.end_date)}</Text>
//                         </View>
//                     </View>
//                 </View>
//             </View>
//         );
//     }, [numColumns, isTablet]);

//     return (
//         <View style={{ flex: 1, backgroundColor: '#f5f7fb' }}>
//             {/* Header */}
//             <View
//                 style={[
//                     styles.header,
//                     {
//                         paddingTop: insets.top > 0 ? insets.top : 14,
//                         paddingHorizontal: isTablet ? 24 : 16,
//                         backgroundColor: '#f3f6fb',
//                     },
//                 ]}
//             >
//                 <TouchableOpacity
//                     onPress={() => navigation.goBack()}
//                     hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
//                 >
//                     <Icon name="arrow-left" size={isTablet ? 20 : 16} color="black" />
//                 </TouchableOpacity>
//                 <Text style={[styles.headerTitle, { fontSize: isTablet ? 22 : 19 }]}>
//                     {`Offers`}
//                 </Text>
//                 <View style={{ width: 20 }} />
//             </View>

//             {/* Content */}
//             {loading ? (
//                 <View style={styles.centerContainer}>
//                     <ActivityIndicator size="large" color={colors.ICON_COLOR_PRIMARY} />
//                 </View>
//             ) : error ? (
//                 <View style={styles.centerContainer}>
//                     <Icon name="exclamation-circle" size={30} color="#c0392b" style={{ marginBottom: 10 }} />
//                     <Text style={styles.errorText}>{error}</Text>
//                     <TouchableOpacity onPress={() => fetchOffers()} style={styles.retryButton}>
//                         <Text style={styles.retryText}>Retry</Text>
//                     </TouchableOpacity>
//                 </View>
//             ) : offers.length === 0 ? (
//                 <View style={styles.centerContainer}>
//                     <Icon name="tag" size={30} color="#c7cdd6" style={{ marginBottom: 10 }} />
//                     <Text style={styles.emptyText}>No offers available right now</Text>
//                 </View>
//             ) : (
//                 <FlatList
//                     key={numColumns} // force re-layout when column count changes (rotation/tablet)
//                     data={offers}
//                     keyExtractor={(item) => String(item.id)}
//                     renderItem={renderOfferCard}
//                     numColumns={numColumns}
//                     contentContainerStyle={[
//                         styles.listContent,
//                         { paddingHorizontal: isTablet ? 18 : 12 },
//                     ]}
//                     columnWrapperStyle={numColumns > 1 ? { marginBottom: 4 } : undefined}
//                     refreshControl={
//                         <RefreshControl
//                             refreshing={refreshing}
//                             onRefresh={() => fetchOffers(true)}
//                             colors={[colors.ICON_COLOR_PRIMARY]}
//                             tintColor={colors.ICON_COLOR_PRIMARY}
//                         />
//                     }
//                     showsVerticalScrollIndicator={false}
//                 />
//             )}
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     header: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         backgroundColor: colors.ICON_COLOR_PRIMARY,
//         paddingVertical: 14,
//     },
//     headerTitle: {
//         flex: 1,
//         color: 'black',
//         fontWeight: '500',
//         fontFamily: fonts.POPPINS_REGULAR,
//         marginLeft: 20,
//     },
//     centerContainer: {
//         flex: 1,
//         alignItems: 'center',
//         justifyContent: 'center',
//         paddingHorizontal: 24,
//     },
//     errorText: {
//         fontSize: 15,
//         color: '#c0392b',
//         textAlign: 'center',
//         marginBottom: 12,
//         fontFamily: fonts.POPPINS_REGULAR,
//     },
//     emptyText: {
//         fontSize: 15,
//         color: '#6b7280',
//         textAlign: 'center',
//         fontFamily: fonts.POPPINS_REGULAR,
//     },
//     retryButton: {
//         paddingHorizontal: 20,
//         paddingVertical: 10,
//         backgroundColor: colors.ICON_COLOR_PRIMARY,
//         borderRadius: 8,
//     },
//     retryText: {
//         color: '#fff',
//         fontWeight: '600',
//         fontFamily: fonts.POPPINS_REGULAR,
//     },
//     listContent: {
//         paddingTop: 14,
//         paddingBottom: 24,
//     },
//     card: {
//         backgroundColor: '#ffffff',
//         borderRadius: 14,
//         marginBottom: 14,
//         overflow: 'hidden',
//         borderWidth: 1,
//         borderColor: '#e5e7eb',
//         ...Platform.select({
//             ios: {
//                 shadowColor: '#000',
//                 shadowOpacity: 0.06,
//                 shadowRadius: 8,
//                 shadowOffset: { width: 0, height: 3 },
//             },
//             android: {
//                 elevation: 3,
//             },
//         }),
//     },
//     imageWrapper: {
//         width: '100%',
//         aspectRatio: 16 / 9,
//         backgroundColor: '#eef2ff',
//         position: 'relative',
//     },
//     image: {
//         width: '100%',
//         height: '100%',
//     },
//     imagePlaceholder: {
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     expiredBadge: {
//         position: 'absolute',
//         top: 8,
//         right: 8,
//         backgroundColor: 'rgba(17, 24, 39, 0.85)',
//         paddingHorizontal: 10,
//         paddingVertical: 4,
//         borderRadius: 20,
//     },
//     expiredBadgeText: {
//         color: '#fff',
//         fontSize: 11,
//         fontWeight: '600',
//         fontFamily: fonts.POPPINS_REGULAR,
//     },
//     cardBody: {
//         padding: 12,
//     },
//     cardTitle: {
//         fontWeight: '600',
//         color: '#111827',
//         fontFamily: fonts.POPPINS_REGULAR,
//         marginBottom: 10,
//         lineHeight: 20,
//     },
//     dateRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: '#f8fafc',
//         borderWidth: 1,
//         borderColor: '#e5e7eb',
//         borderRadius: 10,
//         paddingVertical: 8,
//         paddingHorizontal: 10,
//     },
//     dateItem: {
//         flex: 1,
//         alignItems: 'center',
//     },
//     dateDivider: {
//         width: 1,
//         height: 24,
//         backgroundColor: '#e5e7eb',
//         marginHorizontal: 6,
//     },
//     dateLabel: {
//         fontSize: 10,
//         color: '#6b7280',
//         marginTop: 2,
//         fontFamily: fonts.POPPINS_REGULAR,
//     },
//     dateValue: {
//         fontSize: 12,
//         fontWeight: '600',
//         color: '#111827',
//         marginTop: 1,
//         fontFamily: fonts.POPPINS_REGULAR,
//     },
// });

// export default OfferComponent;
// export { OfferComponent };

import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Image,
    RefreshControl,
    ActivityIndicator,
    useWindowDimensions,
    Platform,
    Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import ImageViewer from 'react-native-image-zoom-viewer';
import colors from '../../assets/appColor/colors';
import fonts from '../../assets/fonts/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { request } from '../../services/services';
import { GET_OFFERS_API } from '../../services/api-end-points';
import { HTTP_METHODS } from '../../services/api-constants';

// ---------- Helpers ----------

const formatDate = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const isOfferExpired = (endDate) => {
    if (!endDate) return false;
    const end = new Date(endDate);
    if (isNaN(end.getTime())) return false;
    return end.getTime() < Date.now();
};

// ---------- Component ----------
const OfferComponent = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();

    const numColumns = width >= 1000 ? 3 : width >= 700 ? 2 : 1;
    const isTablet = width >= 700;

    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // Full-screen zoom viewer state
    const [viewerVisible, setViewerVisible] = useState(false);
    const [viewerIndex, setViewerIndex] = useState(0);

    const fetchOffers = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);
            const result = await request(
                GET_OFFERS_API(),
                HTTP_METHODS.GET,
                {}
            );
            const data = result?.response?.data?.data;
            setOffers(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err?.message || 'Something went wrong');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchOffers();
    }, [fetchOffers]);

    // All offer images, in list order, mapped to the format ImageViewer expects
    const viewerImages = offers
        .filter((o) => !!o.image)
        .map((o) => ({ url: o.image }));

    const openViewer = useCallback((offerImage) => {
        const idx = offers.filter((o) => !!o.image).findIndex((o) => o.image === offerImage);
        setViewerIndex(idx >= 0 ? idx : 0);
        setViewerVisible(true);
    }, [offers]);

    const renderOfferCard = useCallback(({ item }) => {
        const expired = isOfferExpired(item.end_date);

        return (
            <View
                style={[
                    styles.card,
                    numColumns > 1 && { flex: 1 / numColumns, marginHorizontal: 6 },
                    numColumns === 1 && { marginHorizontal: 0 },
                ]}
            >
                <TouchableOpacity
                    style={styles.imageWrapper}
                    activeOpacity={0.85}
                    disabled={!item.image}
                    onPress={() => openViewer(item.image)}
                >
                    {item.image ? (
                        <Image
                            source={{ uri: item.image }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.image, styles.imagePlaceholder]}>
                            <Icon name="picture-o" size={32} color="#c7cdd6" />
                        </View>
                    )}

                    {item.image && (
                        <View style={styles.zoomHint}>
                            <Icon name="search-plus" size={12} color="#fff" />
                        </View>
                    )}

                    {expired && (
                        <View style={styles.expiredBadge}>
                            <Text style={styles.expiredBadgeText}>Expired</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.cardBody}>
                    <Text
                        style={[styles.cardTitle, { fontSize: isTablet ? 17 : 15 }]}
                        numberOfLines={2}
                    >
                        {item.title}
                    </Text>

                    <View style={styles.dateRow}>
                        <View style={styles.dateItem}>
                            <Icon name="calendar" size={11} color="#4f46e5" />
                            <Text style={styles.dateLabel}>Starts</Text>
                            <Text style={styles.dateValue}>{formatDate(item.start_date)}</Text>
                        </View>

                        <View style={styles.dateDivider} />

                        <View style={styles.dateItem}>
                            <Icon name="calendar-times-o" size={11} color="#e11d48" />
                            <Text style={styles.dateLabel}>Ends</Text>
                            <Text style={styles.dateValue}>{formatDate(item.end_date)}</Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    }, [numColumns, isTablet, openViewer]);

    return (
        <View style={{ flex: 1, backgroundColor: '#f5f7fb' }}>
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
                    {`Offers`}
                </Text>
                <View style={{ width: 20 }} />
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.ICON_COLOR_PRIMARY} />
                </View>
            ) : error ? (
                <View style={styles.centerContainer}>
                    <Icon name="exclamation-circle" size={30} color="#c0392b" style={{ marginBottom: 10 }} />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={() => fetchOffers()} style={styles.retryButton}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : offers.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Icon name="tag" size={30} color="#c7cdd6" style={{ marginBottom: 10 }} />
                    <Text style={styles.emptyText}>No offers available right now</Text>
                </View>
            ) : (
                <FlatList
                    key={numColumns}
                    data={offers}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderOfferCard}
                    numColumns={numColumns}
                    contentContainerStyle={[
                        styles.listContent,
                        { paddingHorizontal: isTablet ? 18 : 12 },
                    ]}
                    columnWrapperStyle={numColumns > 1 ? { marginBottom: 4 } : undefined}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchOffers(true)}
                            colors={[colors.ICON_COLOR_PRIMARY]}
                            tintColor={colors.ICON_COLOR_PRIMARY}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Full-screen zoomable image viewer */}
            <Modal
                visible={viewerVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setViewerVisible(false)}
                statusBarTranslucent
            >
                <ImageViewer
                    imageUrls={viewerImages}
                    index={viewerIndex}
                    onChange={(idx) => setViewerIndex(idx ?? 0)}
                    enableSwipeDown
                    onSwipeDown={() => setViewerVisible(false)}
                    onCancel={() => setViewerVisible(false)}
                    backgroundColor="rgba(0,0,0,0.95)"
                    saveToLocalByLongPress={false}
                    renderHeader={() => (
                        <TouchableOpacity
                            style={[styles.closeButton, { top: insets.top + 12 }]}
                            onPress={() => setViewerVisible(false)}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        >
                            <Icon name="times" size={20} color="#fff" />
                        </TouchableOpacity>
                    )}
                    renderIndicator={(currentIndex, allSize) =>
                        allSize > 1 ? (
                            <View style={[styles.indicatorPill, { top: insets.top + 14 }]}>
                                <Text style={styles.indicatorText}>{currentIndex} / {allSize}</Text>
                            </View>
                        ) : null
                    }
                />
            </Modal>
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
    emptyText: {
        fontSize: 15,
        color: '#6b7280',
        textAlign: 'center',
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
    listContent: {
        paddingTop: 14,
        paddingBottom: 24,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        marginBottom: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOpacity: 0.06,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 3 },
            },
            android: {
                elevation: 3,
            },
        }),
    },
    imageWrapper: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: '#eef2ff',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    zoomHint: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: 'rgba(17, 24, 39, 0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    expiredBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(17, 24, 39, 0.85)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    expiredBadgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
        fontFamily: fonts.POPPINS_REGULAR,
    },
    cardBody: {
        padding: 12,
    },
    cardTitle: {
        fontWeight: '600',
        color: '#111827',
        fontFamily: fonts.POPPINS_REGULAR,
        marginBottom: 10,
        lineHeight: 20,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    dateItem: {
        flex: 1,
        alignItems: 'center',
    },
    dateDivider: {
        width: 1,
        height: 24,
        backgroundColor: '#e5e7eb',
        marginHorizontal: 6,
    },
    dateLabel: {
        fontSize: 10,
        color: '#6b7280',
        marginTop: 2,
        fontFamily: fonts.POPPINS_REGULAR,
    },
    dateValue: {
        fontSize: 12,
        fontWeight: '600',
        color: '#111827',
        marginTop: 1,
        fontFamily: fonts.POPPINS_REGULAR,
    },
    closeButton: {
        position: 'absolute',
        right: 16,
        zIndex: 10,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    indicatorPill: {
        position: 'absolute',
        alignSelf: 'center',
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 14,
    },
    indicatorText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        fontFamily: fonts.POPPINS_REGULAR,
    },
});

export default OfferComponent;
export { OfferComponent };