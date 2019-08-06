import grpcClient from 'lib/grpc-client';
import * as wellKnownType from 'lib/grpc-client/well-known-type';

const listDomains = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');

    let response = await identityV1.Domain.list(params);
    wellKnownType.struct.decode(response.results, ['tags', 'config']);

    return response;
};

export default listDomains;
