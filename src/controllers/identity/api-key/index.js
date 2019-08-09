import grpcClient from '@lib/grpc-client';
import * as wellKnownType from '@lib/grpc-client/well-known-type';

const createAPIKey = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.APIKey.create(params);

    return response;
};

const listAPIKeys = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');

    let response = await identityV1.APIKeys.list(params);

    return response;
};

export {
    createAPIKey,
    listAPIKeys
};
