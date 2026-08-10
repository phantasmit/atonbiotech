import { combineReducers } from '@reduxjs/toolkit';

import authReducer from '../screens/login/authSlice';
import navigationReducer from '../navigation/navigationSlice';
import hospitalReducer from '../screens/addDoctor/hospitalSlice';

const rootReducer = combineReducers({
    auth: authReducer,
    navigationReducer: navigationReducer,
    hospitalReducer: hospitalReducer
});

export default rootReducer;