//@ts-nocheck
import axios from 'axios';
import config from 'config';
import httpContext from 'express-http-context';

const setResponseInterceptor = (axiosInstance) => {
    axiosInstance.interceptors.response.use((response) => {
        return response;
    }, (e) => {
        if (e.response) {
            const responseError = e.response.data.error;
            const errorMessage = (responseError)?responseError.message:e.response.statusText;
            const error = new Error(`AXIOS ERROR: ${errorMessage}`);
            error.status = e.response.status;

            if (responseError) {
                error.error_code = e.response.data.error.code;
            }

            return Promise.reject(error);

        } else {
            const error = new Error(`AXIOS ERROR: ${e.message}`);
            return Promise.reject(error);
        }
    });
};

const get = (name) => {
    const axiosConfig = {
        baseURL: config.get('baseURL'),
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const token = httpContext.get('token');
    if (token) {
        axiosConfig.headers['Authorization'] = `Bearer ${token}`;
    }

    const routes = config.get('routes');
    if (routes[name]) {
        axiosConfig.baseURL = routes[name];
    }

    const instance = axios.create(axiosConfig);
    setResponseInterceptor(instance);

    return instance;
};

export default {
    get
};
