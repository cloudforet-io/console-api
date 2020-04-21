import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const createDomain = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Domain.create(params);

    return response;
};

const updateDomain = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Domain.update(params);

    return response;
};

const deleteDomain = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Domain.delete(params);

    return response;
};

const enableDomain = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Domain.enable(params);

    return response;
};

const disableDomain = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Domain.disable(params);

    return response;
};

const verifyDomainPlugin = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Domain.verify_plugin(params);

    return response;
};

const getDomain = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Domain.get(params);

    return response;
};

const listDomains = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Domain.list(params);

    return response;
};

const statDomains = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Domain.stat(params);

    return response;
};


export {
    createDomain,
    updateDomain,
    deleteDomain,
    enableDomain,
    disableDomain,
    verifyDomainPlugin,
    getDomain,
    listDomains,
    statDomains
};
