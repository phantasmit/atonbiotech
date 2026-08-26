// import React, { useMemo, useState, useCallback, useEffect } from 'react';
// import {
//     View,
//     Text,
//     ScrollView,
//     TouchableOpacity,
//     Image,
//     StyleSheet,
//     useWindowDimensions,
//     RefreshControl,
//     ActivityIndicator,
//     Platform
// } from 'react-native';
// import GradientIconBadge from '../../component/GradientIconBadge';
// import AppHeader from '../../component/AppHeader';
// import { useNavigation, DrawerActions } from '@react-navigation/native';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchCategories, fetchHospitals, fetchLabels, fetchAppointment } from '../addDoctor/hospitalThunks';
// import ExpandableFab from '../../component/ExpandableFab';
// import colors from '../../assets/appColor/colors';
// import stacks from "../../navigation/stackEnum";
// import { changeStack } from '../../navigation/navigationSlice';
// import { useFileDownload } from '../../hooks/useFileDownload';
// import { getRemoteFileSize, hasEnoughStorage } from '../../lib/backgroundDownloader';
// import { request } from '../../services/services';
// import { GET_BROCHURE_API } from '../../services/api-end-points';
// import { HTTP_METHODS } from '../../services/api-constants';
// import { showSuccessToast, showErrorToast } from '../../utils/Toastutils';
// import GenericListModal from '../../modal/Genericlistmodal';
// /**
//  * ----------------------------------------------------------------------
//  * Section 1 — static menu items
//  * Each item: label, FontAwesome5 icon name, gradient colors, action key
//  * ----------------------------------------------------------------------
//  */
// const MENU_ITEMS = [
//     { key: 'allProducts', label: 'All Product', "screen_name": "product", type: 0, icon: 'pills', colors: ['#5BAD4E', '#7DC870'] },
//     { key: 'doctorList', label: 'Doctor List', "screen_name": "", type: 1, icon: 'user-md', colors: ['#C9C43A', '#5BAD4E'] },
//     { key: 'customLabel', label: 'Custom Label', "screen_name": "", type: 2, icon: 'bookmark', colors: ['#5BAD4E', '#6B9FE4'] },
//     { key: 'favorite', label: 'Favorite', "screen_name": "favorite", type: 3, icon: 'heart', colors: ['#4A7EC7', '#F08FA6'] },
//     { key: 'appointment', label: 'Appointment', "screen_name": "", type: 4, icon: 'calendar-check', colors: ['#4A7EC7', '#A67DB8'] },
//     { key: 'offer', label: 'Offer', "screen_name": "offers", type: 5, icon: 'tags', colors: ['#A67DB8', '#4A7EC7'] },
//     { key: 'brochure', label: 'Brochure', "screen_name": "", type: 6, icon: 'file-pdf', colors: ['#C9C43A', '#DED95F'] },
//     { key: 'logout', label: 'Logout', "screen_name": "", type: 7, icon: 'sign-out-alt', colors: ['#4A7EC7', '#6B9FE4'] },
// ];

// /**
//  * ----------------------------------------------------------------------
//  * Responsive breakpoints
//  * Adjust widths to match your design system if needed.
//  * ----------------------------------------------------------------------
//  */
// const BREAKPOINTS = {
//     phone: 480,      // < 480  -> phone
//     phoneLandscape: 700, // < 700 -> large phone / small tablet portrait
//     tablet: 1024,     // < 1024 -> tablet portrait / iPad mini-ish
//     // >= 1024         -> iPad landscape / large tablet
// };

// function getColumnCount(width) {
//     if (width < BREAKPOINTS.phone) return 3;
//     if (width < BREAKPOINTS.phoneLandscape) return 4;
//     if (width < BREAKPOINTS.tablet) return 5;
//     return 6;
// }

// /**
//  * ----------------------------------------------------------------------
//  * Grid item — shared by both sections
//  * ----------------------------------------------------------------------
//  */
// function GridItem({ itemWidth, onPress, children, label }) {
//     return (
//         <TouchableOpacity
//             activeOpacity={0.7}
//             onPress={onPress}
//             style={[styles.gridItem, { width: itemWidth }]}
//         >
//             {children}
//             <Text numberOfLines={2} style={styles.gridLabel}>
//                 {label}
//             </Text>


