import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const listJobs = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Job.list(params);

    return response;
};

const statJobs = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Job.stat(params);

    return response;
};


export {
    listJobs,
    statJobs
};
