import axios from 'axios';
import config from 'config';
import httpContext from 'express-http-context';

const client = (name) => {
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

    console.log(axiosConfig);

    let instance = axios.create(axiosConfig);

    return instance;
};

const errorHandler = (e) => {
    if (e.response) {
        let errorMessage = e.response.data.message || e.response.statusText;
        let error = new Error(`AXIOS ERROR: ${errorMessage}`);
        error.status = e.response.status;

        if (e.response.data.code) {
            error.code = e.response.data.code;
        }
        throw(error);

    } else {
        let error = new Error(`AXIOS ERROR: ${e.message}`);
        throw(error);
    }
};

export {
    client,
    errorHandler
};
