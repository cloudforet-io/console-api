import grpcClient from 'lib/grpc-client';
import * as wellKnownType from 'lib/grpc-client/well-known-type';

const createDomain = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');

    wellKnownType.struct.encode(params, ['tags']);
    let response = await identityV1.Domain.create(params);
    wellKnownType.struct.decode(response, ['tags', 'config']);

    return response;
};

export default createDomain;
