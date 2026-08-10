//
const BASE_URL = "https://konsylpharma.in/api/v1";
export const IMAGE_BASE_URL = "https://konsylpharma.in/img";
//LOGIN API
export const LOGIN_API = () => `${BASE_URL}/auth/login`;
//Profile Management
export const PROFILE_API = () => `${BASE_URL}/profile`;
export const UPDATE_PROFILE_API = () => `${BASE_URL}/profile`;
export const CHANGE_PASSWORD_API = () => `${BASE_URL}/profile/password`;
//HOSPITAL
export const HOSPITAL_LIST_API = () => `${BASE_URL}/hospitals`;
export const CREATE_HOSPITAL_API = () => `${BASE_URL}/hospitals`;
export const HOSPITAL_DETAIL_API = (hospital_id) => `${BASE_URL}/hospitals/${hospital_id}`;
export const ADD_PRODUCT_TO_HOSPITAL_API = (hospital_id) => `${BASE_URL}/hospitals/${hospital_id}/products`;
export const REMOVE_PRODUCT_TO_HOSPITAL_API = (hospital_id, product_id) => `${BASE_URL}/hospitals/${hospital_id}/products/${product_id}`;
export const DELETE_DOCTOR_API = (hospital_id) => `${BASE_URL}/hospitals/${hospital_id}`;
export const GET_PRODUCT_LIST_FOR_DOCTOR_API = (hospital_id) => `${BASE_URL}/hospitals/${hospital_id}/products`;
export const UPDATE_DOCTOR_NAME_API = (hospital_id) => `${BASE_URL}/hospitals/${hospital_id}`;
//CATEGORIES
export const CATEGORIES_LIST_API = () => `${BASE_URL}/categories`;
//LABELS
export const LABELS_LIST_API = () => `${BASE_URL}/labels`;
export const CREATE_LABEL_API = () => `${BASE_URL}/labels`;
export const ADD_PRODUCT_TO_LABEL_API = (label_id) => `${BASE_URL}/labels/${label_id}/products`;
export const DELETE_LABEL_API = (label_id) => `${BASE_URL}/labels/${label_id}`;
export const UPDATE_LABEL_API = (label_id) => `${BASE_URL}/labels/${label_id}`;
export const GET_PRODUCT_LIST_FOR_LABEL_API = (label_id) => `${BASE_URL}/labels/${label_id}/products`;
export const DELETE_PRODUCT_FROM_LABEL_API = (label_id, product_id) => `${BASE_URL}/labels/${label_id}/products/${product_id}`
//APPOINTMENT
export const APPOINTMENT_LIST_API = () => `${BASE_URL}/appointments`;
//PRODUCT
export const GET_PRODUCT_API = (pageNo) => `${BASE_URL}/products?page=${pageNo}`;
export const PRODUCT_LIST_API = (categoryID, pageNo) => `${BASE_URL}/categories/${categoryID}/products?page=${pageNo}`;
export const PRODUCT_DETAI_API = (productID) => `${BASE_URL}/products/${productID}`;
//FAVORITE
export const ADD_FAVORITE_API = () => `${BASE_URL}/favorites`;
export const REMOVE_FAVORITE_API = (product_id) => `${BASE_URL}/favorites/${product_id}`;
export const GET_FAVORITE_API = () => `${BASE_URL}/favorites`;
//OFFERS
export const GET_OFFERS_API = () => `${BASE_URL}/offers`;
//ABOUT US
export const GET_ABOUT_US_API = () => `${BASE_URL}/pages/about-us`;
//PRIVACY POLICY
export const GET_PRIVACY_POLICY_API = () => `${BASE_URL}/pages/privacy-policy`;
//TERMS N CONDITION
export const GET_TERM_CONDITION_API = () => `${BASE_URL}/pages/terms-conditions`;
//CONTACT US
export const GET_CONTACT_US_API = () => `${BASE_URL}/pages/contact-us`;