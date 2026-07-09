import { createSlice } from '@reduxjs/toolkit';


const initialState = {
    userid: ''
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        saveUser(state, action) {
            console.log(JSON.stringify(action.payload));
            state.userid = 1;
        }
    }
});

export const { saveUser } = authSlice.actions;

export default authSlice.reducer;