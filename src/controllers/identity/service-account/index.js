import grpcClient from '@lib/grpc-client';
import { changeQueryKeyword } from '@lib/utils';
import logger from '@lib/logger';

const createServiceAccount = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.ServiceAccount.create(params);

    return response;
};

const updateServiceAccount = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.ServiceAccount.update(params);

    return response;
};

const deleteServiceAccount = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.ServiceAccount.delete(params);

    return response;
};

const getServiceAccount = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.ServiceAccount.get(params);

    return response;
};

const listServiceAccounts = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.ServiceAccount.list(params);

    return response;
};

export {
    createServiceAccount,
    updateServiceAccount,
    deleteServiceAccount,
    getServiceAccount,
    listServiceAccounts
};
