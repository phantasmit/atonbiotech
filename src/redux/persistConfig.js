import AsyncStorage from '@react-native-async-storage/async-storage';
import migrations from './migrations';

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    version: 2,
    migrate: migrations
    // whitelist: [],
    // blacklist: []
};

export default persistConfig;