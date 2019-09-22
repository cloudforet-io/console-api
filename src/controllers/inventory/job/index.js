import grpcClient from '@lib/grpc-client';
import { changeQueryKeyword } from '@lib/utils';
import logger from '@lib/logger';

const listJobs = async (params) => {
    changeQueryKeyword(params.query, ['job_id', 'collector_id', 'resource_id']);
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = await inventoryV1.Job.list(params);

    return response;
};

export {
    listJobs
};
