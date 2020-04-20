import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const listHistorys = async (params) => {
    let statisticsV1 = await grpcClient.get('statistics', 'v1');
    let response = await statisticsV1.History.list(params);

    return response;
};


const statHistory = async (params) => {
    let statisticsV1 = await grpcClient.get('statistics', 'v1');
    let response = await statisticsV1.History.stat(params);

    return response;
};

const diffHistory = async (params) => {
    let statisticsV1 = await grpcClient.get('statistics', 'v1');
    let response = await statisticsV1.History.diff(params);

    return response;
};

export {
    diffHistory,
    statHistory,
    listHistorys
};
