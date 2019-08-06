import grpcClient from 'lib/grpc-client';
import * as wellKnownType from 'lib/grpc-client/well-known-type';

const listUsers = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');

    let response = await identityV1.User.list(params);
    wellKnownType.struct.decode(response.results, ['tags']);

    return response;
};

export default listUsers;
