import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/redux/store';
import { StatusBar, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import colors from './src/assets/appColor/colors';
import { PaperProvider, DefaultTheme } from 'react-native-paper';
import RouteContainer from './src/navigation/route';

export default function App() {


    return (
        <Provider store={store}>
            <PersistGate
                loading={null}
                persistor={persistor}>

                <SafeAreaProvider>
                    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ICON_COLOR_PRIMARY }} edges={["top", 'bottom']}>
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
                                barStyle="light-content"
                                backgroundColor={'#23dab1'}
                                translucent={false}
                            />
                            {/* <RouteContainer /> */}
                            <View style={{ flex: 1 }}>
                                <RouteContainer />
                            </View>
                        </PaperProvider>
                    </SafeAreaView>
                </SafeAreaProvider>
            </PersistGate>
        </Provider>
    );
}