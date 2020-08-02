import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const createPolicy = async (params) => {
    let repositoryV1 = await grpcClient.get('repository', 'v1');
    let response = await repositoryV1.Policy.create(params);

    return response;
};

const updatePolicy = async (params) => {
    let repositoryV1 = await grpcClient.get('repository', 'v1');
    let response = await repositoryV1.Policy.update(params);

    return response;
};

const deletePolicy = async (params) => {
    let repositoryV1 = await grpcClient.get('repository', 'v1');
    let response = await repositoryV1.Policy.delete(params);

    return response;
};

const getPolicy = async (params) => {
    let repositoryV1 = await grpcClient.get('repository', 'v1');
    let response = await repositoryV1.Policy.get(params);

    return response;
};

const listPolicies = async (params) => {
    let repositoryV1 = await grpcClient.get('repository', 'v1');
    let response = await repositoryV1.Policy.list(params);

    return response;
};

const statPolicies = async (params) => {
    let repositoryV1 = await grpcClient.get('repository', 'v1');
    let response = await repositoryV1.Policy.stat(params);

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
