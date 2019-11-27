import axios from 'axios';
import config from 'config';
import httpContext from 'express-http-context';

const setResponseInterceptor = (axiosInstance) => {
    axiosInstance.interceptors.response.use((response) => {
        return response;
    }, (e) => {
        if (e.response) {
            let responseError = e.response.data.error;
            let errorMessage = (responseError)?responseError.message:e.response.statusText;
            let error = new Error(`AXIOS ERROR: ${errorMessage}`);
            error.status = e.response.status;

            if (responseError) {
                error.error_code = e.response.data.error.code;
            }

            return Promise.reject(error);

        } else {
            let error = new Error(`AXIOS ERROR: ${e.message}`);
            return Promise.reject(error);
        }
    });
}

const get = (name) => {
    let axiosConfig = {
        baseURL: config.get('baseURL'),
        headers: {
            'Content-Type': 'application/json'
        }
    };

    let token = httpContext.get('token');
    if (token) {
        axiosConfig.headers['Authorization'] = `Bearer ${token}`;
    }

    let routes = config.get('routes');
    if (routes[name]) {
        axiosConfig.baseURL = routes[name];
    }

    let instance = axios.create(axiosConfig);
    setResponseInterceptor(instance);

    return instance;
};

export default {
    get
};
