import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const addSchedule = async (params) => {
    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const response = await statisticsV1.Schedule.add(params);

    return response;
};

const updateSchedule = async (params) => {
    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const response = await statisticsV1.Schedule.update(params);

    return response;
};

const enableSchedule = async (params) => {
    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const response = await statisticsV1.Schedule.enable(params);

    return response;
};

const disableSchedule = async (params) => {
    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const response = await statisticsV1.Schedule.disable(params);

    return response;
};

const deleteSchedule = async (params) => {
    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const response = await statisticsV1.Schedule.delete(params);

    return response;
};

const getSchedule = async (params) => {
    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const response = await statisticsV1.Schedule.get(params);

    return response;
};

const listSchedules = async (params) => {
    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const response = await statisticsV1.Schedule.list(params);

    return response;
};

const statSchedules = async (params) => {
    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const response = await statisticsV1.Schedule.stat(params);

    return response;
};


export {
    addSchedule,
    updateSchedule,
    enableSchedule,
    disableSchedule,
    deleteSchedule,
    getSchedule,
    listSchedules,
    statSchedules
};
