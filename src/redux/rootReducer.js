import { combineReducers } from '@reduxjs/toolkit';

import authReducer from '../screens/login/authSlice';
import navigationReducer from '../navigation/navigationSlice';

const rootReducer = combineReducers({
    auth: authReducer,
    navigationReducer: navigationReducer
});

export default rootReducer;