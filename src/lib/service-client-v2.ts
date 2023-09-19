import axios, { AxiosInstance } from 'axios';
import config from 'config';
import httpContext from 'express-http-context';

import { ErrorModel } from '@lib/error';

const setResponseInterceptor = (axiosInstance :AxiosInstance) => {
    const errorContext = new Error('Thrown At: ');

    axiosInstance.interceptors.response.use(undefined, (e) => {
        const originalErrorStackTrace = errorContext?.stack;
        if (e.response) {
            const responseError = e.response.data.error;
            const errorMessage = (responseError)?responseError.message:e.response.statusText;

            const error: ErrorModel = new Error(`SERVICE CLIENT ERROR: ${errorMessage}`);
            error.status = e.response.status;
            if (responseError) {
                error.error_code = e.response.data.error.code;
            }
            if (originalErrorStackTrace) {
                error.stack = `${error.stack}\n${originalErrorStackTrace}`;
            }

            return Promise.reject(error);

        } else {
            const error = new Error(`SERVICE CLIENT ERROR: ${e.message}`);
            if (originalErrorStackTrace) {
                error.stack = `${error.stack}\n${originalErrorStackTrace}`;
            }
            return Promise.reject(error);
        }
    });
};


const serviceClientV2 =  {
    get(name) {
        const axiosConfig = {
            baseURL: config.get('baseURLV2'),
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
    }
};

export default serviceClientV2;
