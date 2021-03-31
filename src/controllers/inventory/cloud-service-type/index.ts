import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const createCloudServiceType = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.CloudServiceType.create(params);

    return response;
};

const updateCloudServiceType = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.CloudServiceType.update(params);

    return response;
};

const deleteCloudServiceType = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.CloudServiceType.delete(params);

    return response;
};

const getCloudServiceType = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.CloudServiceType.get(params);

    return response;
};

const listCloudServiceTypes = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.CloudServiceType.list(params);

    return response;
};

const statCloudServiceTypes = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.CloudServiceType.stat(params);

    return response;
};

export {

    createCloudServiceType,
    updateCloudServiceType,
    deleteCloudServiceType,
    getCloudServiceType,
    listCloudServiceTypes,
    statCloudServiceTypes

};
