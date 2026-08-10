import { HTTP_METHODS } from "./api-constants";
import axios, { create } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DeviceEventEmitter } from "react-native";
/**
 * Performance Monitoring with Axios with Firebase
 */
axios.interceptors.request.use(async function (config) {
  try {
    const httpMetric = perf().newHttpMetric(config.url, config.method);
    config.metadata = { httpMetric };

    await httpMetric.start();
  } finally {
    return config;
  }
});
//
axios.interceptors.response.use(
  async function (response) {
    try {
      // Request was successful, e.g. HTTP code 200  
      const { httpMetric } = response.config.metadata;
      //
      httpMetric.setHttpResponseCode(response.status);
      httpMetric.setResponseContentType(response.headers["content-type"]);
      await httpMetric?.stop();
    } finally {
      return response;
    }
  },
  async function (error) {
    try {
      const { httpMetric } = error.config.metadata;

      httpMetric.setHttpResponseCode(error.response.status);
      httpMetric.setResponseContentType(error.response.headers["content-type"]);
      await httpMetric?.stop();
    } finally {
      // Ensure failed requests throw after interception
      return Promise.reject(error);
    }
  }
);

/**
 * axios object
*/
const API = axios.create({
  timeout: 60000,
});

/**
 * To perform api from class where this function/method is imported,
 * and send back completion in resolve or reject based on api response.
 */
export const request = (
  url,
  httpMethod,
  params
) =>
  new Promise(async (resolve, reject) => {
    try {
      const configObj = {}
      //
      const value = await AsyncStorage.getItem('authToken')
      //
      if (value !== null) {
        configObj['Authorization'] = `Bearer ${value}`
      }

      configObj['Accept'] = 'application/json'
      configObj['content-type'] = 'application/json'
      //
      switch (httpMethod) {
        // GET
        case HTTP_METHODS.GET:
          doGet(url, resolve, reject, configObj);
          break;
        // POST
        case HTTP_METHODS.POST:
          doPost(url, params, resolve, reject, configObj);
          break;
        // MULTIPART
        case HTTP_METHODS.MULTIPART:
          doMultiPart(url, params, resolve, reject, configObj);
          break;
        // PUT
        case HTTP_METHODS.PUT:
          doPut(url, params, resolve, reject, configObj);
          break;
        // DELETE
        case HTTP_METHODS.DELETE:
          doDelete(url, resolve, reject, configObj);
          break;
      }
    } catch (error) {
      reject(error);
    }
  });
/**
 *  This function is used to parse response and send completion to handle resolve and reject value for parent Promise.
 * We can consider it as a child promise
 * @param {*} response
 */
export const parseResponse = (response) =>
  new Promise((parsedResponse) => {
    const isSuccess =
      response.status === 200 || response.status === 202 || response.status === 201 ? true : false;
    if (isSuccess) {
      parsedResponse({ isSuccess: true, response: response });
    } else {
      let message = 'SOMETHING_WENT_WRONG';
      if (response.data != null && response.data.message) {
        message = response.data.message;
      }
      parsedResponse({ isSuccess: false, message: message });
    }
  });


/***
 * This function is used for service request with GET as request type
 * and send back completion in resolve or reject based on parent Promise.
 * @param {*} url
 * @param {*} resolve
 * @param {*} reject
 * @param {*} config
 */
const doGet = (url, resolve, reject, config = {}) => {
  const headers = config

  API.get(url, { headers })
    .then((response) => {
      parseResponse(response).then((parsedResponse) => {
        if (parsedResponse.isSuccess) {
          resolve({ response: parsedResponse.response });
        } else {
          reject(parsedResponse.message);
        }
      });
    })
    .catch((error) => {
      if (error?.response?.status == 401) {
        // DeviceEventEmitter.emit('performLogout', "")
        reject(error);
      } else {
        reject(error);
      }
    });
};
/***
 * This function is used for service request with POST as request type
 * and send back completion in resolve or reject based on parent Promise.
 * @param {*} url
 * @param {*} resolve
 * @param {*} reject
 * @param {*} config
 */
const doPost = (url, params, resolve, reject, config = {}) => {
  const headers = config
  //
  API.post(url, params, { headers })
    .then((response) => {
      parseResponse(response).then((parsedResponse) => {
        if (parsedResponse.isSuccess) {
          resolve({ response: parsedResponse.response });
        } else {
          reject(parsedResponse.message);
        }
      });
    }).catch((error) => {
      if (error?.response?.status == 401) {
        reject(error);
      } else {
        reject(error);
      }
    });
};


/***
* This function is used for service request with POST as request type
* and send back completion in resolve or reject based on parent Promise.
* @param {*} url
* @param {*} resolve
* @param {*} reject
* @param {*} config
*/
const doPut = (url, params, resolve, reject, config = {}) => {
  const headers = config
  API.put(url, params, { headers })
    .then((response) => {
      parseResponse(response).then((parsedResponse) => {
        if (parsedResponse.isSuccess) {
          resolve({ response: parsedResponse.response });
        } else {
          reject(parsedResponse.message);
        }
      });
    }).catch((error) => {
      if (error?.response?.status == 401) {
        //DeviceEventEmitter.emit('performLogout', "")
        reject(error);
      } else {
        reject(error);
      }
    });
};
/***
 * This function is used for service request with POST as request type
 * and send back completion in resolve or reject based on parent Promise.
 * @param {*} url
 * @param {*} resolve
 * @param {*} reject
 * @param {*} config
 */
const doMultiPart = (url, params, resolve, reject, config = {}) => {
  const headers = config
  headers['content-type'] = 'multipart/form-data';
  //
  API.post(url, params, { headers })
    .then((response) => {
      parseResponse(response).then((parsedResponse) => {
        if (parsedResponse.isSuccess) {
          resolve({ response: parsedResponse.response });
        } else {
          reject(parsedResponse.message);
        }
      });
    }).catch((error) => {
      if (error?.response?.status === 422) {
        const errorData = error.response.data;
        const generalMessage = errorData.message;
        const fieldErrors = errorData.errors;
        reject({ message: generalMessage, fieldErrors });
      }
      if (error?.response?.status == 401) {
        // DeviceEventEmitter.emit('performLogout', "")
        reject(error);
      } else {
        reject(error);
      }
    });
};



/***
 * This function is used for service request with GET as request type
 * and send back completion in resolve or reject based on parent Promise.
 * @param {*} url
 * @param {*} resolve
 * @param {*} reject
 * @param {*} config
 */
const doDelete = (url, resolve, reject, config = {}) => {
  const headers = config

  API.delete(url, { headers })
    .then((response) => {
      parseResponse(response).then((parsedResponse) => {
        if (parsedResponse.isSuccess) {
          resolve({ response: parsedResponse.response });
        } else {
          reject(parsedResponse.message);
        }
      });
    })
    .catch((error) => {
      if (error?.response?.status == 401) {
        // DeviceEventEmitter.emit('performLogout', "")
        reject(error);
      } else {
        reject(error);
      }
    });
};