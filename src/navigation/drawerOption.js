// import React, { useState } from "react";
// import { View, TouchableOpacity, Image, Text, ScrollView, StyleSheet, useWindowDimensions } from "react-native";
// import colors from "../assets/appColor/colors";
// import { logo } from "../utils/images";
// import DrawerMenu from '../component/DrawerMenu';
// import fonts from "../assets/fonts/fonts";
// import Icon from 'react-native-vector-icons/FontAwesome';

// const NavigationRowData = (props) => {
//     const { data = [], onItemPress = () => {}, isTabletWidth } = props;
//     return (
//         <>
//             {data.map((item, index) => (
//                 <TouchableOpacity
//                     key={`nav-row-${index}`}
//                     onPress={() => onItemPress(item, index)}
//                     style={styles.navRow}
//                     activeOpacity={0.7}
//                 >
//                     <Text
//                         style={[
//                             styles.navRowText,
//                             { fontSize: isTabletWidth ? 13 : 12 },
//                         ]}
//                         numberOfLines={1}
//                     >
//                         {item || `Item ${index + 1}`}
//                     </Text>
//                     <Icon
//                         name={'chevron-right'}
//                         size={isTabletWidth ? 14 : 12}
//                         color={'#ABABAB'}
//                     />
//                 </TouchableOpacity>
//             ))}
//         </>
//     );
// };

// const DrawerOption = (props) => {
//     const [selectedIndex, setSelectedIndex] = useState(-1);
//     const { width } = useWindowDimensions(); // updates on rotation / split-screen
//     const isTabletWidth = width >= 600;

//     const toggleIndex = (index) => {
//         setSelectedIndex((prev) => (prev === index ? -1 : index));
//     };

//     return (
//         <View style={{ flex: 1, backgroundColor: colors.WHITE_COLOR }}>
//             <View
//                 style={[
//                     styles.header,
//                     { padding: isTabletWidth ? 20 : 24},
//                 ]}
//             >
//                 <Image
//                     source={logo}
//                     resizeMode="contain"
//                     style={{
//                         width: '100%',
//                         height: isTabletWidth ? 50 : 60,
//                         alignSelf: 'center',
//                         maxWidth: 400, // prevents logo stretching too wide on large iPad landscape
//                     }}
//                 />
//             </View>
//             <ScrollView
//                 contentContainerStyle={{ paddingBottom: 20 }}
//                 showsVerticalScrollIndicator={false}
//             >
//                 <DrawerMenu
//                     onPress={() => {}}
//                     containerData={{ backgroundType: 2, containerBG: '#E3EDFF' }}
//                     iconData={{ iconName: 'home', iconColor: colors.ICON_COLOR_PRIMARY }}
//                     textData={{ title: 'Home', textColor: colors.ICON_COLOR_PRIMARY }}
//                 />

//                 <View style={styles.divider} />

//                 <Text style={styles.sectionLabel}>NAVIGATION</Text>

//                 <DrawerMenu
//                     isSelected={selectedIndex === 0}
//                     onPress={() => toggleIndex(0)}
//                     containerData={{ backgroundType: 3, containerBG: '#E9E9E9', borderBG: '#FE1919' }}
//                     iconData={{ iconName: 'list-ul', iconColor: '#525252' }}
//                     textData={{ title: 'Categories', textColor: '#525252' }}
//                 />
//                 {selectedIndex === 0 && (
//                     <NavigationRowData data={['Category A', 'Category B']} isTabletWidth={isTabletWidth} />
//                 )}

//                 <DrawerMenu
//                     isSelected={selectedIndex === 1}
//                     onPress={() => toggleIndex(1)}
//                     containerData={{ backgroundType: 3, containerBG: '#E9E9E9', borderBG: '#268872' }}
//                     iconData={{ iconName: 'user', iconColor: '#525252' }}
//                     textData={{ title: 'Doctor List', textColor: '#525252' }}
//                 />
//                 {selectedIndex === 1 && (
//                     <NavigationRowData data={['Doctor A', 'Doctor B', 'Doctor C']} isTabletWidth={isTabletWidth} />
//                 )}

//                 <DrawerMenu
//                     isSelected={selectedIndex === 2}
//                     onPress={() => toggleIndex(2)}
//                     containerData={{ backgroundType: 3, containerBG: '#E9E9E9', borderBG: '#FCCE3B' }}
//                     iconData={{ iconName: 'bookmark-o', iconColor: '#525252' }}
//                     textData={{ title: 'Custom Label', textColor: '#525252' }}
//                 />
//                 {selectedIndex === 2 && (
//                     <NavigationRowData
//                         data={['Label A', 'Label B', 'Label C', 'Label D']}
//                         isTabletWidth={isTabletWidth}
//                     />
//                 )}