//         </TouchableOpacity>
//     );
// }

// /**
//  * ----------------------------------------------------------------------
//  * DashboardComponent
//  *
//  * Props:
//  * - categories: Array<{ id, name, iconUrl }>  (from backend, Section 2)
//  * - categoriesLoading: boolean
//  * - onMenuPress: (key: string) => void         (Section 1 item tapped)
//  * - onCategoryPress: (category) => void        (Section 2 item tapped)
//  * - onRefresh: () => Promise<void> | void       (optional pull-to-refresh)
//  * ----------------------------------------------------------------------
//  */
// export default function DashboardComponent() {
//     const navigation = useNavigation();

//     const dispatch = useDispatch();
//     const { categoryData, hospitalData, labelData, appointmentData, loading, error } = useSelector((state) => state.hospitalReducer)

//     const { width } = useWindowDimensions();
//     const [refreshing, setRefreshing] = useState(false);
//     const [showList, setShowList] = useState(false);
//     const [titleField, setTitleField] = useState('name');
//     const [screenName, setScreenName] = useState('');
//     const [selectedData, setSelectedData] = useState([]);

//     const columnCount = useMemo(() => getColumnCount(width), [width]);

//     // Horizontal padding of the scroll content + gap between items
//     const CONTAINER_PADDING = 16;
//     const ITEM_GAP = 12;

//     const itemWidth = useMemo(() => {
//         const usableWidth = width - CONTAINER_PADDING * 2;
//         const totalGap = ITEM_GAP * (columnCount - 1);
//         return (usableWidth - totalGap) / columnCount;
//     }, [width, columnCount]);

//     const handleRefresh = useCallback(async () => {
//         setRefreshing(true);
//         try {
//             Promise.allSettled([
//                 dispatch(fetchCategories()),
//                 dispatch(fetchHospitals()),
//                 dispatch(fetchLabels()),
//                 dispatch(fetchAppointment()),
//             ])
//         } finally {
//             setRefreshing(false);
//         }
//     }, []);

//     useEffect(() => {
//         Promise.allSettled([
//             dispatch(fetchCategories()),
//             dispatch(fetchHospitals()),
//             dispatch(fetchLabels()),
//             dispatch(fetchAppointment()),
//         ])
//     }, [])

//     const isLoading = loading.category || loading.hospitals || loading.lables || loading.appointment;
//     const isDataAvailable = (categoryData.length > 0) || (hospitalData.length > 0) || (labelData.length > 0) || (appointmentData.length > 0)

//     const { status, progress, download, openFile, reset } = useFileDownload({
//         taskId: 'brochure-pdf', // stable id — reused across app restarts
//         fileName: 'brochure.pdf',
//     });

//     const handleDownloadBrochure = async () => {
//         if (status === 'downloading') return; // prevent double-taps

//         const response = await request(GET_BROCHURE_API(), HTTP_METHODS.GET);
//         const url = response?.response?.data?.data?.url;
//         if (!url) {
//             showErrorToast('No brochure URL returned from server.');
//             return;
//         }

//         await download({
//             url,
//             warnOnCellularAboveMB: 20,
//             getRemoteFileSize,
//             hasEnoughStorage,
//         });
//     };

