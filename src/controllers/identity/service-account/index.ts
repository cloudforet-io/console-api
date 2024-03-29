import { essentialParamErrorHandler, ErrorModel } from '@lib/error';
import grpcClient from '@lib/grpc-client';

const createServiceAccount = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.ServiceAccount.create(params);

    return response;
};

const updateServiceAccount = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.ServiceAccount.update(params);

    return response;
};

const deleteServiceAccount = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.ServiceAccount.delete(params);

    return response;
};

const getServiceAccount = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.ServiceAccount.get(params);

    return response;
};

const listServiceAccounts = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.ServiceAccount.list(params);

    return response;
};

const changeServiceAccountProject = async (params) => {
    essentialParamErrorHandler(params, ['service_accounts', ['project_id', 'release_project']]);

    const identityV1 = await grpcClient.get('identity', 'v1');

    let successCount = 0;
    let failCount = 0;
    const failItems = {};

    const promises = params.service_accounts.map(async (service_account_id) => {
        try {
            const reqParams = {
                service_account_id: service_account_id,
                ... params.project_id && { project_id : params.project_id },
                ... params.release_project && { release_project : params.release_project },
                ... params.domain_id && { domain_id : params.domain_id }
            };

            await identityV1.ServiceAccount.update(reqParams);
            successCount = successCount + 1;
        } catch (e: any) {
            failItems[service_account_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        const error: ErrorModel = new Error(`Failed to change service account's project. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const statServiceAccounts = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.ServiceAccount.stat(params);

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
