import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const creatNetworkType = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.NetworType.create(params);

    return response;
};

const updateNetworkType = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.NetworType.update(params);

    return response;
};

const deleteNetworkTypeSingle = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.NetworType.delete(params);

    return response;
};

const deleteNetworkTypes = async (params) => {
    if (!params.networ_types) {
        throw new Error('Required Parameter. (key = networ_types)');
    }

    let inventoryV1 = await grpcClient.get('inventory', 'v1');

    let successCount = 0;
    let failCount = 0;
    let failItems = {};

    let promises = params.networks.map(async (network_type_id) => {
        try {
            let reqParams = {
                network_type_id: network_type_id
            };

            if (params.domain_id) {
                reqParams.domain_id = params.domain_id;
            }

            await inventoryV1.NetworType.delete(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[network_type_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        let error = new Error(`Failed to delete network Types. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const getNetworkType = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.NetworType.get(params);

    return response;
};

const listNetworkTypes = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.NetworType.list(params);

    return response;
};

const statNetworkTypes = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.NetworTypes.stat(params);

    return response;
};


export {
    creatNetworkType,
    updateNetworkType,
    deleteNetworkTypeSingle,
    deleteNetworkTypes,
    getNetworkType,
    listNetworkTypes,
    statNetworkTypes
};
