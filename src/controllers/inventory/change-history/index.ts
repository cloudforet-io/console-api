import grpcClient from '@lib/grpc-client';

const listChangeHistory = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.ChangeHistory.list(params);

    return response;
};

const statChangeHistory = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.ChangeHistory.stat(params);

    return response;
};

export {
    listChangeHistory,
    statChangeHistory
};
