import grpcClient from '@lib/grpc-client';

const createEvent = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring');
    const response = await monitoringV1.Event.create(params);

    return response;
};

const getEvent = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring');
    const response = await monitoringV1.Event.get(params);

    return response;
};

const listEvents = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring');
    const response = await monitoringV1.Event.list(params);

    return response;
};

const statEvents = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring');
    const response = await monitoringV1.Event.stat(params);

    return response;
};

export {
    createEvent,
    getEvent,
    listEvents,
    statEvents
};
