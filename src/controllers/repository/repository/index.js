import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const registerRepository = async (params) => {
    let repositoryV1 = await grpcClient.get('repository', 'v1');
    let response = await repositoryV1.Repository.register(params);

    return response;
};

const updateRepository = async (params) => {
    let repositoryV1 = await grpcClient.get('repository', 'v1');
    let response = await repositoryV1.Repository.update(params);

    return response;
};


const deregisterRepository = async (params) => {
    let repositoryV1 = await grpcClient.get('repository', 'v1');
    let response = await repositoryV1.Repository.deregister(params);

    return response;
};

const getRepository = async (params) => {
    let repositoryV1 = await grpcClient.get('repository', 'v1');
    let response = await repositoryV1.Repository.get(params);

    return response;
};

const listRepositories = async (params) => {
    let repositoryV1 = await grpcClient.get('repository', 'v1');
    let response = await repositoryV1.Repository.list(params);

    return response;
};

const statRepositories = async (params) => {
    let repositoryV1 = await grpcClient.get('repository', 'v1');
    let response = await repositoryV1.Repository.stat(params);

    return response;
};

export {
    registerRepository,
    updateRepository,
    deregisterRepository,
    getRepository,
    listRepositories,
    statRepositories
};
