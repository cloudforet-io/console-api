import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';


const createHistory = async (params) => {
    let statisticsV1 = await grpcClient.get('statistics', 'v1');
    let response = await statisticsV1.History.create(params);

    return response;
};

const listHistory = async (params) => {
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
    createHistory,
    diffHistory,
    statHistory,
    listHistory
};
