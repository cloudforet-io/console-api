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
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Zone.add_admin(params);

    return response;
};

const modifyZoneAdmin = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Zone.modify_admin(params);

    return response;
};

const removeZoneAdmin = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Zone.remove_admin(params);

    return response;
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
