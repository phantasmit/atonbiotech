import React from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { navigationRef } from "./RootNavigation";
import stacks from "./stackEnum";
import { OnBoardStack } from './onboardStack';
import { AppStack } from './appStack';
//
const Stack = createNativeStackNavigator();
//
function RouteContainer() {
    return (
        <NavigationContainer
            ref={navigationRef}
        >
            {manageStack(stacks.ON_BOARD_STACK)}
        </NavigationContainer>
    )
}

const manageStack = (stacks_option) => {
    switch (stacks_option) {
        case stacks.ON_BOARD_STACK:
            return OnBoardStack()
        case stacks.APP_STACK:
            return AppStack()
    }
}
//
export default RouteContainer;
