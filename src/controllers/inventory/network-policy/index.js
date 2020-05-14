import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const createNetworkPolicy = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.NetworkPolicy.create(params);

    return response;
};

const updateNetworkPolicy = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.NetworkPolicy.update(params);

    return response;
};

const pinDataNetworkPolicy = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.NetworkPolicy.pin_data(params);

    return response;
};


const deleteNetworkPolicySingle = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.NetworkPolicy.delete(params);
    return response;
};

const deleteNetworkPolicies = async (params) => {
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

const getNetworkPolicy = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.NetworkPolicy.get(params);

    return response;
};

const listNetworkPolicies = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.NetworkPolicy.list(params);

    return response;
};

const statNetworkPolicies = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.NetworkPolicy.stat(params);

    return response;
};


export {
    createNetworkPolicy,
    updateNetworkPolicy,
    pinDataNetworkPolicy,
    deleteNetworkPolicySingle,
    deleteNetworkPolicies,
    getNetworkPolicy,
    listNetworkPolicies,
    statNetworkPolicies
};
