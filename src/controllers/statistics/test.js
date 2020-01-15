import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const test1 = async (params) => {
    return {};
};

const test2 = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    return await inventoryV1.Health.Check({});
};

export {
    test1,
    test2
};
