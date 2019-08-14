import axios from 'axios';
import config from 'config';

const client = (name, token) => {
    let headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    let instance = axios.create({
        baseURL: config.get(`routes.${name}`),
        headers: headers
    });

    return instance;
};

const errorHandler = (e) => {
    console.log(e.response);
    let error = new Error(e.response.data.message || e.response.statusText);
    error.status = e.response.status;

    if (e.response.data.code) {
        error.code = e.response.data.code;
    }
    throw(error);
};

export {
    client,
    errorHandler
};
