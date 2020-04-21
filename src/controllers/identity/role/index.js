import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const createRole = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Role.create(params);

    return response;
};

const updateRole = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Role.update(params);

    return response;
};

const deleteRole = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Role.delete(params);

    return response;
};

const getRole = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Role.get(params);

    return response;
};

const listRoles = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Role.list(params);

    return response;
};

const statRoles = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Role.stat(params);

    return response;
};

export {
    createRole,
    updateRole,
    deleteRole,
    getRole,
    listRoles,
    statRoles
};
