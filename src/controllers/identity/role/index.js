import grpcClient from '@lib/grpc-client';
import { changeQueryKeyword } from '@lib/utils';
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
    changeQueryKeyword(params.query, ['role_id', 'name']);
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Role.list(params);

    return response;
};

export {
    createRole,
    updateRole,
    deleteRole,
    getRole,
    listRoles
};
