import React from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { navigationRef } from "./RootNavigation";
import stacks from "./stackEnum";
import { OnBoardStack } from './onboardStack';
import { AppStack } from './appStack';
import { useSelector } from 'react-redux';
//
function RouteContainer() {
    const stackName = useSelector(state => state.navigationReducer)
    return (
        <NavigationContainer
            ref={navigationRef}
        >
            {manageStack(stackName.stack_name)}
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
