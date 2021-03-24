import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const listMetrics = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.Metric.list(params);

    return response;
};

const getMetricData = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.Metric.getData(params);

    return response;
};

export {
    listMetrics,
    getMetricData
};
