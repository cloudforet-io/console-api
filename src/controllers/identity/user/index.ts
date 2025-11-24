import { networkInterfaces } from 'os';

import { statAPIKeys } from '@controllers/identity/api-key';
import { ErrorModel } from '@lib/error';
import grpcClient from '@lib/grpc-client';

const createUser = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.User.create(params);

    return response;
};

const updateUser = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.User.update(params);

    return response;
};

const setRequiredActions = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.User.set_required_actions(params);

    return response;
};

const deleteUsers = async (params) => {
    if (!params.users) {
        throw new Error('Required Parameter. (key = users)');
    }

    const identityV1 = await grpcClient.get('identity', 'v1');

    let successCount = 0;
    let failCount = 0;
    const failItems = {};

    const promises = params.users.map(async (user_id) => {
        try {

            const reqParams = {
                user_id: user_id,
                ...params.domain_id && { domain_id: params.domain_id }
            };

            await identityV1.User.delete(reqParams);
            successCount = successCount + 1;
        } catch (e: any) {
            failItems[user_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        const error: ErrorModel = new Error(`Failed to delete users. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const enableUsers = async (params) => {
    if (!params.users) {
        throw new Error('Required Parameter. (key = users)');
    }

    const identityV1 = await grpcClient.get('identity', 'v1');

    let successCount = 0;
    let failCount = 0;
    const failItems = {};

    const promises = params.users.map(async (user_id) => {
        try {
            const reqParams = {
                user_id: user_id,
                ...params.domain_id && { domain_id: params.domain_id }
            };

            await identityV1.User.enable(reqParams);
            successCount = successCount + 1;
        } catch (e: any) {
            failItems[user_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        const error: ErrorModel = new Error(`Failed to enable users. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const disableUsers = async (params) => {
    if (!params.users) {
        throw new Error('Required Parameter. (key = users)');
    }

    const identityV1 = await grpcClient.get('identity', 'v1');

    let successCount = 0;
    let failCount = 0;
    const failItems = {};

    const promises = params.users.map(async (user_id) => {
        try {
            const reqParams = {
                user_id: user_id,
                ...params.domain_id && { domain_id: params.domain_id }
            };

            await identityV1.User.disable(reqParams);
            successCount = successCount + 1;
        } catch (e: any) {
            failItems[user_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        const error: ErrorModel = new Error(`Failed to disable users. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const updateRoleUser = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.User.update_role(params);

    return response;
};

const findUser = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.User.find(params);

    return response;
};

const syncUser = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.User.sync(params);

    return response;
};

const getUser = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.User.get(params);

    if (params.include_role_binding === true) {
        const rbResponse = await identityV1.RoleBinding.list({
            resource_type: 'identity.User',
            resource_id: response.user_id
        });
        response.role_bindings = rbResponse.results;
    }

    return response;
};

const getUserAPIKeyCount = async () => {
    const requestParams = {
        query: {
            aggregate: [
                {
                    group: {
                        keys: [
                            {
                                key: 'user_id',
                                name: 'user_id'
                            }
                        ],
                        fields: [
                            {
                                name: 'api_key_count',
                                key: 'api_key_id',
                                operator: 'count'
                            }
                        ]
                    }
                }
            ],
            filter: []
        }
    };
    const apiResponse = await statAPIKeys(requestParams);
    return apiResponse;
};

const getUserRoleBindings = async (response) => {
    const identityV1 = await grpcClient.get('identity', 'v1');

    const usersInfo = {};

    const userIds = response.results.map((userInfo) => {
        usersInfo[userInfo.user_id] = userInfo;
        usersInfo[userInfo.user_id].role_bindings = [];
        return userInfo.user_id;
    });

    const rbResponse = await identityV1.RoleBinding.list({
        resource_type: 'identity.User',
        query: {
            filter: [
                {
                    key: 'resource_id',
                    value: userIds,
                    operator: 'in'
                }
            ]
        }
    });

    rbResponse.results.forEach((rbInfo) => {
        usersInfo[rbInfo.resource_id].role_bindings.push(rbInfo);
    });

    return {
        results: Object.keys(usersInfo).map((userId) => { return usersInfo[userId]; }),
        total_count: response.total_count
    };
};

const listUsers = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const [response, apiKeyResp] = await Promise.all([identityV1.User.list(params), getUserAPIKeyCount()]);
    const mergedResp = {
        results: response.results.map(d => ({
            ...d,
            ...apiKeyResp.results.find(data => data.user_id === d.user_id)
        })),
        total_count: response.total_count
    };
    if (params.include_role_binding === true) {
        return getUserRoleBindings(mergedResp);
    }
    return mergedResp;
};


const statUsers = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.User.stat(params);

    return response;
};

const getClientIP = async () => {
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        const netList = nets[name];
        if (netList) {
            for (const net of netList) {
        // Skip internal and non-IPv4 addresses
                if (net.family === 'IPv4' && !net.internal) {
                    return net.address;
                }
            }
        }
    }
    return '127.0.0.1'; // Fallback to localhost
};

export {
    createUser,
    updateUser,
    setRequiredActions,
    deleteUsers,
    enableUsers,
    disableUsers,
    updateRoleUser,
    findUser,
    syncUser,
    getUser,
    listUsers,
    statUsers,
    getUserAPIKeyCount,
    getClientIP
};
