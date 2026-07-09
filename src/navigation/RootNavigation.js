import * as React from 'react';
import { CommonActions, DrawerActions } from '@react-navigation/native';
//
export const navigationRef = React.createRef();


export function navigate(name, params) {
  navigationRef.current?.navigate(name, params);
}

export function dispatch(name, params) {
  navigationRef.current?.dispatch(
    CommonActions.reset({
        index: 0, routes: [{ name: name,params:params}]
    })
  )
}

export function goBack() {
    navigationRef.current?.goBack()
}

export function dispatchDrawer(){
    navigationRef.current?.dispatch(DrawerActions.toggleDrawer())
}