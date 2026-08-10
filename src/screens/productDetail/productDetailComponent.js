import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ActivityIndicator,
    useWindowDimensions,
    StatusBar,
    Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import colors from '../../assets/appColor/colors';
import fonts from '../../assets/fonts/fonts';
import { request } from '../../services/services';
import { PRODUCT_DETAI_API } from '../../services/api-end-points';
import { HTTP_METHODS } from '../../services/api-constants';

const ProductDetailComponent = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();

    // Responsive breakpoints
    const isTablet = width >= 600;
    // Wide layout: tablet/iPad in landscape (or big enough phones-in-landscape) -> side-by-side
    const isWideLayout = width >= 900;

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [viewerVisible, setViewerVisible] = useState(false);
    const [viewerIndex, setViewerIndex] = useState(0);

    const isMountedRef = useRef(true);
    const galleryListRef = useRef(null);
    const viewerListRef = useRef(null);

    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);

    const fetchProduct = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // NOTE: assumes PRODUCT_DETAIL_API(id) exists in api-end-points.js, e.g.
            //   export const PRODUCT_DETAIL_API = (id) => `/products/${id}`;
            
            const result = await request(
                PRODUCT_DETAI_API(route.params?.id),
                HTTP_METHODS.GET,
                {}
            );
            
            if (!isMountedRef.current) return;
            setProduct(result?.response?.data?.data ?? null);
        } catch (err) {
            if (!isMountedRef.current) return;
            setError(err?.message || 'Something went wrong');
        } finally {
            if (isMountedRef.current) setLoading(false);
        }
    }, [route.params?.id]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    // Order images so the primary one shows first
    const images = React.useMemo(() => {
        const list = product?.images ?? [];
        const primary = list.filter((img) => img.is_primary);
        const rest = list.filter((img) => !img.is_primary);
        return [...primary, ...rest];
    }, [product]);

    const openViewer = (index) => {
        setViewerIndex(index);
        setViewerVisible(true);
    };

    const closeViewer = () => setViewerVisible(false);

    const formatCurrency = (value) => `₹${(Number(value) || 0).toFixed(2)}`;

    // Width used for gallery thumbnails / hero images (accounts for wide split layout)
    const galleryWidth = isWideLayout ? width * 0.45 : width;

    const onGalleryScrollEnd = (e) => {
        const idx = Math.round(e.nativeEvent.contentOffset.x / galleryWidth);
        setActiveImageIndex(idx);
    };

    // ---------- Image gallery (inline, swipeable) ----------
    const renderGalleryImage = ({ item, index }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => openViewer(index)}
            style={{ width: galleryWidth, height: galleryWidth }}
        >
            <Image source={{ uri: item.url }} style={styles.galleryImage} resizeMode="contain" />
        </TouchableOpacity>
    );

    const renderGallery = () => {
        if (!images.length) {
            return (
                <View style={[styles.galleryImage, styles.imagePlaceholder, { width: galleryWidth, height: galleryWidth }]}>
                    <Icon name="medkit" size={48} color="#ccc" />
                </View>
            );
        }
        return (
            <View>
                <FlatList
                    ref={galleryListRef}
                    data={images}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderGalleryImage}
                    onMomentumScrollEnd={onGalleryScrollEnd}
                    style={{ width: galleryWidth }}
                />
                {images.length > 1 && (
                    <View style={styles.dotsRow}>
                        {images.map((_, i) => (
                            <View
                                key={i}
                                style={[styles.dot, i === activeImageIndex && styles.dotActive]}
                            />
                        ))}
                    </View>
                )}
                <Text style={styles.tapHint}>Tap image to enlarge</Text>
            </View>
        );
    };

    // ---------- Full-screen enlarged viewer ----------
    const renderViewerImage = ({ item }) => (
        // ScrollView with maximumZoomScale gives native pinch-to-zoom on both iOS & Android
        <ScrollView
            style={{ width, height }}
            maximumZoomScale={4}
            minimumZoomScale={1}
            centerContent
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
        >
            <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
                <Image source={{ uri: item.url }} style={styles.fullImage} resizeMode="contain" />
            </View>
        </ScrollView>
    );

    const onViewerScrollEnd = (e) => {
        const idx = Math.round(e.nativeEvent.contentOffset.x / width);
        setViewerIndex(idx);
    };

    const renderImageViewerModal = () => (
        <Modal
            visible={viewerVisible}
            transparent={false}
            animationType="fade"
            onRequestClose={closeViewer}
            statusBarTranslucent
        >
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <View style={styles.viewerContainer}>
                <FlatList
                    ref={viewerListRef}
                    data={images}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderViewerImage}
                    initialScrollIndex={viewerIndex}
                    getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
                    onMomentumScrollEnd={onViewerScrollEnd}
                />

                <TouchableOpacity
                    style={[styles.viewerCloseBtn, { top: insets.top + 30 }]}
                    onPress={closeViewer}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <Icon name="times" size={22} color="#fff" />
                </TouchableOpacity>

                {images.length > 1 && (
                    <View style={[styles.viewerCounter, { top: insets.top + 16 }]}>
                        <Text style={styles.viewerCounterText}>
                            {viewerIndex + 1} / {images.length}
                        </Text>
                    </View>
                )}
            </View>
        </Modal>
    );

    // ---------- Product info block (categories intentionally omitted) ----------
    const renderInfo = () => (
        <View style={[styles.infoWrap, isWideLayout && styles.infoWrapWide]}>
            <Text style={styles.name}>{product?.name}</Text>

            <View style={styles.priceRow}>
                <Text style={styles.mrp}>MRP {formatCurrency(product?.mrp)}</Text>
                {product?.ptr > 0 && (
                    <Text style={styles.ptr}>PTR {formatCurrency(product?.ptr)}</Text>
                )}
            </View>

            {!!product?.composition && (
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Composition</Text>
                    <Text style={styles.sectionValue}>{product.composition}</Text>
                </View>
            )}

            {!!product?.packaging && (
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Packaging</Text>
                    <Text style={styles.sectionValue}>{product.packaging}</Text>
                </View>
            )}

            {!!product?.packing_type && (
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Packing Type</Text>
                    <Text style={styles.sectionValue}>{product.packing_type}</Text>
                </View>
            )}

            {!!product?.medicine_per_strip && (
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Medicine Per Strip</Text>
                    <Text style={styles.sectionValue}>{product.medicine_per_strip}</Text>
                </View>
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerFlex}>
                <ActivityIndicator size="large" color="#3562a6" />
            </View>
        );
    }

    if (error || !product) {
        return (
            <View style={styles.centerFlex}>
                <Icon name="exclamation-triangle" size={36} color="#ccc" />
                <Text style={styles.errorText}>{error || 'Product not found'}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={fetchProduct}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top > 0 ? 14 : 14, backgroundColor: '#f3f6fb' }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <Icon name="arrow-left" size={16} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{route.params?.name}</Text>
                <View style={{ width: 20 }} />
            </View>

            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    isWideLayout && styles.scrollContentWide,
                ]}
                showsVerticalScrollIndicator={false}
            >
                {renderGallery()}
                {renderInfo()}
            </ScrollView>

            {renderImageViewerModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.ICON_COLOR_PRIMARY,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    headerTitle: {
        flex: 1,
        color: 'black',
        fontSize: 17,
        fontWeight: '500',
        fontFamily: fonts.POPPINS_REGULAR,
        marginLeft: 20,
    },

    centerFlex: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 },
    errorText: { fontSize: 14, color: '#666', textAlign: 'center' },
    retryBtn: {
        backgroundColor: '#3562a6',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 8,
    },
    retryText: { color: '#fff', fontWeight: '700', fontSize: 13 },

    scrollContent: { paddingBottom: 40 },
    // On wide/tablet-landscape screens: gallery and info sit side by side
    scrollContentWide: { flexDirection: 'row', alignItems: 'flex-start' },

    galleryImage: { width: '100%', height: '100%' },
    imagePlaceholder: {
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    dotsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        marginTop: 10,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#ddd',
    },
    dotActive: {
        backgroundColor: '#3562a6',
        width: 16,
    },
    tapHint: {
        textAlign: 'center',
        fontSize: 11,
        color: '#aaa',
        marginTop: 6,
    },

    infoWrap: { paddingHorizontal: 16, paddingTop: 20 },
    infoWrapWide: { flex: 1, paddingHorizontal: 24, paddingTop: 8 },

    name: { fontSize: 20, fontWeight: '700', color: '#222', marginBottom: 8 },
    priceRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
    mrp: { fontSize: 15, fontWeight: '700', color: '#333' },
    ptr: { fontSize: 15, fontWeight: '700', color: '#268872' },

    section: { marginBottom: 16 },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#999',
        textTransform: 'uppercase',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    sectionValue: { fontSize: 14, color: '#333', lineHeight: 20 },

    // ---------- Full-screen viewer ----------
    viewerContainer: { flex: 1, backgroundColor: '#000' },
    fullImage: { width: '100%', height: '100%' },
    viewerCloseBtn: {
        position: 'absolute',
        left: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    viewerCounter: {
        position: 'absolute',
        alignSelf: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    viewerCounterText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});

export default ProductDetailComponent;
export { ProductDetailComponent };
