import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const listMetrics = async (params) => {
    let monitoringV1 = await grpcClient.get('monitoring', 'v1');
    let response = await monitoringV1.Metric.list(params);

    return response;
};

const getDataMetric = async (params) => {
    let monitoringV1 = await grpcClient.get('monitoring', 'v1');
    let response = await monitoringV1.Metric.getData(params);

    return response;
};

export {
    listMetrics,
    getDataMetric
};
