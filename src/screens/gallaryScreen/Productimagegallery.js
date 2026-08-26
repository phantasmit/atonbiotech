// import React, { useState, useMemo,useRef,useCallback } from 'react';

// import {
//     View,
//     Text,
//     TouchableOpacity,
//     StyleSheet,
//     StatusBar,
//     Modal,
//     useWindowDimensions,
//     Dimensions,
//     Pressable,
//     FlatList,
//     Image,
//     Clipboard,
// } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import ImageViewer from 'react-native-image-zoom-viewer';
// import Icon from 'react-native-vector-icons/FontAwesome5';
// import { useNavigation,useFocusEffect } from '@react-navigation/native';
// import Orientation from 'react-native-orientation-locker';
// /**
//  * ----------------------------------------------------------------------
//  * ProductImageGallery
//  *
//  * Full-screen image gallery: swipe left/right between images, pinch or
//  * double-tap to zoom, back icon top-left, info icon top-right, and a
//  * bottom "x / y" pagination indicator. Responsive across phone /
//  * tablet / iPad via useWindowDimensions + safe-area insets.
//  *
//  * Props:
//  * - images: Array<{ id, url, is_primary? }>  (matches the API's `images` field)
//  * - initialIndex: number — which image to open on (default: index of
//  *   the primary image, or 0)
//  * - title: string — product name, shown in the info panel
//  * - infoData: { packaging?, mrp?, packing_type? } — extra fields shown
//  *   when the info icon is tapped
//  * - onBack: () => void — defaults to navigation.goBack() if you pass
//  *   `navigation`, otherwise no-op
//  * - navigation: React Navigation's navigation object (optional, used
//  *   only for the default back behavior)
//  *
//  * Usage:
//  * <ProductImageGallery
//  *   images={product.images}
//  *   title={product.name}
//  *   infoData={{ packaging: product.packaging, mrp: product.mrp, packing_type: product.packing_type }}
//  *   navigation={navigation}
//  * />
//  * ----------------------------------------------------------------------
//  */

// const flattenProductImages = (data) => {
//     const flat = [];
//     (Array.isArray(data) ? data : []).forEach((product,index) => {
//         const rawImages =
//             Array.isArray(product?.images) && product.images.length > 0
//                 ? product.images
//                 : product?.thumb
//                     ? [{ id: `${product.id}-thumb`, url: product.thumb, is_primary: true }]
//                     : [];

//         rawImages.forEach((img) => {
//             if (!img?.url) return;
//             flat.push({
//                 url: img.url,
//                 productId: product.id,
//                 productName: product.name,
//                 packaging: product.packaging,
//                 packingType: product.packing_type,
//                 mrp: product.mrp,
//                 productIndex:index
//             });
//         });
//     });
//     return flat;
// };
// //const { width : DWidth } = Dimensions.get('window');
// const { width: DWidth, height: DHeight } = useWindowDimensions();

// export default function ProductImageGallery({ route, navigation }) {
//     const {
//         images,
//         initialIndex = 0,
//         selectedProductId,
//         title,
//         infoData = {}
//     } = route.params || {};
//     //const navigation = useNavigation();
//     const insets = useSafeAreaInsets();
//     const { width } = useWindowDimensions();
//     const isTablet = width >= 600;

//     const [initIndex, setInitIndex] = useState(initialIndex);
//     const [currentIndex, setCurrentIndex] = useState(0);
//     const [infoVisible, setInfoVisible] = useState(false);
//     //
//     const [drawerVisible, setDrawerVisible] = useState(false);
//     const imageViewerRef = useRef(null);


//     useFocusEffect(
//         useCallback(() => {
//           // Lock this screen to landscape
//           Orientation.lockToLandscape();

//           // When screen is removed/unfocused
//           return () => {
//             // Unlock orientation
//             Orientation.unlockAllOrientations();

//             // Optional: force portrait after leaving
//             Orientation.lockToPortrait();
//           };
//         }, [])
//       );
//     const openDrawer = () => {
//         setDrawerVisible(true);
//     };

//     const closeDrawer = () => {
//         setDrawerVisible(false);
//     };

//     const imageUrls = useMemo(() => flattenProductImages(images), [images]);

