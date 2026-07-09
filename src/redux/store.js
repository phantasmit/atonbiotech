import { configureStore } from '@reduxjs/toolkit';
import {
    persistStore,
    persistReducer,
} from 'redux-persist';

import persistConfig from './persistConfig';
import rootReducer from './rootReducer';


// import AsyncStorage from '@react-native-async-storage/async-storage';
// import migrations from './migrations';

// const persistConfig = {
//     key: 'root',
//     storage: AsyncStorage,
//     version: 2,
//     migrate: migrations
//    // whitelist: [],
//     //blacklist: []
// };

const persistedReducer = persistReducer(
    persistConfig,
    rootReducer,
);


export const store = configureStore({
    reducer: persistedReducer,
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});


export const persistor = persistStore(store);