//     const navigationWithOrWithoutParams = (type) => {
//         const MENU_TYPE = {
//             ALL_PRODUCTS: 0,
//             DOCTOR_LIST: 1,
//             CUSTOM_LABEL: 2,
//             FAVORITE: 3,
//             APPOINTMENT: 4,
//             OFFER: 5,
//             BROCHURE: 6,
//             LOGOUT: 7,
//         };
//         switch (type) {
//             case MENU_TYPE.ALL_PRODUCTS:
//                 navigation?.navigate('product', { id: -1, name: "All Product" })
//                 break;
//             case MENU_TYPE.DOCTOR_LIST:
//                 setScreenName('Doctor List');
//                 setTitleField('doctor_name');
//                 setSelectedData(hospitalData);
//                 setShowList(true)
//                 break;
//             case MENU_TYPE.CUSTOM_LABEL:
//                 setScreenName('Custom Label');
//                 setTitleField('name');
//                 setSelectedData(labelData);
//                 setShowList(true)
//                 break;
//             case MENU_TYPE.FAVORITE:
//                 navigation?.navigate('favorite');
//                 break;
//             case MENU_TYPE.APPOINTMENT:
//                 navigation?.navigate('Appointment');
//                 break;
//             case MENU_TYPE.OFFER:
//                 navigation?.navigate('offers');
//                 break;
//             case MENU_TYPE.BROCHURE:
//                 handleDownloadBrochure();
//                 break;
//             case MENU_TYPE.LOGOUT:
//                 dispatch(changeStack(stacks.ON_BOARD_STACK));
//                 break;
//         }


//     }

//     if ((isLoading && !isDataAvailable) || refreshing)
//         return (
//             <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
//                 <ActivityIndicator size={'large'} color={'#3562a6'} style={{ alignSelf: "center" }} />
//             </View>
//         );
//     else
//         return (
//             <View style={{ flex: 1, backgroundColor: '#f3f6fb' }}>
//                 <AppHeader
//                     title="Dashboard"
//                     onLeftPress={() => navigation.dispatch(DrawerActions.openDrawer())}
//                     leftIconName="bars"
//                     rightType="avatar"
//                     onRightPress={() => navigation.navigate('myProfile')}
//                 />
//                 <ScrollView
//                     style={styles.container}
//                     contentContainerStyle={{ padding: CONTAINER_PADDING, paddingBottom: 32 }}
//                     refreshControl={
//                         <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
//                     }
//                     showsVerticalScrollIndicator={false}
//                 >
//                     {/* ---------------- Section 1 ---------------- */}
//                     <Text style={styles.sectionTitle}>Menu</Text>
//                     <View style={[styles.grid, { columnGap: ITEM_GAP, rowGap: ITEM_GAP }]}>
//                         {MENU_ITEMS.map((item) => (
//                             <GridItem
//                                 key={item.key}
//                                 itemWidth={itemWidth}
//                                 label={item.label}
//                                 onPress={() => { navigationWithOrWithoutParams(item.type) }}
//                             >
//                                 <GradientIconBadge
//                                     colors={item.colors}
//                                     iconName={item.icon}
//                                     size={Math.min(46, itemWidth * 0.6)}
//                                     iconSize={Math.min(46, itemWidth * 0.6) * 0.45}
//                                     borderRadius={10}
//                                 />
//                             </GridItem>
//                         ))}
//                     </View>

//                     {/* ---------------- Section 2 ---------------- */}
//                     <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Categories</Text>

//                     {categoryData.length === 0 ? (
//                         <Text style={styles.emptyText}>No categories available</Text>
//                     ) : (
//                         <View style={[styles.grid, { columnGap: ITEM_GAP, rowGap: ITEM_GAP }]}>
//                             {categoryData.map((category) => (
//                                 <GridItem
//                                     key={category.id}
//                                     itemWidth={itemWidth}
//                                     label={category.name}
//                                     onPress={() => { navigation.navigate('product', category) }}
//                                 >
//                                     <View
//                                         style={[
//                                             styles.categoryIconWrap,
//                                             {
//                                                 width: Math.min(46, itemWidth * 0.6),
//                                                 height: Math.min(46, itemWidth * 0.6),
//                                                 borderRadius: 10
//                                             },
//                                         ]}
//                                     >
//                                         {category.image ? (
//                                             <Image
//                                                 source={{ uri: category.image }}
//                                                 style={styles.categoryIconImage}
//                                                 resizeMode="contain"
//                                             />
//                                         ) : (
//                                             <GradientIconBadge
//                                                 colors={['#4A7EC7', '#6B9FE4']}
//                                                 iconName="tag"
//                                                 size={Math.min(56, itemWidth * 0.6)}
//                                                 iconSize={Math.min(56, itemWidth * 0.6) * 0.45}
//                                             />
//                                         )}
//                                     </View>
//                                 </GridItem>
//                             ))}
//                         </View>
//                     )}
//                 </ScrollView>
//                 {/* <ExpandableFab
//                     mainColor={colors.ICON_COLOR_PRIMARY}
//                     actions={[
//                         { label: 'Add Appointment', icon: 'plus', color: '#D2434B', onPress: () => { } },
//                         { label: 'Add Label', icon: 'plus', color: '#FCCE3B', onPress: () => { } },
//                         { label: 'Add Doctor', icon: 'plus', color: '#55D88A', onPress: () => { } },
//                     ]}
//                 /> */}
//                 <GenericListModal
//                     visible={showList}
//                     onClose={() => setShowList(false)}
//                     data={selectedData}
//                     titleField={titleField}
//                     keyField="id"
//                     title={screenName}
//                     onItemPress={(item) => {
//                         setShowList(false)
//                         setSelectedData([])
//                         if (screenName === 'Custom Label') {
//                             navigation.navigate('assignProductList', { ...item, indexPos: 2 })
//                         } else {
//                             navigation.navigate('assignProductList', { ...item, indexPos: 1 })
//                         }

