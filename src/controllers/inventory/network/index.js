import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const createNetwork = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Network.create(params);

    return response;
};

const updateNetwork = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Network.update(params);

    return response;
};

const deleteNetworkSingle = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Network.delete(params);

    return response;
};

const deleteNetworks = async (params) => {
    if (!params.networks) {
        throw new Error('Required Parameter. (key = networks)');
    }

    let inventoryV1 = await grpcClient.get('inventory', 'v1');

    let successCount = 0;
    let failCount = 0;
    let failItems = {};

    let promises = params.networks.map(async (network_id) => {
        try {
            let reqParams = {
                network_id: network_id,
                ... params.domain_id && {domain_id : params.domain_id}
            };

            await inventoryV1.Network.delete(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[network_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        let error = new Error(`Failed to delete networks. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const getNetwork = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Network.get(params);

    return response;
};

const pinDataNetwork = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Network.pin_data(params);

    return response;
};

const listNetworks = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Network.list(params);

    return response;
};

const statNetworks = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Network.stat(params);

    return response;
};


export {
    createNetwork,
    updateNetwork,
    pinDataNetwork,
    deleteNetworkSingle,
    deleteNetworks,
    getNetwork,
    listNetworks,
    statNetworks
};
