import grpcClient from '@lib/grpc-client';

const listEndpoints = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.Endpoint.list(params);

    return response;
};

export {
    listEndpoints
};