//                     }}
//                 />
//                 <ExpandableFab
//                     actions={[
//                         { label: 'Add Appointment', icon: 'plus', color: '#D2434B', onPress: () => { navigation.navigate('AddAppointment') } },
//                         { label: 'Add Label', icon: 'plus', color: '#FCCE3B', onPress: () => { navigation.navigate('AddLabel') } },
//                         { label: 'Add Hospital', icon: 'plus', color: '#55D88A', onPress: () => { navigation.navigate('addDoctor') } },
//                     ]}
//                     mainColor={colors.ICON_COLOR_PRIMARY}
//                     topOffset={62} // height of your AppHeader, so actions don't overlap it
//                 />
//             </View>
//         );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#F7F8FA',
//     },
//     sectionTitle: {
//         fontSize: 16,
//         fontWeight: '600',
//         color: '#1A1A1A',
//         marginBottom: 12,
//     },
//     grid: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//     },
//     gridItem: {
//         alignItems: 'center',
//         backgroundColor: '#FFFFFF',
//         borderRadius: 12,
//         paddingVertical: 14,
//         paddingHorizontal: 6,
//         ...Platform.select({
//             ios: {
//                 shadowColor: '#000',
//                 shadowOffset: { width: 0, height: 2 },
//                 shadowOpacity: 0.06,
//                 shadowRadius: 6,
//             },
//             android: {
//                 elevation: 2,
//             },
//         }),
//     },
//     gridLabel: {
//         marginTop: 8,
//         fontSize: 13,
//         textAlign: 'center',
//         fontWeight: "600",
//         color: '#6b7785',
//     },
//     categoryIconWrap: {
//         overflow: 'hidden',
//         backgroundColor: '#EEF1F6',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     categoryIconImage: {
//         width: '70%',
//         height: '70%',
//     },
//     loadingWrap: {
//         paddingVertical: 24,
//         alignItems: 'center',
//     },
//     emptyText: {
//         textAlign: 'center',
//         color: '#8A8A8A',
//         paddingVertical: 16,
//     },
// });

import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    StyleSheet,
    useWindowDimensions,
    RefreshControl,
    ActivityIndicator,
    Platform,
    Clipboard,
    Dimensions
} from 'react-native';
import GradientIconBadge from '../../component/GradientIconBadge';
import AppHeader from '../../component/AppHeader';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, fetchHospitals, fetchLabels, fetchAppointment } from '../addDoctor/hospitalThunks';
import ExpandableFab from '../../component/ExpandableFab';
import colors from '../../assets/appColor/colors';
import stacks from "../../navigation/stackEnum";
import { changeStack } from '../../navigation/navigationSlice';
import { useFileDownload } from '../../hooks/useFileDownload';
import { getRemoteFileSize, hasEnoughStorage } from '../../lib/backgroundDownloader';
import { request } from '../../services/services';
import { GET_BROCHURE_API, GET_OFFERS_API } from '../../services/api-end-points';
import { HTTP_METHODS } from '../../services/api-constants';
import { showSuccessToast, showErrorToast } from '../../utils/Toastutils';
import GenericListModal from '../../modal/Genericlistmodal';
/**
 * ----------------------------------------------------------------------
 * Section 1 — static menu items
 * Each item: label, FontAwesome5 icon name, gradient colors, action key
 * ----------------------------------------------------------------------
 */
