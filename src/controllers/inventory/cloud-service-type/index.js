import grpcClient from '@lib/grpc-client';
import { changeQueryKeyword } from '@lib/utils';
import logger from '@lib/logger';

const createCloudServiceType = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.CloudServiceType.create(params);

    return response;
};

const updateCloudServiceType = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.CloudServiceType.update(params);

    return response;
};

const deleteCloudServiceType = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.CloudServiceType.delete(params);

    return response;
};

const getCloudServiceType = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.CloudServiceType.get(params);

    return response;
};

const listCloudServiceTypes = async (params) => {
    changeQueryKeyword(params.query, ['name', 'provider', 'group']);
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.CloudServiceType.list(params);

    return response;
};

export {
    createCloudServiceType,
    updateCloudServiceType,
    deleteCloudServiceType,
    getCloudServiceType,
    listCloudServiceTypes
};
