import grpcClient from '@lib/grpc-client';

const createEventRule = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.EventRule.create(params);

    return response;
};

const updateEventRule = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.EventRule.update(params);

    return response;
};

const changeOrderEventRule = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.EventRule.change_order(params);

    return response;
};

const deleteEventRule = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.EventRule.delete(params);

    return response;
};

const getEventRule = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.EventRule.get(params);

    return response;
};

const listEventRule = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.EventRule.list(params);

    return response;
};

const statEventRule = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.EventRule.stat(params);

    return response;
};

export {
    createEventRule,
    changeOrderEventRule,
    updateEventRule,
    deleteEventRule,
    getEventRule,
    listEventRule,
    statEventRule
};