//     const resolvedInitialIndex = useMemo(() => {
//         //if (typeof initIndex === 'number') return initIndex;
//         const primaryIdx = imageUrls.findIndex(item => item.productId === selectedProductId);
//         // const primaryIdx = images.findIndex((img) => img.is_primary);
//         setCurrentIndex(primaryIdx >= 0 ? primaryIdx : 0)
//          return primaryIdx >= 0 ? primaryIdx : 0;
//         //return 16;
//     }, [images, initIndex]);

//     const iconSize = isTablet ? 22 : 18;
//     const iconButtonSize = isTablet ? 44 : 38;

//     const handleBack = () => {
//         //if (onBack) return onBack();
//         //if (navigation?.goBack) return navigation.goBack();
//         navigation.goBack();
//     };

//     if (!imageUrls.length) {
//         return (
//             <View style={styles.emptyContainer}>
//                 <StatusBar barStyle="light-content" backgroundColor="#000" />
//                 <Text style={styles.emptyText}>No images available</Text>
//                 <TouchableOpacity onPress={handleBack} style={styles.emptyBackBtn}>
//                     <Text style={styles.emptyBackText}>Go Back</Text>
//                 </TouchableOpacity>
//             </View>
//         );
//     }

//     const renderProductItem = ({ item, index }) => {
//         const isSelected = index === currentIndex;

//         return (
//             <Pressable
//                 onPress={() => selectProduct(index)}
//                 style={[
//                     styles.productItem,
//                     isSelected && styles.selectedProductItem,
//                 ]}
//             >
//                 <Image
//                     source={{ uri: item.thumb }}
//                     style={styles.productImage}
//                     resizeMode="contain"
//                 />

//                 <View style={styles.productInfo}>
//                     <Text
//                         style={[
//                             styles.productName,
//                             isSelected && styles.selectedProductName,
//                         ]}
//                         numberOfLines={2}
//                     >
//                         {item.name}
//                     </Text>


//                 </View>

//                 {isSelected && (
//                     <Icon
//                         name="check-circle"
//                         size={18}
//                         color="#5BAD4E"
//                     />
//                 )}
//             </Pressable>
//         );
//     };

//     return (
//         <View style={styles.container}>
//             <StatusBar barStyle="light-content" backgroundColor="#000" />

//             <ImageViewer
//                 imageUrls={imageUrls}
//                 index={resolvedInitialIndex}
//                 onChange={(index) => {
//                     if (typeof index === 'number') setCurrentIndex(index);
//                 }}
//                 enableSwipeDown={false}
//                 enableImageZoom
//                 saveToLocalByLongPress={false}
//                 backgroundColor="#000"
//                 renderIndicator={(currentIdx, allSize) => (
//                     <View
//                         pointerEvents="none"
//                         style={[styles.indicatorWrap, { bottom: insets.bottom + 20 }]}
//                     >
//                         <View style={styles.indicatorPill}>
//                             <Text style={[styles.indicatorText, { fontSize: isTablet ? 15 : 13 }]}>
//                                 {currentIdx} / {allSize}
//                             </Text>
//                         </View>
//                     </View>
//                 )}
//                 renderHeader={() => (
//                     <View style={[styles.headerRow, { top: insets.top + 10 }]}>
//                         <TouchableOpacity
//                             onPress={handleBack}
//                             hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
//                             style={[
//                                 styles.iconButton,
//                                 { width: iconButtonSize, height: iconButtonSize, borderRadius: iconButtonSize / 2 },
//                             ]}
//                         >
//                             <Icon name="arrow-left" size={iconSize} color="#fff" solid />
//                         </TouchableOpacity>
//                         <View style={{flexDirection:"row"}}>
//                             <TouchableOpacity
//                                 onPress={openDrawer}
//                                 hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
//                                 style={[
//                                     styles.iconButton,
//                                     { width: iconButtonSize, height: iconButtonSize, borderRadius: iconButtonSize / 2 },
//                                 ]}
//                             >
//                                 <Icon
//                                     name="list"
//                                     size={iconSize}
//                                     color="#FFFFFF"
//                                     solid
//                                 />
//                             </TouchableOpacity>
//                             <TouchableOpacity
//                                 onPress={() => setInfoVisible(true)}
//                                 hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
//                                 style={[
//                                     styles.iconButton,
//                                     { width: iconButtonSize, height: iconButtonSize, borderRadius: iconButtonSize / 2 },
//                                 ]}
//                             >
//                                 <Icon name="info-circle" size={iconSize} color="#fff" solid />
//                             </TouchableOpacity>
//                         </View>
//                     </View>
//                 )}
//             />

