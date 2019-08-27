import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
//import serviceClient from '@lib/service-client';


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
            await identityV1.User.delete({user_id: user_id});
            successCount = successCount + 1;
        } catch (e) {
            console.log(e);
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

const enableUser = async (params) => {
    if (!params.users) {
        throw new Error('Required Parameter. (key = users)');
    }

    let identityV1 = await grpcClient.get('identity', 'v1');

    let successCount = 0;
    let failCount = 0;
    let failItems = {};

    let promises = params.users.map(async (user_id) => {
        try {
            await identityV1.User.enable({user_id: user_id});
            successCount = successCount + 1;
        } catch (e) {
            console.log(e);
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

const disableUser = async (params) => {
    if (!params.users) {
        throw new Error('Required Parameter. (key = users)');
    }

    let identityV1 = await grpcClient.get('identity', 'v1');

    let successCount = 0;
    let failCount = 0;
    let failItems = {};

    let promises = params.users.map(async (user_id) => {
        try {
            await identityV1.User.disable({user_id: user_id});
            successCount = successCount + 1;
        } catch (e) {
            console.log(e);
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

    return response;
};

const listUsers = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.User.list(params);

    return response;

    // let repoClient = serviceClient.get('repository');
    //
    // try {
    //     response = await repoClient.post('/repository/plugin/list', {});
    //     return response.data;
    // } catch (e) {
    //     serviceClient.errorHandler(e);
    // }
};

export {
    createUser,
    updateUser,
    deleteUsers,
    enableUser,
    disableUser,
    updateRoleUser,
    findUser,
    syncUser,
    getUser,
    listUsers
};
