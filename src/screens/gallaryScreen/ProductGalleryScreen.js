/**
 * ProductGalleryScreen
 * ------------------------------------------------------------------
 * Thumbnail grid built from the same product-array prop, responsive
 * across phone / tablet / iPad (2-5 columns). Tapping a thumbnail
 * opens ProductImageViewer at that exact image.
 *
 * Usage:
 *   <ProductGalleryScreen data={products} />   // products = jsonformatter.txt array
 */
import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    Image,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import fonts from '../assets/fonts/fonts';
import ProductImageViewer from './ProductImageViewer';

const GRID_GAP = 12;

const getColumns = (shortestSide) => {
    if (shortestSide >= 900) return 5; // large iPad
    if (shortestSide >= 600) return 4; // iPad mini / Android tablet
    return 2;                          // phone, either orientation
};

// Same flattening rule as the viewer, kept in sync so tapping a tile
// opens the viewer at the right flattened index.
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
            });
        });
    });
    return flat;
};

const ProductGalleryScreen = ({ data }) => {
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const shortestSide = Math.min(width, height);
    const columns = getColumns(shortestSide);

    const images = useMemo(() => flattenProductImages(data), [data]);
    const [viewerVisible, setViewerVisible] = useState(false);
    const [startIndex, setStartIndex] = useState(0);

    const contentWidth = width - insets.left - insets.right;
    const tileSize = (contentWidth - GRID_GAP * (columns + 1)) / columns;

    const openViewerAt = (index) => {
        setStartIndex(index);
        setViewerVisible(true);
    };

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            <FlatList
                data={images}
                key={columns} // force re-layout when column count changes (rotation)
                keyExtractor={(item, i) => `${item.productId}-${i}`}
                numColumns={columns}
                contentContainerStyle={{
                    paddingHorizontal: GRID_GAP,
                    paddingTop: GRID_GAP,
                    paddingBottom: insets.bottom + GRID_GAP,
                }}
                columnWrapperStyle={columns > 1 ? { gap: GRID_GAP } : undefined}
                ItemSeparatorComponent={() => <View style={{ height: GRID_GAP }} />}
                renderItem={({ item, index }) => (
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={[styles.tile, { width: tileSize, height: tileSize }]}
                        onPress={() => openViewerAt(index)}
                    >
                        <Image source={{ uri: item.url }} style={styles.tileImage} resizeMode="cover" />
                        <View style={styles.tileLabelWrap}>
                            <Text style={styles.tileLabel} numberOfLines={1}>
                                {item.productName}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyWrap}>
                        <Text style={styles.emptyText}>No product images to show</Text>
                    </View>
                }
            />

            <ProductImageViewer
                visible={viewerVisible}
                data={data}
                initialIndex={startIndex}
                onClose={() => setViewerVisible(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#fff' },
    tile: {
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#F2F3F5',
    },
    tileImage: { width: '100%', height: '100%' },
    tileLabelWrap: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 8,
        paddingVertical: 6,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    tileLabel: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
        fontFamily: fonts.POPPINS_REGULAR,
    },
    emptyWrap: { padding: 40, alignItems: 'center' },
    emptyText: { color: '#888' },
});

export default ProductGalleryScreen;