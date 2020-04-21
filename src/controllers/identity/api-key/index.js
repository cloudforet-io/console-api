import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const createAPIKey = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.APIKey.create(params);

    return response;
};

const deleteAPIKey = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.APIKey.delete(params);

    return response;
};

const enableAPIKey = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.APIKey.enable(params);

    return response;
};

const disableAPIKey = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.APIKey.disable(params);

    return response;
};

const updateAllowedHostsAPIKey = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.APIKey.update_allowed_hosts(params);

    return response;
};

const getAPIKey = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.APIKey.get(params);

    return response;
};

const listAPIKeys = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.APIKey.list(params);

    return response;
};

const statAPIKeys = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.APIKey.stat(params);

    return response;
};

export {
    createAPIKey,
    deleteAPIKey,
    enableAPIKey,
    disableAPIKey,
    updateAllowedHostsAPIKey,
    getAPIKey,
    listAPIKeys,
    statAPIKeys
};
