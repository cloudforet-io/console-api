import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const listJobTasks = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.JobTask.list(params);

    return response;
};

const statJobTasks = async (params) => {
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const response = await inventoryV1.JobTask.stat(params);

    return response;
};


export {
    listJobTasks,
    statJobTasks
};
