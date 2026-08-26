/**
 * ProductImageViewer
 * ------------------------------------------------------------------
 * Full-screen image viewer built from an array of product objects
 * (same shape as the JSON you shared). All images across all products
 * are flattened, in order, into one paginated, pinch-zoomable gallery.
 *
 * Required deps:
 *   npm i react-native-awesome-gallery react-native-reanimated react-native-gesture-handler
 *
 * react-native-reanimated needs its babel plugin - add this as the
 * LAST plugin in babel.config.js if it isn't already there:
 *   plugins: [ ... , 'react-native-reanimated/plugin']
 *
 * Usage:
 *   <ProductImageViewer
 *     visible={viewerVisible}
 *     data={products}          // the array from jsonformatter.txt
 *     initialIndex={0}         // which flattened image to open on
 *     onClose={() => setViewerVisible(false)}
 *   />
 */
import React, { useMemo, useState, useCallback } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    useWindowDimensions,
    StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Gallery from 'react-native-awesome-gallery';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/FontAwesome';
import colors from '../assets/appColor/colors';

const HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };
const BASE_WIDTH = 375;

// Classify by shorter side so rotation doesn't flip a phone into
// "tablet" layout, same convention used elsewhere in the app.
const getBreakpoint = (shortestSide) => {
    if (shortestSide >= 900) return 'largeTablet';
    if (shortestSide >= 600) return 'tablet';
    return 'phone';
};

const scaleSize = (width, size) => {
    const factor = width / BASE_WIDTH;
    const clamped = Math.min(Math.max(factor, 0.9), 1.25);
    return Math.round(size * clamped);
};

/**
 * Flattens `data` (array of products, each with an `images[]` array
 * and a `thumb`) into a single ordered list of viewable images, one
 * entry per image, carrying along the parent product's info for the
 * info panel. Falls back to `thumb` for products with an empty
 * `images` array; products with neither are skipped.
 */
const flattenProductImages = (data) => {
    const flat = [];
    (Array.isArray(data) ? data : []).forEach((product) => {
        const rawImages =
            Array.isArray(product?.images) && product.images.length > 0
                ? product.images
                : product?.thumb
                    ? [{ id: `${product.id}-thumb`, url: product.thumb, is_primary: true }]
                    : [];

        rawImages.forEach((img) => {
            if (!img?.url) return;
            flat.push({
                url: img.url,
                productId: product.id,
                productName: product.name,
                packaging: product.packaging,
                packingType: product.packing_type,
                mrp: product.mrp,
            });
        });
    });
    return flat;
};

