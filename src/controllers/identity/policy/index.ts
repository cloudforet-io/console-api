import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const createPolicy = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.Policy.create(params);

    return response;
};

const updatePolicy = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.Policy.update(params);

    return response;
};

const deletePolicy = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.Policy.delete(params);

    return response;
};

const getPolicy = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.Policy.get(params);

    return response;
};

const listPolicies = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.Policy.list(params);

    return response;
};

const statPolicies = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.Policy.stat(params);

    return response;
};

export {
    createPolicy,
    updatePolicy,
    deletePolicy,
    getPolicy,
    listPolicies,
    statPolicies
};
