import { createSlice } from '@reduxjs/toolkit';
import { fetchCategories, fetchHospitals, fetchLabels, fetchAppointment } from './hospitalThunks';

const initialState = {
    hospitalData: [],
    categoryData: [],
    labelData: [],
    appointmentData: [],
    loading: {
        category: false,
        hospitals: false,
        lables: false,
        appointment: false
    },
    error: {
        category: null,
        hospitals: null,
        lables: null,
        appointment: null
    },
};

const hospitalSlice = createSlice({
    name: 'hospital',
    initialState,
    reducers: {
        saveHospitalData(state, action) {
            state.hospitalData = action.payload.hospitalData
        }
    },
    extraReducers: (builder) => {
        builder
            //categoryData
            .addCase(fetchCategories.pending, (state) => {
                state.loading.category = true;
                state.error.category = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading.category = false;
                state.categoryData = action.payload.data;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading.category = false;
                state.error.category = action.payload;
            })
            //HospitalData
            .addCase(fetchHospitals.pending, (state) => {
                state.loading.hospitals = true;
                state.error.hospitals = null;
            })
            .addCase(fetchHospitals.fulfilled, (state, action) => {
                state.loading.hospitals = false;
                state.hospitalData = action.payload.data;
            })
            .addCase(fetchHospitals.rejected, (state, action) => {
                state.loading.hospitals = false;
                state.error.hospitals = action.payload;
            })
            //LabelData
            .addCase(fetchLabels.pending, (state) => {
                state.loading.lables = true;
                state.error.lables = null;
            })
            .addCase(fetchLabels.fulfilled, (state, action) => {
                state.loading.lables = false;
                state.labelData = action.payload.data;
            })
            .addCase(fetchLabels.rejected, (state, action) => {
                state.loading.lables = false;
                state.error.lables = action.payload;
            })
            //Appointment
            .addCase(fetchAppointment.pending, (state) => {
                state.loading.appointment = true;
                state.error.appointment = null;
            })
            .addCase(fetchAppointment.fulfilled, (state, action) => {
                state.loading.appointment = false;
                state.appointmentData = action.payload.data;
            })
            .addCase(fetchAppointment.rejected, (state, action) => {
                state.loading.appointment = false;
                state.error.appointment = action.payload;
            })
    }
});

export const { saveHospitalData } = hospitalSlice.actions;

export default hospitalSlice.reducer;