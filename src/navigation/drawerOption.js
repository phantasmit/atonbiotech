import React, { useState } from "react";
import { View, TouchableOpacity, Image, Text, ScrollView, StyleSheet, useWindowDimensions, Share, Linking, Platform } from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import colors from "../assets/appColor/colors";
import { logo, icon } from "../utils/images";
import DrawerMenu from '../component/DrawerMenu';
import fonts from "../assets/fonts/fonts";
import Icon from 'react-native-vector-icons/FontAwesome';
import { changeStack } from "./navigationSlice";
import stacks from "./stackEnum";
import { request } from "../services/services";
import { HTTP_METHODS } from "../services/api-constants";
import { GET_BROCHURE_API } from "../services/api-end-points";
import { useFileDownload } from '../hooks/useFileDownload';
import { getRemoteFileSize, hasEnoughStorage } from '../lib/backgroundDownloader';
import { showErrorToast } from "../utils/Toastutils";

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
    // const [downloadingBrochure, setDownloadingBrochure] = useState(false);
    // const [downloadProgress, setDownloadProgress] = useState(0);

    const { width } = useWindowDimensions();
    const isTabletWidth = width >= 600;

    const toggleIndex = (index) => {
        setSelectedIndex((prev) => (prev === index ? -1 : index));
    };

    const goHome = () => {
        navigation?.navigate('Tabs');
        navigation?.closeDrawer?.();
    };

    const navigateAndCloseDrawer = (routeName, params) => {
        navigation?.navigate(routeName, params);
        navigation?.closeDrawer?.();
    }

    const handleLogout = () => {
        dispatch(changeStack(stacks.ON_BOARD_STACK));
    };
    const { status, progress, download, openFile, reset } = useFileDownload({
        taskId: 'brochure-pdf', // stable id — reused across app restarts
        fileName: 'brochure.pdf',
    });

    const handleDownloadBrochure = async () => {
        if (status === 'downloading') return; // prevent double-taps

        const response = await request(GET_BROCHURE_API(), HTTP_METHODS.GET);
        const url = response?.response?.data?.data?.url;
        if (!url) {
            showErrorToast('No brochure URL returned from server.')
            return;
        }

        await download({
            url,
            warnOnCellularAboveMB: 20,
            getRemoteFileSize,
            hasEnoughStorage,
        });
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
                    containerData={{ backgroundType: 2, containerBG: '#6B9FE4' }}
                    iconData={{ iconName: 'tachometer-alt', iconColor: 'white' }}
                    textData={{ title: 'Dashbaord', textColor: 'white' }}
                />

                <View style={styles.divider} />

                <Text style={styles.sectionLabel}>NAVIGATION</Text>

                <DrawerMenu
                    isSelected={selectedIndex === 0}
                    onPress={() => toggleIndex(0)}
                    containerData={{ backgroundType: 3, containerBG: 'transparent', borderBG: 'transparent', isIcon: true }}
                    iconData={{ iconName: 'layer-group', iconColor: '#5BAD4E' }}
                    textData={{ title: 'Categories', textColor: '#525252' }}
                />
                {selectedIndex === 0 && (
                    <NavigationRowData
                        data={tempCategory}
                        indexPos={selectedIndex}
                        isTabletWidth={isTabletWidth}
                        onItemPress={(item, index) => {
                            navigateAndCloseDrawer('product', item)
                        }}
                    />
                )}

                <DrawerMenu
                    isSelected={selectedIndex === 1}
                    onPress={() => toggleIndex(1)}
                    containerData={{ backgroundType: 3, containerBG: 'transparent', borderBG: 'transparent', isIcon: true }}
                    iconData={{ iconName: 'user-md', iconColor: '#4A7EC7' }}
                    textData={{ title: 'Doctor List', textColor: '#525252' }}
                />
                {selectedIndex === 1 && (
                    <NavigationRowData
                        data={hospitalData}
                        indexPos={selectedIndex}
                        isTabletWidth={isTabletWidth}
                        onItemPress={(item, index) => {
                            navigateAndCloseDrawer('assignProductList', { ...item, indexPos: 1 })
                        }}
                    />
                )}

                <DrawerMenu
                    isSelected={selectedIndex === 2}
                    onPress={() => toggleIndex(2)}
                    containerData={{ backgroundType: 3, containerBG: 'transparent', borderBG: 'transparent', isIcon: true }}
                    iconData={{ iconName: 'bookmark', iconColor: '#C9C43A' }}
                    textData={{ title: 'Custom Label', textColor: '#525252' }}
                />
                {selectedIndex === 2 && (
                    <NavigationRowData
                        data={labelData}
                        indexPos={selectedIndex}
                        isTabletWidth={isTabletWidth}
                        onItemPress={(item, index) => {
                            navigateAndCloseDrawer('assignProductList', { ...item, indexPos: 2 })
                        }}
                    />
                )}

                <DrawerMenu
                    isSelected={selectedIndex === 3}
                    onPress={() => { navigateAndCloseDrawer('favorite') }}
                    imageViewStyle={{ transform: [{ rotate: '270deg' }] }}
                    containerData={{ backgroundType: 3, containerBG: 'transparent', borderBG: 'transparent', isIcon: true }}
                    iconData={{ iconName: 'heart', iconColor: '#A67DB8' }}
                    textData={{ title: 'Favorite', textColor: '#525252' }}
                />
                <DrawerMenu
                    isSelected={selectedIndex === 4}
                    //onPress={() => toggleIndex(4)}
                    onPress={() => { navigateAndCloseDrawer('Appointment') }}
                    imageViewStyle={{ transform: [{ rotate: '270deg' }] }}
                    containerData={{ backgroundType: 3, containerBG: 'transparent', borderBG: 'transparent', isIcon: true }}
                    iconData={{ iconName: 'calendar-check', iconColor: '#4A7EC7' }}
                    textData={{ title: 'Appointment', textColor: '#525252' }}
                />
                {/* {selectedIndex === 4 && (
                    <NavigationRowData
                        data={[{ id: 0, name: "Today Appointment", screenName: "Today" }, { id: 1, name: "Tomorrow Appointment", screenName: "Tomorrow" }, { id: 2, name: "All Appointment", screenName: "AllAppointment" }]}
                        indexPos={selectedIndex}
                        isTabletWidth={isTabletWidth}
                        onItemPress={(item, index) => {
                            navigateAndCloseDrawer(item.screenName)
                        }}
                    />
                )} */}
                <View style={styles.divider} />

                <Text style={styles.sectionLabel}>Other Options</Text>

                <DrawerMenu
                    onPress={() => {
                        navigateAndCloseDrawer('offers')
                    }}
                    containerData={{ backgroundType: 3, containerBG: 'transparent', borderBG: 'transparent', isIcon: false }}
                    iconData={{ iconName: 'tags', iconColor: '#C9C43A' }}
                    textData={{ title: 'Offers', textColor: '#525252' }}
                />
                <DrawerMenu
                    onPress={() => {
                        navigateAndCloseDrawer('webPage', { type: 'aboutus', title: 'About Us' })
                    }}
                    containerData={{ backgroundType: 3, containerBG: 'transparent', borderBG: 'transparent', isIcon: false }}
                    iconData={{ iconName: 'info-circle', iconColor: '#ffc107' }}
                    textData={{ title: 'About Us', textColor: '#525252' }}
                />
                <DrawerMenu
                    onPress={() => {
                        navigateAndCloseDrawer('contactUs')
                    }}
                    containerData={{ backgroundType: 3, containerBG: 'transparent', borderBG: 'transparent', isIcon: false }}
                    iconData={{ iconName: 'phone-alt', iconColor: '#198754' }}
                    textData={{ title: 'Contact Us', textColor: '#525252' }}
                />
                <DrawerMenu
                    onPress={() => {
                        navigateAndCloseDrawer('webPage', { type: 'privacy_policy', title: 'Privacy Policy' })
                    }}
                    containerData={{ backgroundType: 3, containerBG: 'transparent', borderBG: 'transparent', isIcon: false }}
                    iconData={{ iconName: 'shield-alt', iconColor: '#6c757d' }}
                    textData={{ title: 'Privacy Policy', textColor: '#525252' }}
                />
                <DrawerMenu
                    onPress={() => {
                        navigateAndCloseDrawer('webPage', { type: 'term_condition', title: 'Term Condition' })
                    }}
                    containerData={{ backgroundType: 3, containerBG: 'transparent', borderBG: 'transparent', isIcon: false }}
                    iconData={{ iconName: 'file-contract', iconColor: '#0d6efd' }}
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
                            showErrorToast(error.message);
                        }
                    }}
                    containerData={{ backgroundType: 3, containerBG: 'transparent', borderBG: 'transparent', isIcon: false }}
                    iconData={{ iconName: 'share-alt', iconColor: '#20c997' }}
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
                    containerData={{ backgroundType: 3, containerBG: 'transparent', borderBG: 'transparent', isIcon: false }}
                    iconData={{ iconName: 'star', iconColor: '#6f42c1' }}
                    textData={{ title: 'Rate Us', textColor: '#525252' }}
                />
                <DrawerMenu
                    onPress={handleDownloadBrochure}
                    containerData={{ backgroundType: 3, containerBG: 'transparent', borderBG: 'transparent', isIcon: false }}
                    iconData={{
                        iconName: status === 'downloading' ? 'spinner' : 'file-pdf',
                        iconColor: '#C9C43A',
                    }}
                    textData={{
                        title: status === 'downloading' ? `Downloading... ${progress}%` : 'Download Brochure',
                        textColor: '#525252',
                    }}
                // onPress={handleDownloadBrochure}
                // containerData={{ backgroundType: 2 }}
                // iconData={{
                //     iconName: downloadingBrochure ? 'spinner' : 'file-pdf',
                //     iconColor: '#C9C43A',
                // }}
                // textData={{
                //     title: downloadingBrochure ? `Downloading... ${downloadProgress}%` : 'Download Brochure',
                //     textColor: '#525252',
                // }}
                />
                <DrawerMenu
                    onPress={handleLogout}
                    containerData={{ backgroundType: 3, containerBG: 'transparent', borderBG: 'transparent', isIcon: false }}
                    iconData={{ iconName: 'sign-out-alt', iconColor: '#F49DA9' }}
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
        marginVertical: 2,
        marginLeft: 30,
        width: '85%',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    navRowText: { flex: 1, fontFamily: fonts.POPPINS_REGULAR, fontWeight: '500', color: '#525252' },
});

export { DrawerOption };