import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const resourceStat = async (params) => {
    let statisticsV1 = await grpcClient.get('statistics', 'v1');
    let response = await statisticsV1.Resource.stat(params);

    return response;
};

export {
    resourceStat
};
