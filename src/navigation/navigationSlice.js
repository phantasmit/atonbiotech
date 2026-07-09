import { createSlice } from '@reduxjs/toolkit';
import stacks from "./stackEnum";

const initialState = {
    stack_name: stacks.ON_BOARD_STACK
};

const navigationSlice = createSlice({
    name: 'navigation',
    initialState,
    reducers: {
        changeStack(state, action) {
            alert(action.payload)
            state.stack_name = action.payload;
        }
    }
});

export const { changeStack } = navigationSlice.actions;

export default navigationSlice.reducer;