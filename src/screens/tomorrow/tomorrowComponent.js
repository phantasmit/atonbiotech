import React, { useEffect, useMemo, useState } from 'react';
import {
    View
} from "react-native";
import { useNavigation } from '@react-navigation/native';
//
import HeaderComponent from "../../hoc/headerComponent";
import HOCComponent from "../../hoc/hocComponent";
import * as RootNavigation from "../../navigation/RootNavigation";
//
const HeaderComponents = HeaderComponent(View)
const HOCComponents = HOCComponent(HeaderComponents);
//

const TomorrowComponent = () => {
    const navigation = useNavigation();

    return (
        <HOCComponents onPress={() => {
            RootNavigation.dispatchDrawer()
        }}>
            <View style={{ flex: 1, backgroundColor: 'red' }}></View>
        </HOCComponents>
    );
};

export { TomorrowComponent };