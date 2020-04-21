import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const createSubnet = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Subnet.create(params);

    return response;
};

const updateSubnet = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Subnet.update(params);

    return response;
};

const pinDataSubnet = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Subnet.pin_data(params);

    return response;
};

const deleteSubnetSingle = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Subnet.delete(params);

    return response;
};


const deleteSubnets = async (params) => {
    if (!params.subnets) {
        throw new Error('Required Parameter. (key = subnets)');
    }

    let inventoryV1 = await grpcClient.get('inventory', 'v1');

    let successCount = 0;
    let failCount = 0;
    let failItems = {};

    let promises = params.subnets.map(async (subnet_id) => {
        try {
            let reqParams = {
                subnet_id: subnet_id
            };

            if (params.domain_id) {
                reqParams.domain_id = params.domain_id;
            }

            await inventoryV1.Subnet.delete(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[subnet_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        let error = new Error(`Failed to delete subnets. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const getSubnet = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Subnet.get(params);

    return response;
};

const listSubnets = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Subnet.list(params);

    return response;
};

const statSubnets = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Subnet.stat(params);

    return response;
};


export {
    createSubnet,
    updateSubnet,
    pinDataSubnet,
    deleteSubnetSingle,
    deleteSubnets,
    getSubnet,
    listSubnets,
    statSubnets
};
