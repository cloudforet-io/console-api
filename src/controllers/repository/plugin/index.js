import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const registerPlugin = async (params) => {
    let repositoryV1 = await grpcClient.get('repository', 'v1');
    let response = await repositoryV1.Plugin.register(params);

    return response;
};

const updatePlugin = async (params) => {
    let repositoryV1 = await grpcClient.get('repository', 'v1');
    let response = await repositoryV1.Plugin.update(params);

    return response;
};

const enablePlugin = async (params) => {
    let repositoryV1 = await grpcClient.get('repository', 'v1');
    let response = await repositoryV1.Plugin.enable(params);

    return response;
};

const disablePlugin = async (params) => {
    let repositoryV1 = await grpcClient.get('repository', 'v1');
    let response = await repositoryV1.Plugin.disable(params);

    return response;
};

const deregisterPlugin = async (params) => {
    let repositoryV1 = await grpcClient.get('repository', 'v1');
    let response = await repositoryV1.Plugin.deregister(params);

    return response;
};

const getPluginVersions = async (params) => {
    let repositoryV1 = await grpcClient.get('repository', 'v1');
    let response = await repositoryV1.Plugin.get_versions(params);

    return response;
};

const getPlugin = async (params) => {
    let repositoryV1 = await grpcClient.get('repository', 'v1');
    let response = await repositoryV1.Plugin.get(params);

    return response;
};

const listPlugins = async (params) => {
    let repositoryV1 = await grpcClient.get('repository', 'v1');
    let response = await repositoryV1.Plugin.list(params);

    return response;
};

const statPlugins = async (params) => {
    let repositoryV1 = await grpcClient.get('repository', 'v1');
    let response = await repositoryV1.Plugin.stat(params);

    return response;
};

export {
    registerPlugin,
    updatePlugin,
    enablePlugin,
    disablePlugin,
    deregisterPlugin,
    getPluginVersions,
    getPlugin,
    listPlugins,
    statPlugins
};
