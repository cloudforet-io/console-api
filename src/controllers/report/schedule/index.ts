import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const addSchedule = async (params) => {
    const reportV1 = await grpcClient.get('report', 'v1');
    const response = await reportV1.Schedule.add(params);
    return response;
};

const deleteSchedule = async (params) => {
    const reportV1 = await grpcClient.get('report', 'v1');
    const response = await reportV1.Schedule.delete(params);
    return response;
};

const enableSchedule = async (params) => {
    const reportV1 = await grpcClient.get('report', 'v1');
    const response = await reportV1.Schedule.enable(params);

    return response;
};

const disableSchedule = async (params) => {
    const reportV1 = await grpcClient.get('report', 'v1');
    const response = await reportV1.Schedule.disable(params);

    return response;
};

const getSchedule = async (params) => {
    const reportV1 = await grpcClient.get('report', 'v1');
    const response = await reportV1.Schedule.get(params);

    return response;
};

const listSchedules = async (params) => {
    const reportV1 = await grpcClient.get('report', 'v1');
    const response = await reportV1.Schedule.list(params);
    return response;
};

const statSchedules = async (params) => {
    const reportV1 = await grpcClient.get('report', 'v1');
    const response = await reportV1.Schedule.stat(params);
    return response;
};

export {
    addSchedule,
    deleteSchedule,
    enableSchedule,
    disableSchedule,
    getSchedule,
    listSchedules,
    statSchedules
};
