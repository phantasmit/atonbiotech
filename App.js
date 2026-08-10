import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/redux/store';
import { StatusBar, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import colors from './src/assets/appColor/colors';
import { PaperProvider, DefaultTheme } from 'react-native-paper';
import RouteContainer from './src/navigation/route';
//import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {


    return (
        <Provider store={store}>
            <PersistGate persistor={persistor}>
                <SafeAreaProvider>
                    <SafeAreaView style={{ flex: 1, backgroundColor: "#f3f6fb" }} edges={["top", 'bottom']}>
                        <PaperProvider
                            settings={{
                                rippleEffectEnabled: false
                            }}
                            theme={{
                                ...DefaultTheme,
                                colors: {
                                    ...DefaultTheme.colors,
                                    background: 'transparent',
                                },
                            }}
                        >
                            <StatusBar
                                barStyle="dark-content"
                                backgroundColor={'#f3f6fb'}
                                translucent={false}
                            />
                            <RouteContainer />
                        </PaperProvider>
                    </SafeAreaView>
                </SafeAreaProvider>
            </PersistGate>
        </Provider>
    );
}