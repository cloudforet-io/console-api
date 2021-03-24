import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const createProvider = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.Provider.create(params);

    return response;
};

const updateProvider = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.Provider.update(params);

    return response;
};

const deleteProvider = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.Provider.delete(params);

    return response;
};

const getProvider = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.Provider.get(params);

    return response;
};

const listProviders = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.Provider.list(params);

    return response;
};

const statProviders = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.Provider.stat(params);

    return response;
};

export {
    createProvider,
    updateProvider,
    deleteProvider,
    getProvider,
    listProviders,
    statProviders
};
