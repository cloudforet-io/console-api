import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const createRole = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.Role.create(params);

    return response;
};

const updateRole = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.Role.update(params);

    return response;
};

const deleteRole = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.Role.delete(params);

    return response;
};

const getRole = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.Role.get(params);

    return response;
};

const listRoles = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.Role.list(params);

    return response;
};

const statRoles = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.Role.stat(params);

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
