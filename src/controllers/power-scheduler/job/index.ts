import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const listJobs = async (params) => {
    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    const response = await powerSchedulerV1.Job.list(params);

    return response;
};

const statJobs = async (params) => {
    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    const response = await powerSchedulerV1.Job.stat(params);

    return response;
};


export {
    listJobs,
    statJobs
};
