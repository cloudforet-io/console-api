import grpcClient from '@lib/grpc-client';
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

const addRegionAdmin = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Region.add_admin(params);

    return response;
};

const modifyRegionAdmin = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Region.modify_admin(params);

    return response;
};

const removeRegionAdmin = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Region.remove_admin(params);

    return response;
};

const listRegionAdmins = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Region.list_admins(params);

    return response;
};

const listRegions = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Region.list(params);

    return response;
};

export {
    createRegion,
    updateRegion,
    deleteRegion,
    getRegion,
    addRegionAdmin,
    modifyRegionAdmin,
    removeRegionAdmin,
    listRegionAdmins,
    listRegions
};
