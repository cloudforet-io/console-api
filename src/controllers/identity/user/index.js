import grpcClient from '@lib/grpc-client';
import * as wellKnownType from '@lib/grpc-client/well-known-type';

const createUser = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');

    wellKnownType.struct.encode(params, ['tags']);
    let response = await identityV1.User.create(params);
    wellKnownType.struct.decode(response, ['tags']);

    return response;
};

const listUsers = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');

    let response = await identityV1.User.list(params);
    wellKnownType.struct.decode(response.results, ['tags']);

    return response;
};

export {
    createUser,
    listUsers
};
