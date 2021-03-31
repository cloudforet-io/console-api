import grpcClient from '@lib/grpc-client';
import httpContext from 'express-http-context';
import { ResourceGroupFactory } from '@factories/inventory/resource-group';
import logger from '@lib/logger';

const createResourceGroup = async (params) => {
    if (httpContext.get('mock_mode')) {
        return new ResourceGroupFactory(params);
    }

    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.ResourceGroup.create(params);

    return response;
};

const updateResourceGroup = async (params) => {
    if (httpContext.get('mock_mode')) {
        return new ResourceGroupFactory(params);
    }

    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.ResourceGroup.update(params);

    return response;
};

const deleteResourceGroup = async (params) => {
    if (httpContext.get('mock_mode')) {
        return {};
    }

    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.ResourceGroup.delete(params);

    return response;
};

const getResourceGroup = async (params) => {
    if (httpContext.get('mock_mode')) {
        return new ResourceGroupFactory(params);
    }

    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.ResourceGroup.get(params);

    return response;
};

const listResourceGroups = async (params) => {
    if (httpContext.get('mock_mode')) {
        return {
            results: ResourceGroupFactory.buildBatch(10),
            total_count: 10
        };
    }

    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.ResourceGroup.list(params);

    return response;
};

const statResourceGroups = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.ResourceGroup.stat(params);

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