//                 <View style={styles.divider} />

//                 <Text style={styles.sectionLabel}>Other Options</Text>

//                 <DrawerMenu
//                     onPress={() => {}}
//                     containerData={{ backgroundType: 1 }}
//                     iconData={{ iconName: 'info-circle', iconColor: '#55D88A' }}
//                     textData={{ title: 'About Us', textColor: '#525252' }}
//                 />
//                 <DrawerMenu
//                     onPress={() => {}}
//                     containerData={{ backgroundType: 1 }}
//                     iconData={{ iconName: 'phone', iconColor: '#3DC2FF' }}
//                     textData={{ title: 'Contact Us', textColor: '#525252' }}
//                 />
//                 <DrawerMenu
//                     onPress={() => {}}
//                     containerData={{ backgroundType: 1 }}
//                     iconData={{ iconName: 'book', iconColor: '#5A67FF' }}
//                     textData={{ title: 'Privacy Policy', textColor: '#525252' }}
//                 />
//                 <DrawerMenu
//                     onPress={() => {}}
//                     containerData={{ backgroundType: 1 }}
//                     iconData={{ iconName: 'share-alt', iconColor: '#A2EBBF' }}
//                     textData={{ title: 'Share this app', textColor: '#525252' }}
//                 />
//                 <DrawerMenu
//                     onPress={() => {}}
//                     containerData={{ backgroundType: 1 }}
//                     iconData={{ iconName: 'star', iconColor: '#FFCC29' }}
//                     textData={{ title: 'Rate Us', textColor: '#525252' }}
//                 />
//                 <DrawerMenu
//                     onPress={() => {}}
//                     containerData={{ backgroundType: 1 }}
//                     iconData={{ iconName: 'power-off', iconColor: '#F49DA9' }}
//                     textData={{ title: 'Logout', textColor: '#525252' }}
//                 />
//             </ScrollView>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     header: {
//         width: '100%',
//         backgroundColor: colors.ICON_COLOR_PRIMARY,
//     },
//     divider: {
//         width: '100%',
//         height: StyleSheet.hairlineWidth,
//         backgroundColor: 'gray',
//         marginVertical: 10,
//     },
//     sectionLabel: {
//         marginHorizontal: 12,
//         marginBottom: 6,
//         fontFamily: fonts.POPPINS_REGULAR,
//         fontWeight: '500',
//         fontSize: 11,
//         color: 'gray',
//     },
//     navRow: {
//         flexDirection: 'row',
//         padding: 6,
//         marginVertical: 4,
//         marginLeft: 30,
//         width: '85%',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//     },
//     navRowText: {
//         flex: 1,
//         fontFamily: fonts.POPPINS_REGULAR,
//         fontWeight: '500',
//         color: '#525252',
//     },
// });

// export { DrawerOption };

import React, { useState } from "react";
import { View, TouchableOpacity, Image, Text, ScrollView, StyleSheet, useWindowDimensions, Share, Linking } from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import colors from "../assets/appColor/colors";
import { logo, icon } from "../utils/images";
import DrawerMenu from '../component/DrawerMenu';
import fonts from "../assets/fonts/fonts";
import Icon from 'react-native-vector-icons/FontAwesome';
import { changeStack } from "./navigationSlice";
import stacks from "./stackEnum";

const NavigationRowData = (props) => {
    const { data = [], onItemPress = () => { }, isTabletWidth, indexPos } = props;
    return (
        <>
            {data.map((item, index) => (
                <TouchableOpacity
                    key={`nav-row-${index}`}
                    onPress={() => onItemPress(item, index)}
                    style={styles.navRow}
                    activeOpacity={0.7}
                >
                    <Text
                        style={[
                            styles.navRowText,
                            { fontSize: isTabletWidth ? 14 : 13 },
                        ]}
                        numberOfLines={1}
                    >
                        {indexPos === 1 ? item.doctor_name : item.name}
                    </Text>
                    <Icon
                        name={'chevron-right'}
                        size={isTabletWidth ? 16 : 14}
                        color={'#ABABAB'}
                    />
                </TouchableOpacity>
            ))}
        </>
    );
};