const MENU_ITEMS = [
    { key: 'allProducts', label: 'All Product', "screen_name": "product", type: 0, icon: 'pills', colors: ['#5BAD4E', '#7DC870'] },
    { key: 'doctorList', label: 'Doctor List', "screen_name": "", type: 1, icon: 'user-md', colors: ['#C9C43A', '#5BAD4E'] },
    { key: 'customLabel', label: 'Custom Label', "screen_name": "", type: 2, icon: 'bookmark', colors: ['#5BAD4E', '#6B9FE4'] },
    { key: 'favorite', label: 'Favorite', "screen_name": "favorite", type: 3, icon: 'heart', colors: ['#4A7EC7', '#F08FA6'] },
    { key: 'appointment', label: 'Appointment', "screen_name": "", type: 4, icon: 'calendar-check', colors: ['#4A7EC7', '#A67DB8'] },
    { key: 'offer', label: 'Offer', "screen_name": "offers", type: 5, icon: 'tags', colors: ['#A67DB8', '#4A7EC7'] },
    { key: 'brochure', label: 'Brochure', "screen_name": "", type: 6, icon: 'file-pdf', colors: ['#C9C43A', '#DED95F'] },
    { key: 'logout', label: 'Logout', "screen_name": "", type: 7, icon: 'sign-out-alt', colors: ['#4A7EC7', '#6B9FE4'] },
];

/**
 * ----------------------------------------------------------------------
 * Responsive breakpoints
 * Adjust widths to match your design system if needed.
 * ----------------------------------------------------------------------
 */
const BREAKPOINTS = {
    phone: 480,      // < 480  -> phone
    phoneLandscape: 700, // < 700 -> large phone / small tablet portrait
    tablet: 1024,     // < 1024 -> tablet portrait / iPad mini-ish
    // >= 1024         -> iPad landscape / large tablet
};

function getColumnCount(width) {
    if (width < BREAKPOINTS.phone) return 3;
    if (width < BREAKPOINTS.phoneLandscape) return 4;
    if (width < BREAKPOINTS.tablet) return 5;
    return 6;
}

// How long each banner stays on screen before auto-advancing (ms)
const BANNER_AUTOPLAY_INTERVAL = 3500;
// Banner height is capped per breakpoint (not a flat width * ratio) —
// on tablets/iPads the container gets much wider, and a fixed aspect
// ratio would blow the banner up tall enough to push Menu/Categories
// off screen. Height barely grows past the phone sizes.
function getBannerHeight(width) {
    if (width < BREAKPOINTS.phone) return 280;          // phones
    if (width < BREAKPOINTS.phoneLandscape) return 280;  // large phones
    if (width < BREAKPOINTS.tablet) return 250;          // tablet portrait / iPad mini
    return 420;                                          // iPad landscape / large tablet
}
/**
 * ----------------------------------------------------------------------
 * BannerCarousel — auto-scrolling banner strip
 *
 * Props:
 * - banners: Array<{ id, image, title? }>
 * - onBannerPress: (banner) => void
 * - containerPadding: number  (matches the ScrollView's horizontal padding
 *                               so the banner width lines up with the grid)
 * ----------------------------------------------------------------------
 */
