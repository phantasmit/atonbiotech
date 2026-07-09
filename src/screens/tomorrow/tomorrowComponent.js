import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Image
} from "react-native";
import { splash } from '../../utils/images';
import { useNavigation } from '@react-navigation/native';


const TomorrowComponent = () => {
    const navigation = useNavigation();

    return (
        <View style={{ flex: 1, }}>
            <Image source={splash} resizeMethod="contain" style={{ width: '100%', height: '100%' }} />
        </View>
    );
};

export { TomorrowComponent };