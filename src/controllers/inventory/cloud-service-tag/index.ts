import grpcClient from '@lib/grpc-client';

const listCloudServiceTags = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.CloudServiceTag.list(params);

    return response;
};

const statCloudServiceTags = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.CloudServiceTag.stat(params);

    return response;
};

export {
    listCloudServiceTags,
    statCloudServiceTags
};
