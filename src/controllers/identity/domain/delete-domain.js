import grpcClient from 'lib/grpc-client';

const deleteDomain = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Domain.delete(params);

    return response;
};

export default deleteDomain;
