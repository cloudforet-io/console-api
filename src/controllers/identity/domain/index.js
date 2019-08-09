import grpcClient from '@lib/grpc-client';
import * as wellKnownType from '@lib/grpc-client/well-known-type';

const createDomain = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');

    wellKnownType.struct.encode(params, ['tags', 'config']);
    let response = await identityV1.Domain.create(params);
    wellKnownType.struct.decode(response, ['tags', 'config']);

    return response;
};

const updateDomain = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');

    wellKnownType.struct.encode(params, ['tags', 'config']);
    let response = await identityV1.Domain.update(params);
    wellKnownType.struct.decode(response, ['tags', 'config']);

    return response;
};

const deleteDomain = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Domain.delete(params);

    return response;
};

const getDomain = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');

    let response = await identityV1.Domain.get(params);
    wellKnownType.struct.decode(response, ['tags', 'config']);

    return response;
};

const listDomains = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');

    let response = await identityV1.Domain.list(params);
    wellKnownType.struct.decode(response.results, ['tags', 'config']);

    return response;
};

export {
    createDomain,
    updateDomain,
    deleteDomain,
    getDomain,
    listDomains
};
