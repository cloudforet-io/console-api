import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const createPool = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Pool.create(params);

    return response;
};

const updatePool = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Pool.update(params);

    return response;
};

const deletePool = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Pool.delete(params);

    return response;
};

const getPool = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Pool.get(params);

    return response;
};

const addPoolAdmin = async (params) => {
    if (!params.users) {
        throw new Error('Required Parameter. (key = users)');
    }

    let inventoryV1 = await grpcClient.get('inventory', 'v1');

    let successCount = 0;
    let failCount = 0;
    let failItems = {};

    let promises = params.users.map(async (user_id) => {
        try {
            let reqParams = {
                user_id: user_id,
                pool_id: params.pool_id,
                tags: params.tags || {}
            };

            if (params.domain_id) {
                reqParams.domain_id = params.domain_id;
            }

            await inventoryV1.Pool.add_admin(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[user_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        let error = new Error(`Failed to add pool admins. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const modifyPoolAdmin = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Pool.modify_admin(params);

    return response;
};

const removePoolAdmin = async (params) => {
    if (!params.users) {
        throw new Error('Required Parameter. (key = users)');
    }

    let inventoryV1 = await grpcClient.get('inventory', 'v1');

    let successCount = 0;
    let failCount = 0;
    let failItems = {};

    let promises = params.users.map(async (user_id) => {
        try {
            let reqParams = {
                user_id: user_id,
                pool_id: params.pool_id
            };

            if (params.domain_id) {
                reqParams.domain_id = params.domain_id;
            }

            await inventoryV1.Pool.remove_admin(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[user_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        let error = new Error(`Failed to remove pool admins. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const listPoolAdmins = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Pool.list_admins(params);

    return response;
};

const listPools = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Pool.list(params);

    return response;
};

export {
    createPool,
    updatePool,
    deletePool,
    getPool,
    addPoolAdmin,
    modifyPoolAdmin,
    removePoolAdmin,
    listPoolAdmins,
    listPools
};
