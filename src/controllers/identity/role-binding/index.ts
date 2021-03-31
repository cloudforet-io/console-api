import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const createRoleBinding = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.RoleBinding.create(params);

    return response;
};

const updateRoleBinding = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.RoleBinding.update(params);

    return response;
};

const deleteRoleBinding = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.RoleBinding.delete(params);

    return response;
};

const getRoleBinding = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.RoleBinding.get(params);

    return response;
};

const listRoleBindings = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.RoleBinding.list(params);

    return response;
};

const statRoleBindings = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.RoleBinding.stat(params);

    return response;
};

export {
    createRoleBinding,
    updateRoleBinding,
    deleteRoleBinding,
    getRoleBinding,
    listRoleBindings,
    statRoleBindings
};
