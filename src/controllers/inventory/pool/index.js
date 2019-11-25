import grpcClient from '@lib/grpc-client';
import { changeQueryKeyword } from '@lib/utils';
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

const addPoolMember = async (params) => {
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
                labels: params.labels || []
            };

            if (params.domain_id) {
                reqParams.domain_id = params.domain_id;
            }

            await inventoryV1.Pool.add_member(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[user_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        let error = new Error(`Failed to add pool members. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const modifyPoolMember = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Pool.modify_member(params);

    return response;
};

const removePoolMember = async (params) => {
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

            await inventoryV1.Pool.remove_member(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[user_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        let error = new Error(`Failed to remove pool members. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const listPoolMembers = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Pool.list_members(params);

    return response;
};

const listPools = async (params) => {
    changeQueryKeyword(params.query, ['pool_id', 'name']);
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Pool.list(params);

    return response;
};

export {
    createPool,
    updatePool,
    deletePool,
    getPool,
    addPoolMember,
    modifyPoolMember,
    removePoolMember,
    listPoolMembers,
    listPools
};
