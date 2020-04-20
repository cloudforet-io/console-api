import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const queryStat = async (params) => {
    let statisticsV1 = await grpcClient.get('statistics', 'v1');
    let response = await statisticsV1.Stat.query(params);

    return response;
};

export {
    queryStat
};
