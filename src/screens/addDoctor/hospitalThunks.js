import { createAsyncThunk } from '@reduxjs/toolkit';
import { request } from '../../services/services';
import { HTTP_METHODS } from '../../services/api-constants';
import { HOSPITAL_LIST_API, CATEGORIES_LIST_API, LABELS_LIST_API, APPOINTMENT_LIST_API } from '../../services/api-end-points';

export const fetchCategories = createAsyncThunk(
    'hospital/fetchCategories',
    async (payload, { rejectWithValue }) => {
        try {
            const result = await request(CATEGORIES_LIST_API(), HTTP_METHODS.GET, payload);
            return result.response.data;
        } catch (err) {
            return rejectWithValue(err?.message || 'Failed to fetch category');
        }
    }
);

export const fetchLabels = createAsyncThunk(
    'hospital/fetchLabels',
    async (payload, { rejectWithValue }) => {
        try {
            const result = await request(LABELS_LIST_API(), HTTP_METHODS.GET, payload);
            return result.response.data;
        } catch (err) {
            return rejectWithValue(err?.message || 'Failed to fetch labels');
        }
    }
);

export const fetchHospitals = createAsyncThunk(
    'hospital/fetchHospitals',
    async (payload, { rejectWithValue }) => {
        try {
            const result = await request(HOSPITAL_LIST_API(), HTTP_METHODS.GET, payload);
            return result.response.data;
        } catch (err) {
            return rejectWithValue(err?.message || 'Failed to fetch hospitals');
        }
    }
);

export const fetchAppointment = createAsyncThunk(
    'hospital/fetchAppointment',
    async (payload, { rejectWithValue }) => {
        try {
            const result = await request(APPOINTMENT_LIST_API(), HTTP_METHODS.GET, payload);
            return result.response.data;
        } catch (err) {
           // alert('test'+JSON.stringify(err?.message))
            return rejectWithValue(err?.message || 'Failed to fetch appointment');
        }
    }
);