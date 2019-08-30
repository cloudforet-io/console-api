import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const createServer = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Server.create(params);

    return response;
};

const updateServer = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Server.update(params);

    return response;
};

const changeServerState = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Server.delete(params);

    return response;
};

const changeServerProject = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Server.delete(params);

    return response;
};

const changeServerPool = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Server.delete(params);

    return response;
};

const deleteServers = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Server.delete(params);

    return response;
};


const listServerAdmins = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Server.get(params);

    return response;
};

const getServerData = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Server.get(params);

    return response;
};

const getServer = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Server.get(params);

    return response;
};

const listServers = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Server.list(params);

    return response;
};

export {
    createServer,
    updateServer,
    changeServerState,
    changeServerProject,
    changeServerPool,
    deleteServers,
    listServerAdmins,
    getServerData,
    getServer,
    listServers
};
