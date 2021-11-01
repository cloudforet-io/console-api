import grpcClient from '@lib/grpc-client';

const createSchedule = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.Schedule.create(params);

    return response;
};

const updateSchedule = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.Schedule.update(params);

    return response;
};

const enableSchedule = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.Schedule.enable(params);

    return response;
};

const disableSchedule = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.Schedule.disable(params);

    return response;
};

const deleteSchedule = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.Schedule.delete(params);

    return response;
};

const getSchedule = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.Schedule.get(params);

    return response;
};

const listSchedules = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.Schedule.list(params);

    return response;
};

const statSchedules = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.Schedule.stat(params);

    return response;
};

export {
    createSchedule,
    updateSchedule,
    enableSchedule,
    disableSchedule,
    deleteSchedule,
    getSchedule,
    listSchedules,
    statSchedules
};
