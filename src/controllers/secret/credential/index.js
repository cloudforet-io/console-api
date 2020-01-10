import grpcClient from '@lib/grpc-client';
import { changeQueryKeyword } from '@lib/utils';
import logger from '@lib/logger';

const createCredential = async (params) => {
    let secretV1 = await grpcClient.get('secret', 'v1');
    let response = await secretV1.Credential.create(params);

    return response;
};

const updateCredential = async (params) => {
    let secretV1 = await grpcClient.get('secret', 'v1');
    let response = await secretV1.Credential.update(params);

    return response;
};


const deleteCredential = async (params) => {
    if (!params.credentials) {
        throw new Error('Required Parameter. (key = credentials)');
    }

    let secretV1 = await grpcClient.get('secret', 'v1');

    let successCount = 0;
    let failCount = 0;
    let failItems = {};

    let promises = params.credentials.map(async (credential_id) => {
        try {
            let reqParams = {
                credential_id: credential_id
            };

            if (params.domain_id) {
                reqParams.domain_id = params.domain_id;
            }

            await secretV1.Credential.delete(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[credential_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });

    await Promise.all(promises);

    if (failCount > 0) {
        let error = new Error(`Failed to delete credentials. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const getCredential = async (params) => {
    let secretV1 = await grpcClient.get('secret', 'v1');
    let response = await secretV1.Credential.get(params);

    return response;
};

const listCredentials = async (params) => {
    changeQueryKeyword(params.query, ['credential_id', 'name']);
    let secretV1 = await grpcClient.get('secret', 'v1');
    let response = await secretV1.Credential.list(params);

    return response;
};

export {
    createCredential,
    updateCredential,
    deleteCredential,
    getCredential,
    listCredentials
};
