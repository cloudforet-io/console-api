import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const createRegion = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.Region.create(params);

    return response;
};

const updateRegion = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.Region.update(params);

    return response;
};

const deleteRegion = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.Region.delete(params);

    return response;
};

const getRegion = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.Region.get(params);

    return response;
};

const listRegions = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.Region.list(params);

    return response;
};

const statRegions = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.Region.stat(params);

    return response;
};

export {
    createRegion,
    updateRegion,
    deleteRegion,
    getRegion,
    listRegions,
    statRegions
};
