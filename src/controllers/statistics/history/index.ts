import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';


const createHistory = async (params) => {
    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const response = await statisticsV1.History.create(params);

    return response;
};

const listHistory = async (params) => {
    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const response = await statisticsV1.History.list(params);

    return response;
};


const statHistory = async (params) => {
    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const response = await statisticsV1.History.stat(params);

    return response;
};

export {
    createHistory,
    statHistory,
    listHistory
};
