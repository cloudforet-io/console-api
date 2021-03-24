import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const createDomainOwner = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.DomainOwner.create(params);

    return response;
};

const updateDomainOwner = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.DomainOwner.update(params);

    return response;
};

const deleteDomainOwner = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.DomainOwner.delete(params);

    return response;
};

const getDomainOwner = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.DomainOwner.get(params);
    return response;
};


export {
    createDomainOwner,
    updateDomainOwner,
    deleteDomainOwner,
    getDomainOwner
};
