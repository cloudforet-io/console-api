import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const registerRemoteRepository = async (params) => {
    let repositoryV1 = await grpcClient.get('repository', 'v1');
    let response = await repositoryV1.RemoteRepository.register(params);

    return response;
};

const updateRemoteRepository = async (params) => {
    let repositoryV1 = await grpcClient.get('repository', 'v1');
    let response = await repositoryV1.RemoteRepository.update(params);

    return response;
};


const deregisterRemoteRepository = async (params) => {
    let repositoryV1 = await grpcClient.get('repository', 'v1');
    let response = await repositoryV1.RemoteRepository.deregister(params);

    return response;
};

const getRemoteRepository = async (params) => {
    let repositoryV1 = await grpcClient.get('repository', 'v1');
    let response = await repositoryV1.RemoteRepository.get(params);

    return response;
};

const listRemoteRepositories = async (params) => {
    let repositoryV1 = await grpcClient.get('repository', 'v1');
    let response = await repositoryV1.RemoteRepository.list(params);

    return response;
};

export {
    registerRemoteRepository,
    updateRemoteRepository,
    deregisterRemoteRepository,
    getRemoteRepository,
    listRemoteRepositories
};