//             {/* ---------------- Info panel ---------------- */}
//             <Modal
//                 visible={infoVisible}
//                 transparent
//                 animationType="fade"
//                 onRequestClose={() => setInfoVisible(false)}
//             >
//                 <TouchableOpacity
//                     style={styles.infoOverlay}
//                     activeOpacity={1}
//                     onPress={() => setInfoVisible(false)}
//                 >
//                     <View
//                         style={[
//                             styles.infoPanel,
//                             { paddingBottom: insets.bottom + 20, maxWidth: isTablet ? 480 : '100%' },
//                         ]}
//                     >
//                         {imageUrls[currentIndex]?.productName ? <Text style={styles.infoTitle}>{imageUrls[currentIndex]?.productName}</Text> : null}

//                         {imageUrls[currentIndex]?.packaging ? (
//                             <InfoRow label="Packaging" value={imageUrls[currentIndex]?.packaging} />
//                         ) : null}
//                         {imageUrls[currentIndex]?.packingType ? (
//                             <InfoRow label="Packing Type" value={imageUrls[currentIndex]?.packingType} />
//                         ) : null}
//                         {imageUrls[currentIndex]?.mrp ? <InfoRow label="MRP" value={`₹${imageUrls[currentIndex]?.mrp}`} /> : null}

//                         <TouchableOpacity
//                             onPress={() => setInfoVisible(false)}
//                             style={styles.infoCloseBtn}
//                         >
//                             <Text style={styles.infoCloseText}>Close</Text>
//                         </TouchableOpacity>
//                     </View>
//                 </TouchableOpacity>
//             </Modal>
//              {/* LEFT DRAWER MODAL */}
//              <Modal
//                 visible={drawerVisible}
//                 transparent
//                 animationType="none"
//                 onRequestClose={closeDrawer}
//             >
//                 <View style={styles.modalContainer}>

//                     {/* DARK OVERLAY */}
//                     <Pressable
//                         style={styles.overlay}
//                         onPress={closeDrawer}
//                     />

//                     {/* LEFT DRAWER */}
//                     <View
//                         style={[
//                             styles.drawer,
//                             {
//                                 paddingTop: insets.top,
//                             },
//                         ]}
//                     >

//                         {/* DRAWER HEADER */}
//                         <View style={styles.drawerHeader}>
//                             <Text style={styles.drawerTitle}>
//                                 Products
//                             </Text>

//                             <Pressable
//                                 onPress={closeDrawer}
//                                 style={styles.closeButton}
//                             >
//                                 <Icon
//                                     name="times"
//                                     size={20}
//                                     color="#333"
//                                 />
//                             </Pressable>
//                         </View>

//                         {/* PRODUCT LIST */}
//                         <FlatList
//                             data={images}
//                             keyExtractor={(item, index) =>
//                                 String(
//                                     item.productId ||
//                                     item.id ||
//                                     index
//                                 )
//                             }
//                             renderItem={renderProductItem}
//                             showsVerticalScrollIndicator={false}
//                             contentContainerStyle={
//                                 styles.productList
//                             }
//                         />

//                     </View>
//                 </View>
//             </Modal>
//         </View>
//     );


// }



// function InfoRow({ label, value }) {
//     return (
//         <View style={styles.infoRow}>
//             <Text style={styles.infoLabel}>{label}</Text>
//             <Text style={styles.infoValue}>{value}</Text>
//         </View>
//     );
// }

