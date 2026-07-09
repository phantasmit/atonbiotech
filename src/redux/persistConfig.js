import AsyncStorage from '@react-native-async-storage/async-storage';
import migrations from './migrations';

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    version: 1,
    migrate: migrations,
    whitelist: [],
};

export default persistConfig;