const ProductImageViewer = ({ visible, data, initialIndex = 0, onClose }) => {
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const images = useMemo(() => flattenProductImages(data), [data]);
    const safeInitialIndex = Math.min(Math.max(initialIndex, 0), Math.max(images.length - 1, 0));

    const [index, setIndex] = useState(safeInitialIndex);
    const [infoVisible, setInfoVisible] = useState(false);

    const shortestSide = Math.min(width, height);
    const breakpoint = getBreakpoint(shortestSide);
    const isPhone = breakpoint === 'phone';
    const fontScale = (size) => scaleSize(width, size);

    const handleIndexChange = useCallback((i) => {
        setIndex(i);
    }, []);

    const handleClose = useCallback(() => {
        setInfoVisible(false);
        onClose && onClose();
    }, [onClose]);

    if (!visible) return null;

    // Nothing to show - close gracefully rather than rendering a blank
    // black screen.
    if (images.length === 0) {
        return (
            <Modal visible transparent animationType="fade" onRequestClose={handleClose}>
                <View style={styles.emptyWrap}>
                    <Text style={styles.emptyText}>No images available</Text>
                    <TouchableOpacity style={styles.emptyCloseBtn} onPress={handleClose}>
                        <Text style={styles.emptyCloseText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        );
    }

    const current = images[index] || images[0];

    return (
        <Modal
            visible={visible}
            transparent={false}
            animationType="fade"
            onRequestClose={handleClose}
            statusBarTranslucent
        >
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <View style={styles.container}>
                {/* Pinch-zoom + swipe pager. Reanimated drives the
                    transitions so paging and zoom stay smooth even on
                    lower-end Android devices. */}
                <Gallery
                    data={images.map((img) => img.url)}
                    initialIndex={safeInitialIndex}
                    onIndexChange={handleIndexChange}
                    keyExtractor={(_, i) => String(i)}
                    doubleTapScale={3}
                    maxScale={5}
                    style={styles.gallery}
                />

                {/* Top bar: back (left) + info (right) */}
                <View
                    style={[
                        styles.topBar,
                        {
                            paddingTop: insets.top + 10,
                            paddingHorizontal: isPhone ? 16 : 28,
                        },
                    ]}
                    pointerEvents="box-none"
                >
                    <TouchableOpacity style={styles.iconBtn} onPress={handleClose} hitSlop={HIT_SLOP}>
                        <Icon name="angle-left" size={fontScale(26)} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() => setInfoVisible((v) => !v)}
                        hitSlop={HIT_SLOP}
                    >
                        <Icon name="info-circle" size={fontScale(22)} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Page counter */}
                <View style={[styles.counterWrap, { bottom: insets.bottom + 22 }]} pointerEvents="none">
                    <View style={styles.counterPill}>
                        <Text style={[styles.counterText, { fontSize: fontScale(13) }]}>
                            {index + 1} / {images.length}
                        </Text>
                    </View>
                </View>

                {/* Info panel - slides/fades in over the image, doesn't
                    interrupt the pager underneath. Widens as a
                    right-anchored card on tablets/iPad instead of a
                    full-width sheet. */}
                {infoVisible && current && (
                    <Animated.View
                        entering={FadeIn.duration(200)}
                        exiting={FadeOut.duration(150)}
                        style={[
                            styles.infoPanel,
                            {
                                paddingBottom: insets.bottom + 18,
                                paddingHorizontal: isPhone ? 20 : 28,
                                maxWidth: isPhone ? undefined : 420,
                                alignSelf: isPhone ? 'stretch' : 'flex-end',
                                borderTopLeftRadius: isPhone ? 18 : 18,
                            },
                        ]}
                    >
                        <View style={styles.infoHeaderRow}>
                            <Text
                                style={[styles.infoTitle, { fontSize: fontScale(16) }]}
                                numberOfLines={2}
                            >
                                {current.productName}
                            </Text>
                            <TouchableOpacity onPress={() => setInfoVisible(false)} hitSlop={HIT_SLOP}>
                                <Icon name="close" size={fontScale(18)} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {!!current.packaging && (
                            <Text style={[styles.infoRow, { fontSize: fontScale(13) }]}>
                                Packaging: {current.packaging}
                            </Text>
                        )}
                        {!!current.packingType && (
                            <Text style={[styles.infoRow, { fontSize: fontScale(13) }]}>
                                Pack Type: {current.packingType}
                            </Text>
                        )}
                        <Text style={[styles.infoRow, { fontSize: fontScale(13) }]}>
                            MRP:{' '}
                            {Number(current.mrp) > 0 ? `₹${current.mrp}` : 'Not available'}
                        </Text>
                    </Animated.View>
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    gallery: { flex: 1 },

    topBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.16)',
    },

    counterWrap: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    counterPill: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.16)',
    },
    counterText: { color: '#fff', fontWeight: '600' },

    infoPanel: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(20,20,20,0.92)',
        paddingTop: 18,
        borderTopRightRadius: 18,
    },
    infoHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
        gap: 12,
    },
    infoTitle: { flex: 1, color: '#fff', fontWeight: '700' },
    infoRow: { color: '#DADADA', marginBottom: 6 },

    emptyWrap: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    emptyText: { color: '#fff', fontSize: 15 },
    emptyCloseBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: colors.ICON_COLOR_PRIMARY,
    },
    emptyCloseText: { color: '#fff', fontWeight: '700' },
});

export default ProductImageViewer;