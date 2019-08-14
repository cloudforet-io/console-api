import grpcClient from '@lib/grpc-client';

const listPlugins = async (params) => {
    let repositoryV1 = await grpcClient.get('repository', 'v1');
    let response = await repositoryV1.Plugin.list(params);

    return response;
};

export {
    listPlugins
};
