import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const statResource = async (params) => {
    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const response = await statisticsV1.Resource.stat(params);

    return response;
};

export {
    statResource
};
