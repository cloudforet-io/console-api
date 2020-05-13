import grpcClient from '@lib/grpc-client';
import _ from 'lodash';
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

const changeServiceAccountProject = async (params) => {
    if (!params.service_accounts) {
        throw new Error('Required Parameter. (key = service_accounts)');
    }

    if (!(params.project_id || params.release_project)) {
        throw new Error('Required Parameter. (key = project_id or release_project)');
    }

    let identityV1 = await grpcClient.get('identity', 'v1');

    let successCount = 0;
    let failCount = 0;
    let failItems = {};

    let promises = params.service_accounts.map(async (service_account_id) => {
        try {
            let reqParams = {
                service_account_id: service_account_id
            };

            if (params.project_id)  _.set(reqParams, 'project_id', params.project_id);
            if (params.release_project)  _.set(reqParams, 'release_project', params.release_project)
            if (params.domain_id)  _.set(reqParams, 'domain_id', params.domain_id);

            await identityV1.ServiceAccount.update(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[service_account_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        let error = new Error(`Failed to change service account's project. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const statServiceAccounts = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.ServiceAccount.stat(params);

    return response;
};

export {
    createServiceAccount,
    updateServiceAccount,
    deleteServiceAccount,
    getServiceAccount,
    changeServiceAccountProject,
    listServiceAccounts,
    statServiceAccounts
};
