import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const allocateIPAddress = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.IPAddress.allocate(params);

    return response;
};

const reserveIPAddress = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.IPAddress.reserve(params);

    return response;
};

const releaseIPAddress = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.IPAddress.release(params);

    return response;
};

const updateIPAddress = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.IPAddress.update(params);

    return response;
};

const pinDataIPAddress = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.IPAddress.pin_data(params);

    return response;
};

const getIPAddress = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.IPAddress.get(params);

    return response;
};

const listIPAddresses = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.IPAddress.list(params);

    return response;
};

const statIPAddresses = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.IPAddress.stat(params);

    return response;
};


export {
    allocateIPAddress,
    reserveIPAddress,
    releaseIPAddress,
    updateIPAddress,
    pinDataIPAddress,
    getIPAddress,
    listIPAddresses,
    statIPAddresses
};