// /**
//  * ----------------------------------------------------------------------
//  * mapProductToGalleryProps
//  * Convenience helper — converts a product object (matching the API
//  * shape you're working with) into the props this screen expects.
//  *
//  * Usage:
//  *   navigation.navigate('ProductGallery', mapProductToGalleryProps(product));
//  * ----------------------------------------------------------------------
//  */
// export function mapProductToGalleryProps(product) {
//     return {
//         images: product.images || [],
//         title: product.name,
//         infoData: {
//             packaging: product.packaging,
//             packing_type: product.packing_type,
//             mrp: product.mrp,
//         },
//     };
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#000',
//     },
//     headerRow: {
//         position: 'absolute',
//         left: 16,
//         right: 16,
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         zIndex: 10,
//     },
//     iconButton: {
//         backgroundColor: 'rgba(0,0,0,0.45)',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     indicatorWrap: {
//         position: 'absolute',
//         left: 0,
//         right: 0,
//         alignItems: 'center',
//     },
//     indicatorPill: {
//         backgroundColor: 'rgba(0,0,0,0.55)',
//         paddingHorizontal: 14,
//         paddingVertical: 6,
//         borderRadius: 16,
//     },
//     indicatorText: {
//         color: '#fff',
//         fontWeight: '600',
//     },
//     emptyContainer: {
//         flex: 1,
//         backgroundColor: '#000',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     emptyText: {
//         color: '#fff',
//         fontSize: 16,
//         marginBottom: 16,
//     },
//     emptyBackBtn: {
//         paddingHorizontal: 20,
//         paddingVertical: 10,
//         borderRadius: 8,
//         borderWidth: 1,
//         borderColor: '#fff',
//     },
//     emptyBackText: {
//         color: '#fff',
//         fontSize: 14,
//     },
//     infoOverlay: {
//         flex: 1,
//         backgroundColor: 'rgba(0,0,0,0.5)',
//         justifyContent: 'flex-end',
//     },
//     infoPanel: {
//         backgroundColor: '#fff',
//         borderTopLeftRadius: 20,
//         borderTopRightRadius: 20,
//         paddingHorizontal: 24,
//         paddingTop: 20,
//         alignSelf: 'center',
//         width: '100%',
//     },
//     infoTitle: {
//         fontSize: 18,
//         fontWeight: '700',
//         color: '#1A1A1A',
//         marginBottom: 14,
//     },
//     infoRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         paddingVertical: 8,
//         borderBottomWidth: StyleSheet.hairlineWidth,
//         borderBottomColor: '#E4E7EB',
//     },
//     infoLabel: {
//         fontSize: 14,
//         color: '#8A8A8A',
//     },
//     infoValue: {
//         fontSize: 14,
//         color: '#1A1A1A',
//         fontWeight: '600',
//     },
//     infoCloseBtn: {
//         marginTop: 18,
//         paddingVertical: 12,
//         alignItems: 'center',
//         backgroundColor: '#F3F6FB',
//         borderRadius: 10,
//     },
//     infoCloseText: {
//         fontSize: 15,
//         fontWeight: '600',
//         color: '#4A7EC7',
//     },
//      /* ================================
//        DRAWER MODAL
//     ================================= */

//     modalContainer: {
//         flex: 1,
//         flexDirection: 'row',
//     },

//     overlay: {
//         ...StyleSheet.absoluteFillObject,
//         backgroundColor: 'rgba(0,0,0,0.45)',
//     },

//     drawer: {
//         width: DWidth * 0.4,
//         height: '100%',
//         backgroundColor: '#FFFFFF',
//         elevation: 10,
//     },

//     drawerHeader: {
//         height: 60,
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         paddingHorizontal: 18,
//         borderBottomWidth: 1,
//         borderBottomColor: '#EEEEEE',
//     },

//     drawerTitle: {
//         fontSize: 20,
//         fontWeight: '700',
//         color: '#222222',
//     },

//     closeButton: {
//         width: 38,
//         height: 38,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },

//     productList: {
//         paddingBottom: 30,
//     },

//     /* ================================
//        PRODUCT ROW
//     ================================= */

//     productItem: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         minHeight: 85,
//         paddingHorizontal: 14,
//         paddingVertical: 10,
//         borderBottomWidth: 1,
//         borderBottomColor: '#F0F0F0',
//     },

//     selectedProductItem: {
//         backgroundColor: '#F1F8EE',
//     },

//     productImage: {
//         width: 60,
//         height: 60,
//         borderRadius: 8,
//         backgroundColor: '#F5F5F5',
//     },

//     productInfo: {
//         flex: 1,
//         marginLeft: 12,
//         marginRight: 8,
//     },

//     productName: {
//         fontSize: 15,
//         fontWeight: '600',
//         color: '#333333',
//     },

