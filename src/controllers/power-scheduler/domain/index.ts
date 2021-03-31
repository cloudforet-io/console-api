import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const enableDomain = async (params) => {
    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    const response = await powerSchedulerV1.Domain.enable(params);

    return response;
};

const disableDomain = async (params) => {
    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    const response = await powerSchedulerV1.Domain.disable(params);

    return response;
};

const getDomain = async (params) => {
    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    const response = await powerSchedulerV1.Domain.get(params);

    return response;
};

const listDomains = async (params) => {
    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    const response = await powerSchedulerV1.Domain.list(params);

    return response;
};


export {
    enableDomain,
    disableDomain,
    getDomain,
    listDomains
};
