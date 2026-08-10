import { createSlice } from '@reduxjs/toolkit';


const initialState = {
    userid: '',
    userData: {}
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        saveUser(state, action) {
            state.userid = action.payload.id;
            state.userData = action.payload
        }
    }
});

export const { saveUser } = authSlice.actions;

export default authSlice.reducer;