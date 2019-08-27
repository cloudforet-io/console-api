import axios from 'axios';
import config from 'config';
import httpContext from 'express-http-context';

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

    return instance;
};

const errorHandler = (e) => {
    if (e.response) {
        let errorMessage = (e.response.data.error)?e.response.data.error.message:e.response.statusText;
        let error = new Error(`AXIOS ERROR: ${errorMessage}`);
        error.status = e.response.status;

        if (e.response.data.error) {
            error.error_code = e.response.data.error.code;
        }

        throw(error);

    } else {
        let error = new Error(`AXIOS ERROR: ${e.message}`);
        throw(error);
    }
};

export default {
    get,
    errorHandler
};
