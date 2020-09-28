import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const createResourceGroup = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.ResourceGroup.create(params);

    return response;
};

const updateResourceGroup = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.ResourceGroup.update(params);

    return response;
};

const deleteResourceGroup = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.ResourceGroup.delete(params);

    return response;
};

const getResourceGroup = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.ResourceGroup.get(params);

    return response;
};

const listResourceGroups = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.ResourceGroup.list(params);

    return response;
};

const statResourceGroups = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.ResourceGroup.stat(params);

    return response;
};

export {

    createResourceGroup,
    updateResourceGroup,
    deleteResourceGroup,
    getResourceGroup,
    listResourceGroups,
    statResourceGroups

};
