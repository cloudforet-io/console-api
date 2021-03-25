import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const createSecret = async (params) => {
    if (['CREDENTIALS','CONFIG'].indexOf(params.secret_type) === -1) {
        throw new Error('Wrong enum value. (secret_type = CREDENTIALS | CONFIG');
    }
    const secretV1 = await grpcClient.get('secret', 'v1');
    const response = await secretV1.Secret.create(params);

    return response;
};

const updateSecret = async (params) => {
    const secretV1 = await grpcClient.get('secret', 'v1');
    const response = await secretV1.Secret.update(params);

    return response;
};



const deleteSecret = async (params) => {
    const secretV1 = await grpcClient.get('secret', 'v1');
    const response = await secretV1.Secret.delete(params);

    return response;
};


const getSecret = async (params) => {
    const secretV1 = await grpcClient.get('secret', 'v1');
    const response = await secretV1.Secret.get(params);

    return response;
};

const listSecrets = async (params) => {
    const secretV1 = await grpcClient.get('secret', 'v1');
    const response = await secretV1.Secret.list(params);

    return response;
};


const statSecrets = async (params) => {
    const secretV1 = await grpcClient.get('secret', 'v1');
    const response = await secretV1.Secret.stat(params);

    return response;
};


export {
    createSecret,
    updateSecret,
    deleteSecret,
    getSecret,
    listSecrets,
    statSecrets
};
