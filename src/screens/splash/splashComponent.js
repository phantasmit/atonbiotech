import React, { useEffect, useState } from 'react';
import {
    View,
    Image as RNImage,
} from "react-native";
import { icon } from '../../utils/images';
import { useNavigation } from '@react-navigation/native';

import LottieView from 'lottie-react-native';


const SplashComponent = () => {
    const navigation = useNavigation();


    const { width: iconW, height: iconH } = RNImage.resolveAssetSource(icon);
    const iconAspectRatio = iconW / iconH;
    useEffect(() => {
        setTimeout(() => {
            navigation.navigate('Login')
        }, 3000)
    }, [])

    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <LottieView
                source={require('../../assets/dots_constellation_burst_landscape_new.json')}
                autoPlay
                loop
                resizeMode="cover"
                style={{ width: '100%', height: '100%', position: "absolute" }}
            />
            {/* </View> */}
            <View style={{ padding: 30, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "white" }}>
                <RNImage
                    source={icon}
                    resizeMode="contain"
                    style={{ aspectRatio: iconAspectRatio * 0.4 }}
                />
            </View>
        </View>
    );
};

export { SplashComponent };