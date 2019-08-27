import grpcClient from '@lib/grpc-client';
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

const addPoolAdmin = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Pool.add_admin(params);

    return response;
};

const modifyPoolAdmin = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Pool.modify_admin(params);

    return response;
};

const removePoolAdmin = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Pool.remove_admin(params);

    return response;
};

const listPoolAdmins = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Pool.list_admins(params);

    return response;
};

const listPools = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Pool.list(params);

    return response;
};

export {
    createPool,
    updatePool,
    deletePool,
    getPool,
    addPoolAdmin,
    modifyPoolAdmin,
    removePoolAdmin,
    listPoolAdmins,
    listPools
};