//     selectedProductName: {
//         color: '#5BAD4E',
//     },

//     packaging: {
//         fontSize: 12,
//         color: '#777777',
//         marginTop: 4,
//     }
// });


import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Modal,
    useWindowDimensions,
    Dimensions,
    Pressable,
    FlatList,
    Image,
    Clipboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ImageViewer from 'react-native-image-zoom-viewer';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
//import Orientation from 'react-native-orientation-locker';

/**
 * ----------------------------------------------------------------------
 * ProductImageGallery
 *
 * Full-screen image gallery: swipe left/right between images, pinch or
 * double-tap to zoom, back icon top-left, list + info icons top-right,
 * a bottom "x / y" pagination indicator, and a left-side product drawer.
 * Responsive across phone / tablet / iPad via useWindowDimensions +
 * safe-area insets. Locks to landscape while focused, restores portrait
 * on leaving.
 * ----------------------------------------------------------------------
 */

const flattenProductImages = (data) => {
    const flat = [];
    (Array.isArray(data) ? data : []).forEach((product, index) => {
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
                composition: product.composition,
                mrp: product.mrp,
                productIndex: index,
            });
        });
    });
    return flat;
};

// NOTE: this must stay a plain, non-hook read — it runs once at module
// load time, outside of any component's render, so it cannot use
// useWindowDimensions() (that was the bug causing "Rendered fewer hooks
// than expected"). It's only used as a static fallback for the drawer's
// base width; the component itself re-applies the *live* width below.
const { width: DWidth } = Dimensions.get('window');

