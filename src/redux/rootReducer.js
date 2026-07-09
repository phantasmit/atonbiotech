import { combineReducers } from '@reduxjs/toolkit';

import authReducer from '../screens/login/authSlice';


const rootReducer = combineReducers({
    auth: authReducer
});

export default rootReducer;