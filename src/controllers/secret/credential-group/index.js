import grpcClient from '@lib/grpc-client';
import { pageItems, filterItems, changeQueryKeyword } from '@lib/utils';
import logger from '@lib/logger';

const createCredentialGroup = async (params) => {
    let secretV1 = await grpcClient.get('secret', 'v1');
    let response = await secretV1.CredentialGroup.create(params);

    return response;
};

const updateCredentialGroup = async (params) => {
    let secretV1 = await grpcClient.get('secret', 'v1');
    let response = await secretV1.CredentialGroup.update(params);

    return response;
};


const deleteCredentialGroup = async (params) => {
    let secretV1 = await grpcClient.get('secret', 'v1');
    let response = await secretV1.CredentialGroup.delete(params);

    return response;
};

const getCredentialGroup = async (params) => {
    let secretV1 = await grpcClient.get('secret', 'v1');
    let response = await secretV1.CredentialGroup.get(params);

    return response;
};

const listCredentialGroups = async (params) => {
    changeQueryKeyword(params.query, ['credential_group_id', 'name']);
    let secretV1 = await grpcClient.get('secret', 'v1');
    let response = await secretV1.CredentialGroup.list(params);

    return response;
};

const addCredential = async (params) => {
    if (!params.credentials) {
        throw new Error('Required Parameter. (key = credentials)');
    }

    let secretV1 = await grpcClient.get('secret', 'v1');

    let successCount = 0;
    let failCount = 0;
    let failItems = {};

    for (let i=0; i < params.credentials.length; i++) {
        let credential_id = params.credentials[i];
        try {
            let reqParams = {
                credential_id: credential_id,
                credential_group_id: params.credential_group_id
            };

            if (params.domain_id) {
                reqParams.domain_id = params.domain_id;
            }

            await secretV1.CredentialGroup.add_credential(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[credential_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    }

    if (failCount > 0) {
        let error = new Error(`Failed to add credentials. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const removeCredential = async (params) => {
    if (!params.credentials) {
        throw new Error('Required Parameter. (key = credentials)');
    }

    let secretV1 = await grpcClient.get('secret', 'v1');

    let successCount = 0;
    let failCount = 0;
    let failItems = {};

    for (let i=0; i < params.credentials.length; i++) {
        let credential_id = params.credentials[i];
        try {
            let reqParams = {
                credential_id: credential_id,
                credential_group_id: params.credential_group_id
            };

            if (params.domain_id) {
                reqParams.domain_id = params.domain_id;
            }

            await secretV1.CredentialGroup.remove_credential(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[credential_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    }

    if (failCount > 0) {
        let error = new Error(`Failed to remove credentials. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

export {
    createCredentialGroup,
    updateCredentialGroup,
    deleteCredentialGroup,
    getCredentialGroup,
    listCredentialGroups,
    addCredential,
    removeCredential
};
