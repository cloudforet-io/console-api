import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const createZone = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Zone.create(params);

    return response;
};

const updateZone = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Zone.update(params);

    return response;
};

const deleteZone = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Zone.delete(params);

    return response;
};

const getZone = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Zone.get(params);

    return response;
};

const addZoneAdmin = async (params) => {
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
                zone_id: params.zone_id,
                tags: params.tags || {}
            };

            if (params.domain_id) {
                reqParams.domain_id = params.domain_id;
            }

            await inventoryV1.Zone.add_admin(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[user_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        let error = new Error(`Failed to add zone admins. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const modifyZoneAdmin = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Zone.modify_admin(params);

    return response;
};

const removeZoneAdmin = async (params) => {
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
                zone_id: params.zone_id
            };

            if (params.domain_id) {
                reqParams.domain_id = params.domain_id;
            }

            await inventoryV1.Zone.remove_admin(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[user_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        let error = new Error(`Failed to remove zone admins. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const listZoneAdmins = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Zone.list_admins(params);

    return response;
};

const listZones = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Zone.list(params);

    return response;
};

export {
    createZone,
    updateZone,
    deleteZone,
    getZone,
    addZoneAdmin,
    modifyZoneAdmin,
    removeZoneAdmin,
    listZoneAdmins,
    listZones
};