function BannerCarousel({ banners, onBannerPress, containerPadding }) {
    const { width } = useWindowDimensions();

    const bannerWidth = width - containerPadding * 2;
    //const bannerHeight = getBannerHeight(width);

    const scrollRef = useRef(null);
    const currentIndex = useRef(0);
    const isUserInteracting = useRef(false);
    const [activeIndex, setActiveIndex] = useState(0);
    //Clipboard.setString(JSON.stringify(banners))
    const hasMultiple = banners.length > 1;

    useEffect(() => {
        if (!hasMultiple) return;

        const timer = setInterval(() => {
            if (isUserInteracting.current) return;

            const nextIndex = (currentIndex.current + 1) % banners.length;
            currentIndex.current = nextIndex;
            setActiveIndex(nextIndex);
            scrollRef.current?.scrollTo({ x: nextIndex * bannerWidth, animated: true });
        }, BANNER_AUTOPLAY_INTERVAL);

        return () => clearInterval(timer);
    }, [hasMultiple, banners.length, bannerWidth]);

    const handleScrollEnd = useCallback((e) => {
        const offsetX = e.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / bannerWidth);
        currentIndex.current = index;
        setActiveIndex(index);
        isUserInteracting.current = false;
    }, [bannerWidth]);

    if (!banners || banners.length === 0) return null;

    return (
        <View style={{ marginBottom: 8 ,backgroundColor:'#F4F6F8'}}>
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScrollBeginDrag={() => { isUserInteracting.current = true; }}
                onMomentumScrollEnd={handleScrollEnd}
                scrollEventThrottle={16}
            >
                {banners.map((banner) => (
                    <TouchableOpacity
                        key={banner.id}
                        activeOpacity={0.85}
                        style={{ width: bannerWidth, height: Dimensions.get('window').height / 2, borderRadius: 14, overflow: 'hidden' }}
                        onPress={() => onBannerPress?.(banner)}
                    >
                        <Image
                            source={{ uri: banner.image }}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="cover"
                        />
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {hasMultiple && (
                <View style={styles.dotsRow}>
                    {banners.map((banner, index) => (
                        <View
                            key={banner.id}
                            style={[
                                styles.dot,
                                index === activeIndex && styles.dotActive,
                            ]}
                        />
                    ))}
                </View>
            )}
        </View>
    );
}

/**
 * ----------------------------------------------------------------------
 * Grid item — shared by both sections
 * ----------------------------------------------------------------------
 */
function GridItem({ itemWidth, onPress, children, label }) {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            style={[styles.gridItem, { width: itemWidth }]}
        >
            {children}
            <Text numberOfLines={2} style={styles.gridLabel}>
                {label}
            </Text>


        </TouchableOpacity>
    );
}

/**
 * ----------------------------------------------------------------------
 * DashboardComponent
 *
 * Props:
 * - categories: Array<{ id, name, iconUrl }>  (from backend, Section 2)
 * - categoriesLoading: boolean
 * - onMenuPress: (key: string) => void         (Section 1 item tapped)
 * - onCategoryPress: (category) => void        (Section 2 item tapped)
 * - onRefresh: () => Promise<void> | void       (optional pull-to-refresh)
 * ----------------------------------------------------------------------
 */
export default function DashboardComponent() {
    const navigation = useNavigation();

    const dispatch = useDispatch();
    const { categoryData, hospitalData, labelData, appointmentData, loading, error } = useSelector((state) => state.hospitalReducer)

    const { width } = useWindowDimensions();
    const [refreshing, setRefreshing] = useState(false);
    const [showList, setShowList] = useState(false);
    const [titleField, setTitleField] = useState('name');
    const [screenName, setScreenName] = useState('');
    const [selectedData, setSelectedData] = useState([]);
    const [bannerData, setBannerData] = useState([]);

    const columnCount = useMemo(() => getColumnCount(width), [width]);

    // Horizontal padding of the scroll content + gap between items
    const CONTAINER_PADDING = 16;
    const ITEM_GAP = 12;

    const itemWidth = useMemo(() => {
        const usableWidth = width - CONTAINER_PADDING * 2;
        const totalGap = ITEM_GAP * (columnCount - 1);
        return (usableWidth - totalGap) / columnCount;
    }, [width, columnCount]);

    const fetchOffers = useCallback(async (isRefresh = false) => {
        try {
            const result = await request(
                GET_OFFERS_API(),
                HTTP_METHODS.GET,
                {}
            );
            const data = result?.response?.data?.data;
            setBannerData(Array.isArray(data) ? data : []);
        } catch (err) {

        }
    }, []);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            Promise.allSettled([
                dispatch(fetchCategories()),
                dispatch(fetchHospitals()),
                dispatch(fetchLabels()),
                dispatch(fetchAppointment())
            ])
        } finally {
            setRefreshing(false);
            fetchOffers();
        }
    }, []);

    useEffect(() => {
        Promise.allSettled([
            dispatch(fetchCategories()),
            dispatch(fetchHospitals()),
            dispatch(fetchLabels()),
            dispatch(fetchAppointment())
        ])
        fetchOffers();
    }, [])

    const isLoading = loading.category || loading.hospitals || loading.lables || loading.appointment;
    const isDataAvailable = (categoryData.length > 0) || (hospitalData.length > 0) || (labelData.length > 0) || (appointmentData.length > 0)

    const { status, progress, download, openFile, reset } = useFileDownload({
        taskId: 'brochure-pdf', // stable id — reused across app restarts
        fileName: 'brochure.pdf',
    });

    const handleDownloadBrochure = async () => {
        if (status === 'downloading') return; // prevent double-taps

        const response = await request(GET_BROCHURE_API(), HTTP_METHODS.GET);
        const url = response?.response?.data?.data?.url;
        if (!url) {
            showErrorToast('No brochure URL returned from server.');
            return;
        }

        await download({
            url,
            warnOnCellularAboveMB: 20,
            getRemoteFileSize,
            hasEnoughStorage,
        });
    };

    const handleBannerPress = (banner) => {
        // if (banner?.deep_link_screen) {
        //     navigation.navigate(banner.deep_link_screen, banner.deep_link_params || {});
        // }
    };

    const navigationWithOrWithoutParams = (type) => {
        const MENU_TYPE = {
            ALL_PRODUCTS: 0,
            DOCTOR_LIST: 1,
            CUSTOM_LABEL: 2,
            FAVORITE: 3,
            APPOINTMENT: 4,
            OFFER: 5,
            BROCHURE: 6,
            LOGOUT: 7,
        };
        switch (type) {
            case MENU_TYPE.ALL_PRODUCTS:
                navigation?.navigate('product', { id: -1, name: "All Product" })
                break;
            case MENU_TYPE.DOCTOR_LIST:
                setScreenName('Doctor List');
                setTitleField('doctor_name');
                setSelectedData(hospitalData);
                setShowList(true)
                break;
            case MENU_TYPE.CUSTOM_LABEL:
                setScreenName('Custom Label');
                setTitleField('name');
                setSelectedData(labelData);
                setShowList(true)
                break;
            case MENU_TYPE.FAVORITE:
                navigation?.navigate('favorite');
                break;
            case MENU_TYPE.APPOINTMENT:
                navigation?.navigate('Appointment');
                break;
            case MENU_TYPE.OFFER:
                navigation?.navigate('offers');
                break;
            case MENU_TYPE.BROCHURE:
                handleDownloadBrochure();
                break;
            case MENU_TYPE.LOGOUT:
                dispatch(changeStack(stacks.ON_BOARD_STACK));
                break;
        }


    }

    if ((isLoading && !isDataAvailable) || refreshing)
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size={'large'} color={'#3562a6'} style={{ alignSelf: "center" }} />
            </View>
        );
    else
        return (
            <View style={{ flex: 1, backgroundColor: '#f3f6fb' }}>
                <AppHeader
                    title="Dashboard"
                    onLeftPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                    leftIconName="bars"
                    rightType="avatar"
                    onRightPress={() => navigation.navigate('myProfile')}
                />
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={{ padding: CONTAINER_PADDING, paddingBottom: 32 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                    }
                    showsVerticalScrollIndicator={false}
                >
                    {/* ---------------- Banner carousel ---------------- */}
                    <BannerCarousel
                        banners={bannerData || []}
                        onBannerPress={handleBannerPress}
                        containerPadding={CONTAINER_PADDING}
                    />

                    {/* ---------------- Section 1 ---------------- */}
                    <Text style={styles.sectionTitle}>Menu</Text>
                    <View style={[styles.grid, { columnGap: ITEM_GAP, rowGap: ITEM_GAP }]}>
                        {MENU_ITEMS.map((item) => (
                            <GridItem
                                key={item.key}
                                itemWidth={itemWidth}
                                label={item.label}
                                onPress={() => { navigationWithOrWithoutParams(item.type) }}
                            >
                                <GradientIconBadge
                                    colors={item.colors}
                                    iconName={item.icon}
                                    size={Math.min(46, itemWidth * 0.6)}
                                    iconSize={Math.min(46, itemWidth * 0.6) * 0.45}
                                    borderRadius={10}
                                />
                            </GridItem>
                        ))}
                    </View>

                    {/* ---------------- Section 2 ---------------- */}
                    <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Categories</Text>

                    {categoryData.length === 0 ? (
                        <Text style={styles.emptyText}>No categories available</Text>
                    ) : (
                        <View style={[styles.grid, { columnGap: ITEM_GAP, rowGap: ITEM_GAP }]}>
                            {categoryData.map((category) => (
                                <GridItem
                                    key={category.id}
                                    itemWidth={itemWidth}
                                    label={category.name}
                                    onPress={() => { navigation.navigate('product', category) }}
                                >
                                    <View
                                        style={[
                                            styles.categoryIconWrap,
                                            {
                                                width: Math.min(46, itemWidth * 0.6),
                                                height: Math.min(46, itemWidth * 0.6),
                                                borderRadius: 10
                                            },
                                        ]}
                                    >
                                        {category.image ? (
                                            <Image
                                                source={{ uri: category.image }}
                                                style={styles.categoryIconImage}
                                                resizeMode="contain"
                                            />
                                        ) : (
                                            <GradientIconBadge
                                                colors={['#4A7EC7', '#6B9FE4']}
                                                iconName="tag"
                                                size={Math.min(56, itemWidth * 0.6)}
                                                iconSize={Math.min(56, itemWidth * 0.6) * 0.45}
                                            />
                                        )}
                                    </View>
                                </GridItem>
                            ))}
                        </View>
                    )}
                </ScrollView>
                {/* <ExpandableFab
                    mainColor={colors.ICON_COLOR_PRIMARY}
                    actions={[
                        { label: 'Add Appointment', icon: 'plus', color: '#D2434B', onPress: () => { } },
                        { label: 'Add Label', icon: 'plus', color: '#FCCE3B', onPress: () => { } },
                        { label: 'Add Doctor', icon: 'plus', color: '#55D88A', onPress: () => { } },
                    ]}
                /> */}
                <GenericListModal
                    visible={showList}
                    onClose={() => setShowList(false)}
                    data={selectedData}
                    titleField={titleField}
                    keyField="id"
                    title={screenName}
                    onItemPress={(item) => {
                        setShowList(false)
                        setSelectedData([])
                        if (screenName === 'Custom Label') {
                            navigation.navigate('assignProductList', { ...item, indexPos: 2 })
                        } else {
                            navigation.navigate('assignProductList', { ...item, indexPos: 1 })
                        }

                    }}
                />
                <ExpandableFab
                    actions={[
                        { label: 'Add Appointment', icon: 'plus', color: '#D2434B', onPress: () => { navigation.navigate('AddAppointment') } },
                        { label: 'Add Label', icon: 'plus', color: '#FCCE3B', onPress: () => { navigation.navigate('AddLabel') } },
                        { label: 'Add Hospital', icon: 'plus', color: '#55D88A', onPress: () => { navigation.navigate('addDoctor') } },
                    ]}
                    mainColor={colors.ICON_COLOR_PRIMARY}
                    topOffset={62} // height of your AppHeader, so actions don't overlap it
                />
            </View>
        );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F8FA',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    gridItem: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 6,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    gridLabel: {
        marginTop: 8,
        fontSize: 13,
        textAlign: 'center',
        fontWeight: "600",
        color: '#6b7785',
    },
    categoryIconWrap: {
        overflow: 'hidden',
        backgroundColor: '#EEF1F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryIconImage: {
        width: '70%',
        height: '70%',
    },
    loadingWrap: {
        paddingVertical: 24,
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        color: '#8A8A8A',
        paddingVertical: 16,
    },
    dotsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#C7D0DC',
    },
    dotActive: {
        width: 16,
        backgroundColor: '#3562a6',
    },
});