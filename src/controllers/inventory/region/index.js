import grpcClient from '@lib/grpc-client';
import { changeQueryKeyword } from '@lib/utils';
import logger from '@lib/logger';

const createRegion = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Region.create(params);

    return response;
};

const updateRegion = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Region.update(params);

    return response;
};

const deleteRegion = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Region.delete(params);

    return response;
};

const getRegion = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Region.get(params);

    return response;
};

const addRegionMember = async (params) => {
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
                region_id: params.region_id,
                labels: params.labels || []
            };

            if (params.domain_id) {
                reqParams.domain_id = params.domain_id;
            }

            await inventoryV1.Region.add_member(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[user_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        let error = new Error(`Failed to add region members. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const modifyRegionMember = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Region.modify_member(params);

    return response;
};

const removeRegionMember = async (params) => {
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
                region_id: params.region_id
            };

            if (params.domain_id) {
                reqParams.domain_id = params.domain_id;
            }

            await inventoryV1.Region.remove_member(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[user_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        let error = new Error(`Failed to remove region members. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const listRegionMembers = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Region.list_members(params);

    return response;
};

const listRegions = async (params) => {
    changeQueryKeyword(params.query, ['region_id', 'name']);
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Region.list(params);

    return response;
};

export {
    createRegion,
    updateRegion,
    deleteRegion,
    getRegion,
    addRegionMember,
    modifyRegionMember,
    removeRegionMember,
    listRegionMembers,
    listRegions
};
