import grpcClient from '@lib/grpc-client';
import { pageItems, filterItems, changeQueryKeyword } from '@lib/utils';
import logger from '@lib/logger';

const createSecretGroup = async (params) => {
    let secretV1 = await grpcClient.get('secret', 'v1');
    let response = await secretV1.SecretGroup.create(params);

    return response;
};

const updateSecretGroup = async (params) => {
    let secretV1 = await grpcClient.get('secret', 'v1');
    let response = await secretV1.SecretGroup.update(params);

    return response;
};


const deleteSecretGroup = async (params) => {
    let secretV1 = await grpcClient.get('secret', 'v1');
    let response = await secretV1.SecretGroup.delete(params);

    return response;
};

const getSecretGroup = async (params) => {
    let secretV1 = await grpcClient.get('secret', 'v1');
    let response = await secretV1.SecretGroup.get(params);

    return response;
};

const listSecretGroups = async (params) => {
    changeQueryKeyword(params.query, ['credential_group_id', 'name']);
    let secretV1 = await grpcClient.get('secret', 'v1');
    let response = await secretV1.SecretGroup.list(params);

    return response;
};

const addSecret = async (params) => {
    if (!params.secrets) {
        throw new Error('Required Parameter. (key = secrets)');
    }

    let secretV1 = await grpcClient.get('secret', 'v1');

    let successCount = 0;
    let failCount = 0;
    let failItems = {};

    for (let i=0; i < params.secrets.length; i++) {
        let secret_id = params.secrets[i];
        try {
            let reqParams = {
                secret_id: secret_id,
                secret_group_id: params.secret_group_id
            };

            if (params.domain_id) {
                reqParams.domain_id = params.domain_id;
            }

            await secretV1.SecretGroup.add_secret(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[secret_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    }

    if (failCount > 0) {
        let error = new Error(`Failed to add secrets. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const removeSecret = async (params) => {
    if (!params.secrets) {
        throw new Error('Required Parameter. (key = secrets)');
    }

    let secretV1 = await grpcClient.get('secret', 'v1');

    let successCount = 0;
    let failCount = 0;
    let failItems = {};

    for (let i=0; i < params.secrets.length; i++) {
        let secret_id = params.secrets[i];
        try {
            let reqParams = {
                secret_id: secret_id,
                secret_group_id: params.secret_group_id
            };

            if (params.domain_id) {
                reqParams.domain_id = params.domain_id;
            }

            await secretV1.SecretGroup.remove_secret(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[secret_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    }

    if (failCount > 0) {
        let error = new Error(`Failed to remove secrets. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

export {
    createSecretGroup,
    updateSecretGroup,
    deleteSecretGroup,
    getSecretGroup,
    listSecretGroups,
    addSecret,
    removeSecret
};