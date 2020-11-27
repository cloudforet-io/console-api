import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const listEndpoints = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Endpoint.list(params);

    return response;
};

export {
    listEndpoints
};
