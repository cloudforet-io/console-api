import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const createCredential = async (params) => {
    let secretV1 = await grpcClient.get('secret', 'v1');
    let response = await secretV1.Credential.create(params);

    return response;
};

const updateCredential = async (params) => {
    let secretV1 = await grpcClient.get('secret', 'v1');
    let response = await secretV1.Credential.update(params);

    return response;
};


const deleteCredential = async (params) => {
    let secretV1 = await grpcClient.get('secret', 'v1');
    let response = await secretV1.Credential.delete(params);

    return response;
};

const getCredential = async (params) => {
    let secretV1 = await grpcClient.get('secret', 'v1');
    let response = await secretV1.Credential.get(params);

    return response;
};

const listCredentials = async (params) => {
    let secretV1 = await grpcClient.get('secret', 'v1');
    let response = await secretV1.Credential.list(params);

    return response;
};

export {
    createCredential,
    updateCredential,
    deleteCredential,
    getCredential,
    listCredentials
};
