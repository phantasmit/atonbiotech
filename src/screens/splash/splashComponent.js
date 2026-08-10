import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Image as RNImage
} from "react-native";
import { icon, splash } from '../../utils/images';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashComponent = () => {
    const navigation = useNavigation();

    const stackName = useSelector(state => state.navigationReducer)
    const { width: iconW, height: iconH } = RNImage.resolveAssetSource(icon);
    const iconAspectRatio = iconW / iconH;
    useEffect(() => {
        // alert(JSON.stringify(stackName.stack_name))
        // AsyncStorage.getItem('persist:root').then(data => {
        //     alert('Persisted Data:' + JSON.stringify(data));
        //     //debugger;
        // });
        setTimeout(() => {
            // AsyncStorage.getItem('persist:root').then(data => {
            //     console.log('Persisted Data:', data);
            //     debugger;
            // });
             navigation.navigate('Login')
        }, 3000)
    }, [])

    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <RNImage
                source={icon}
                resizeMode="contain"
                style={{ aspectRatio: iconAspectRatio * 0.4 }}
            />
        </View>
    );
};

export { SplashComponent };