const DrawerOption = (props) => {
    const { navigation } = props;
    const dispatch = useDispatch();
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const { width } = useWindowDimensions();
    const isTabletWidth = width >= 600;

    const toggleIndex = (index) => {
        setSelectedIndex((prev) => (prev === index ? -1 : index));
    };

    const goHome = () => {
        navigation?.navigate('Tabs');
        navigation?.closeDrawer?.();
    };

    const handleLogout = () => {
        dispatch(changeStack(stacks.ON_BOARD_STACK));
    };

    //
    const { categoryData, labelData, hospitalData } = useSelector((state) => state.hospitalReducer);
    const tempCategory = JSON.parse(JSON.stringify(categoryData))
    tempCategory.unshift({ id: -1, name: "All Product" });
    //
    return (
        <View style={{ flex: 1, backgroundColor: colors.WHITE_COLOR }}>
            <View style={[styles.header, { padding: isTabletWidth ? 24 : 20, backgroundColor: "white" }]}>
                <Image
                    source={icon}
                    resizeMode="contain"
                    style={{
                        width: '100%',
                        height: isTabletWidth ? 56 : 50,
                        alignSelf: 'center',
                        maxWidth: 400,
                    }}
                />
            </View>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            >
                <DrawerMenu
                    onPress={goHome}
                    containerData={{ backgroundType: 2, containerBG: '#E3EDFF' }}
                    iconData={{ iconName: 'home', iconColor: colors.ICON_COLOR_PRIMARY }}
                    textData={{ title: 'Home', textColor: colors.ICON_COLOR_PRIMARY }}
                />

                <View style={styles.divider} />

                <Text style={styles.sectionLabel}>NAVIGATION</Text>

                <DrawerMenu
                    isSelected={selectedIndex === 0}
                    //onPress={() => { navigation?.navigate('addCategory'); }}
                    onPress={() => toggleIndex(0)}
                    containerData={{ backgroundType: 3, containerBG: '#E9E9E9', borderBG: '#FE1919' }}
                    iconData={{ iconName: 'list-ul', iconColor: '#525252' }}
                    textData={{ title: 'Categories', textColor: '#525252' }}
                />
                {selectedIndex === 0 && (
                    <NavigationRowData
                        data={tempCategory}
                        indexPos={selectedIndex}
                        isTabletWidth={isTabletWidth}
                        onItemPress={(item, index) => {
                            if (item.id === -1) {
                                navigation.navigate('product', item)
                            } else {
                                navigation.navigate('product', item)
                            }
                        }}
                    />
                )}

                <DrawerMenu
                    isSelected={selectedIndex === 1}
                    onPress={() => toggleIndex(1)}
                    containerData={{ backgroundType: 3, containerBG: '#E9E9E9', borderBG: '#268872' }}
                    iconData={{ iconName: 'user', iconColor: '#525252' }}
                    textData={{ title: 'Doctor List', textColor: '#525252' }}
                />
                {selectedIndex === 1 && (
                    <NavigationRowData
                        data={hospitalData}
                        indexPos={selectedIndex}
                        isTabletWidth={isTabletWidth}
                        onItemPress={(item, index) => {
                            navigation.navigate('assignProductList', { ...item, indexPos: 1 })
                        }}
                    />
                )}

                <DrawerMenu
                    isSelected={selectedIndex === 2}
                    //onPress={() => { alert('test') }}
                    onPress={() => toggleIndex(2)}
                    containerData={{ backgroundType: 3, containerBG: '#E9E9E9', borderBG: '#FCCE3B' }}
                    iconData={{ iconName: 'bookmark-o', iconColor: '#525252' }}
                    textData={{ title: 'Custom Label', textColor: '#525252' }}
                />
                {selectedIndex === 2 && (
                    <NavigationRowData
                        data={labelData}
                        indexPos={selectedIndex}
                        isTabletWidth={isTabletWidth}
                        onItemPress={(item, index) => {
                            navigation.navigate('assignProductList', { ...item, indexPos: 2 })
                        }}
                    />
                )}

                <DrawerMenu
                    isSelected={selectedIndex === 3}
                    onPress={() => { navigation?.navigate('favorite') }}
                    imageViewStyle={{ transform: [{ rotate: '270deg' }] }}
                    //onPress={() => toggleIndex(0)}
                    containerData={{ backgroundType: 3, containerBG: '#E9E9E9', borderBG: '#FE1919' }}
                    iconData={{ iconName: 'list-ul', iconColor: '#525252' }}
                    textData={{ title: 'Favorite', textColor: '#525252' }}
                />
                <View style={styles.divider} />

                <Text style={styles.sectionLabel}>Other Options</Text>

                <DrawerMenu
                    onPress={() => { navigation?.navigate('offers') }}
                    containerData={{ backgroundType: 1 }}
                    iconData={{ iconName: 'info-circle', iconColor: '#55D88A' }}
                    textData={{ title: 'Offers', textColor: '#525252' }}
                />
                <DrawerMenu
                    onPress={() => { navigation?.navigate('webPage', { type: 'aboutus', title: 'About Us' }) }}
                    containerData={{ backgroundType: 1 }}
                    iconData={{ iconName: 'info-circle', iconColor: '#55D88A' }}
                    textData={{ title: 'About Us', textColor: '#525252' }}
                />
                <DrawerMenu
                    onPress={() => { navigation?.navigate('contactUs') }}
                    containerData={{ backgroundType: 1 }}
                    iconData={{ iconName: 'phone', iconColor: '#3DC2FF' }}
                    textData={{ title: 'Contact Us', textColor: '#525252' }}
                />
                <DrawerMenu
                    onPress={() => { navigation?.navigate('webPage', { type: 'privacy_policy', title: 'Privacy Policy' }) }}
                    containerData={{ backgroundType: 1 }}
                    iconData={{ iconName: 'book', iconColor: '#5A67FF' }}
                    textData={{ title: 'Privacy Policy', textColor: '#525252' }}
                />
                <DrawerMenu
                    onPress={() => { navigation?.navigate('webPage', { type: 'term_condition', title: 'Term Condition' }) }}
                    containerData={{ backgroundType: 1 }}
                    iconData={{ iconName: 'book', iconColor: '#5A67FF' }}
                    textData={{ title: 'Terms & Condition', textColor: '#525252' }}
                />
                <DrawerMenu
                    onPress={async () => {
                        const iosAppId = '6744658682';
                        const androidPackageName = 'com.yourapp.package';

                        const url = Platform.select({
                            ios: `https://apps.apple.com/app/id/${iosAppId}`,
                            android: `https://play.google.com/store/apps/details?id=${androidPackageName}`,
                        });
                        try {
                            const result = await Share.share({
                                message: url
                            });
                            if (result.action === Share.sharedAction) {
                                if (result.activityType) {
                                    // shared with activity type of result.activityType
                                } else {
                                    // shared
                                }
                            } else if (result.action === Share.dismissedAction) {
                                // dismissed
                            }
                        } catch (error) {
                            alert(error.message);
                        }
                    }}
                    containerData={{ backgroundType: 1 }}
                    iconData={{ iconName: 'share-alt', iconColor: '#A2EBBF' }}
                    textData={{ title: 'Share this app', textColor: '#525252' }}
                />
                <DrawerMenu
                    onPress={() => {
                        const iosAppId = '6744658682';
                        const androidPackageName = 'com.yourapp.package';

                        const url = Platform.select({
                            ios: `https://apps.apple.com/app/id/${iosAppId}`,
                            android: `https://play.google.com/store/apps/details?id=${androidPackageName}`,
                        });

                        Linking.openURL(url).catch((err) => console.error('An error occurred', err));
                    }}
                    containerData={{ backgroundType: 1 }}
                    iconData={{ iconName: 'star', iconColor: '#FFCC29' }}
                    textData={{ title: 'Rate Us', textColor: '#525252' }}
                />
                <DrawerMenu
                    onPress={handleLogout}
                    containerData={{ backgroundType: 1 }}
                    iconData={{ iconName: 'power-off', iconColor: '#F49DA9' }}
                    textData={{ title: 'Logout', textColor: '#525252' }}
                />

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    header: { width: '100%', backgroundColor: colors.ICON_COLOR_PRIMARY },
    divider: { width: '100%', height: StyleSheet.hairlineWidth, backgroundColor: 'gray', marginVertical: 10 },
    sectionLabel: {
        marginHorizontal: 12,
        marginBottom: 6,
        fontFamily: fonts.POPPINS_REGULAR,
        fontWeight: '500',
        fontSize: 12,
        color: 'gray',
    },
    navRow: {
        flexDirection: 'row',
        padding: 8,
        marginVertical: 4,
        marginLeft: 30,
        width: '85%',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    navRowText: { flex: 1, fontFamily: fonts.POPPINS_REGULAR, fontWeight: '500', color: '#525252' },
});

export { DrawerOption };