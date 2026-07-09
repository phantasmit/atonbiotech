import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Image
} from "react-native";
import { splash } from '../../utils/images';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashComponent = () => {
    const navigation = useNavigation();
    
    const stackName = useSelector(state => state.navigationReducer)

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
        <View style={{ flex: 1, }}>
            <Image source={splash} resizeMethod="contain" style={{ width: '100%', height: '100%' }} />
        </View>
    );
};

export { SplashComponent };