export default function ProductImageGallery({ route, navigation }) {
    const {
        images,
        initialIndex = 0,
        selectedProductId,
        title,
        infoData = {},
    } = route.params || {};

    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;

    const [initIndex, setInitIndex] = useState(initialIndex);
    const [productIds, setProductIds] = useState(selectedProductId);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [infoVisible, setInfoVisible] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const imageViewerRef = useRef(null);

    // useFocusEffect(
    //     useCallback(() => {
    //         // Lock this screen to landscape
    //         Orientation.lockToLandscape();

    //         // When screen is removed/unfocused
    //         return () => {
    //             // Unlock orientation
    //             Orientation.unlockAllOrientations();
    //             // Optional: force portrait after leaving
    //             Orientation.lockToPortrait();
    //         };
    //     }, [])
    // );

    const openDrawer = () => setDrawerVisible(true);
    const closeDrawer = () => setDrawerVisible(false);

    const imageUrls = useMemo(() => flattenProductImages(images), [images]);

    // Pure calculation only — no setState here. Computing the index during
    // render and calling setCurrentIndex() in the same pass (as the
    // original useMemo did) triggers React's "Cannot update a component
    // while rendering a different component" warning and can cause an
    // extra render loop. useEffect is the correct place for that side effect.
    const resolvedInitialIndex = useMemo(() => {
        const primaryIdx = imageUrls.findIndex((item) => item.productId === productIds);
        return primaryIdx >= 0 ? primaryIdx : 0;
    }, [imageUrls, productIds]);

    useEffect(() => {
        setCurrentIndex(resolvedInitialIndex);
    }, [resolvedInitialIndex]);

    const iconSize = isTablet ? 22 : 18;
    const iconButtonSize = isTablet ? 44 : 38;

    const handleBack = () => {
        navigation.goBack();
    };

    // const selectProduct = (index) => {
    //     // setCurrentIndex(index);
    //     // imageViewerRef.current?.goToPage?.(index);
    //     //closeDrawer();
    // };

    if (!imageUrls.length) {
        return (
            <View style={styles.emptyContainer}>
                <StatusBar barStyle="light-content" backgroundColor="#000" />
                <Text style={styles.emptyText}>No images available</Text>
                <TouchableOpacity onPress={handleBack} style={styles.emptyBackBtn}>
                    <Text style={styles.emptyBackText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderProductItem = ({ item, index }) => {
        const isSelected = index === initIndex;
        //selectProduct(index)
        return (
            <Pressable
                onPress={() => { setInitIndex(index), setProductIds(item.id), closeDrawer() }}
                style={[styles.productItem, isSelected && styles.selectedProductItem]}
            >
                <Image source={{ uri: item.thumb || item.url }} style={styles.productImage} resizeMode="contain" />

                <View style={styles.productInfo}>
                    <Text
                        style={[styles.productName, isSelected && styles.selectedProductName]}
                        numberOfLines={2}
                    >
                        {item.name || item.productName}
                    </Text>
                </View>

                {isSelected && <Icon name="check-circle" size={18} color="#5BAD4E" />}
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            <ImageViewer
                ref={imageViewerRef}
                imageUrls={imageUrls}
                index={resolvedInitialIndex}
                onChange={(index) => {
                    if (typeof index === 'number') setCurrentIndex(index);
                }}
                enableSwipeDown={false}
                enableImageZoom
                saveToLocalByLongPress={false}
                backgroundColor="#000"
                renderIndicator={(currentIdx, allSize) => (
                    <View pointerEvents="none" style={[styles.indicatorWrap, { bottom: insets.bottom + 20, flexDirection: "row", paddingHorizontal: 20 }]}>
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity
                                onPress={openDrawer}
                                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                                style={[
                                    styles.iconButton,
                                    { width: iconButtonSize, height: iconButtonSize, borderRadius: iconButtonSize / 2 },
                                ]}
                            >
                                <Icon name="list" size={iconSize} color="#FFFFFF" solid />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setInfoVisible(true)}
                                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                                style={[
                                    styles.iconButton,
                                    { width: iconButtonSize, height: iconButtonSize, borderRadius: iconButtonSize / 2, marginLeft: 10 },
                                ]}
                            >
                                <Icon name="info-circle" size={iconSize} color="#fff" solid />
                            </TouchableOpacity>
                        </View>
                        <View style={{ position: "absolute", marginLeft: Dimensions.get('window').width / 2 - 50 }}>

                            <View style={styles.indicatorPill}>
                                <Text style={[styles.indicatorText, { fontSize: isTablet ? 15 : 13 }]}>
                                    {currentIdx} / {allSize}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
                renderHeader={() => (
                    <View style={[styles.headerRow, { top: insets.top + 10 }]}>
                        <TouchableOpacity
                            onPress={handleBack}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                            style={[
                                styles.iconButton,
                                { width: iconButtonSize, height: iconButtonSize, borderRadius: iconButtonSize / 2 },
                            ]}
                        >
                            <Icon name="arrow-left" size={iconSize} color="#fff" solid />
                        </TouchableOpacity>
                        {/* <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity
                                onPress={openDrawer}
                                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                                style={[
                                    styles.iconButton,
                                    { width: iconButtonSize, height: iconButtonSize, borderRadius: iconButtonSize / 2 },
                                ]}
                            >
                                <Icon name="list" size={iconSize} color="#FFFFFF" solid />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setInfoVisible(true)}
                                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                                style={[
                                    styles.iconButton,
                                    { width: iconButtonSize, height: iconButtonSize, borderRadius: iconButtonSize / 2 },
                                ]}
                            >
                                <Icon name="info-circle" size={iconSize} color="#fff" solid />
                            </TouchableOpacity>
                        </View> */}
                    </View>
                )}
            />

            {/* ---------------- Info panel ---------------- */}
            <Modal visible={infoVisible} transparent animationType="fade" onRequestClose={() => setInfoVisible(false)}>
                <TouchableOpacity style={styles.infoOverlay} activeOpacity={1} onPress={() => setInfoVisible(false)}>
                    <View
                        style={[styles.infoPanel, { paddingBottom: insets.bottom + 20, maxWidth: isTablet ? 480 : '100%' }]}
                    >
                        {imageUrls[currentIndex]?.productName ? (
                            <Text style={styles.infoTitle}>{imageUrls[currentIndex]?.productName}</Text>
                        ) : null}

                        {imageUrls[currentIndex]?.packaging ? (
                            <InfoRow label="Packaging" value={imageUrls[currentIndex]?.packaging} />
                        ) : null}
                        {imageUrls[currentIndex]?.composition ? (
                            <InfoRow label="Composition" value={imageUrls[currentIndex]?.composition} />
                        ) : null}
                        {imageUrls[currentIndex]?.packingType ? (
                            <InfoRow label="Packing Type" value={imageUrls[currentIndex]?.packingType} />
                        ) : null}
                        {imageUrls[currentIndex]?.mrp ? (
                            <InfoRow label="MRP" value={`₹${imageUrls[currentIndex]?.mrp}`} />
                        ) : null}

                        <TouchableOpacity onPress={() => setInfoVisible(false)} style={styles.infoCloseBtn}>
                            <Text style={styles.infoCloseText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* LEFT DRAWER MODAL */}
            <Modal visible={drawerVisible} transparent animationType="none" onRequestClose={closeDrawer}>
                <View style={styles.modalContainer}>
                    {/* DARK OVERLAY */}
                    <Pressable style={styles.overlay} onPress={closeDrawer} />

                    {/* LEFT DRAWER — width uses the LIVE window width, not the
                        static module-scope DWidth, so it stays correct across
                        rotation/orientation changes (relevant since this screen
                        locks to landscape). */}
                    <View style={[styles.drawer, { paddingTop: insets.top, width: width * 0.4 }]}>
                        {/* DRAWER HEADER */}
                        <View style={styles.drawerHeader}>
                            <Text style={styles.drawerTitle}>Products</Text>

                            <Pressable onPress={closeDrawer} style={styles.closeButton}>
                                <Icon name="times" size={20} color="#333" />
                            </Pressable>
                        </View>

                        {/* PRODUCT LIST */}
                        <FlatList
                            data={images}
                            keyExtractor={(item, index) => String(item.productId || item.id || index)}
                            renderItem={renderProductItem}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.productList}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

function InfoRow({ label, value }) {
    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    );
}

/**
 * ----------------------------------------------------------------------
 * mapProductToGalleryProps
 * Convenience helper — converts a product object (matching the API
 * shape you're working with) into the props this screen expects.
 *
 * Usage:
 *   navigation.navigate('ProductGallery', mapProductToGalleryProps(product));
 * ----------------------------------------------------------------------
 */
export function mapProductToGalleryProps(product) {
    return {
        images: product.images || [],
        title: product.name,
        infoData: {
            packaging: product.packaging,
            packing_type: product.packing_type,
            mrp: product.mrp,
        },
    };
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    headerRow: {
        position: 'absolute',
        left: 16,
        right: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 10,
    },
    iconButton: {
        backgroundColor: 'rgba(0,0,0,0.45)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    indicatorWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
    indicatorPill: {
        backgroundColor: 'rgba(0,0,0,0.55)',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
    },
    indicatorText: { color: '#fff', fontWeight: '600' },
    emptyContainer: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: '#fff', fontSize: 16, marginBottom: 16 },
    emptyBackBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#fff',
    },
    emptyBackText: { color: '#fff', fontSize: 14 },
    infoOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    infoPanel: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 24,
        paddingTop: 20,
        alignSelf: 'center',
        width: '100%',
    },
    infoTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 14 },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E4E7EB',
    },
    infoLabel: { fontSize: 14, color: '#8A8A8A' },
    infoValue: { fontSize: 14, color: '#1A1A1A', fontWeight: '600', marginLeft: 5, flexWrap: 'wrap', textAlign: "left", maxWidth: Dimensions.get('window').width / 2 - 10 },
    infoCloseBtn: {
        marginTop: 18,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#F3F6FB',
        borderRadius: 10,
    },
    infoCloseText: { fontSize: 15, fontWeight: '600', color: '#4A7EC7' },

    /* DRAWER MODAL */
    modalContainer: { flex: 1, flexDirection: 'row' },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
    drawer: {
        width: DWidth * 0.4, // static fallback; overridden inline with live width above
        height: '100%',
        backgroundColor: '#FFFFFF',
        elevation: 10,
    },
    drawerHeader: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    drawerTitle: { fontSize: 20, fontWeight: '700', color: '#222222' },
    closeButton: { width: 38, height: 38, justifyContent: 'center', alignItems: 'center' },
    productList: { paddingBottom: 30 },

    /* PRODUCT ROW */
    productItem: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 85,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    selectedProductItem: { backgroundColor: '#F1F8EE' },
    productImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#F5F5F5' },
    productInfo: { flex: 1, marginLeft: 12, marginRight: 8 },
    productName: { fontSize: 15, fontWeight: '600', color: '#333333' },
    selectedProductName: { color: '#5BAD4E' },
    packaging: { fontSize: 12, color: '#777777', marginTop: 4 },
});