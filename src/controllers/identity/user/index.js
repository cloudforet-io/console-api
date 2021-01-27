import grpcClient from '@lib/grpc-client';
import _ from 'lodash';
import logger from '@lib/logger';


const createUser = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.User.create(params);

    return response;
};

const updateUser = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.User.update(params);

    return response;
};

const deleteUsers = async (params) => {
    if (!params.users) {
        throw new Error('Required Parameter. (key = users)');
    }

    let identityV1 = await grpcClient.get('identity', 'v1');

    let successCount = 0;
    let failCount = 0;
    let failItems = {};

    let promises = params.users.map(async (user_id) => {
        try {

            const reqParams = {
                user_id: user_id,
                ... params.domain_id && {domain_id : params.domain_id}
            };

            await identityV1.User.delete(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[user_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        let error = new Error(`Failed to delete users. (success: ${successCount}, failure: ${failCount})`);
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

    let identityV1 = await grpcClient.get('identity', 'v1');

    let successCount = 0;
    let failCount = 0;
    let failItems = {};

    let promises = params.users.map(async (user_id) => {
        try {
            let reqParams = {
                user_id: user_id,
                ... params.domain_id && {domain_id : params.domain_id}
            };

            await identityV1.User.enable(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[user_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        let error = new Error(`Failed to enable users. (success: ${successCount}, failure: ${failCount})`);
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

    let identityV1 = await grpcClient.get('identity', 'v1');

    let successCount = 0;
    let failCount = 0;
    let failItems = {};

    let promises = params.users.map(async (user_id) => {
        try {
            let reqParams = {
                user_id: user_id,
                ... params.domain_id && {domain_id : params.domain_id}
            };

            await identityV1.User.disable(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[user_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        let error = new Error(`Failed to disable users. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const updateRoleUser = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.User.update_role(params);

    return response;
};

const findUser = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.User.find(params);

    return response;
};

const syncUser = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.User.sync(params);

    return response;
};

const getUser = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.User.get(params);

    if (params.include_role_binding === true) {
        const rbResponse = await identityV1.RoleBinding.list({
            resource_type: 'identity.User',
            resource_id: response.user_id
        });
        response.role_bindings = rbResponse.results;
    }

    return response;
};

const getUserRoleBindings = async (response) => {
    let identityV1 = await grpcClient.get('identity', 'v1');

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
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.User.list(params);

    if (params.include_role_binding === true) {
        return getUserRoleBindings(response);
    }

    return response;
};


const statUsers = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.User.stat(params);

    return response;
};

export {
    createUser,
    updateUser,
    deleteUsers,
    enableUsers,
    disableUsers,
    updateRoleUser,
    findUser,
    syncUser,
    getUser,
    listUsers,
    statUsers
};
