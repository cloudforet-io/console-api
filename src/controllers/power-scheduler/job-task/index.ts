import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const listJobTasks = async (params) => {
    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    const response = await powerSchedulerV1.JobTask.list(params);

    return response;
};

const statJobTasks = async (params) => {
    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    const response = await powerSchedulerV1.JobTask.stat(params);

    return response;
};


export {
    listJobTasks,
    statJobTasks
};
