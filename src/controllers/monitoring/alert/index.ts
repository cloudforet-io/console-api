import grpcClient from '@lib/grpc-client';

const createAlert = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring');
    const response = await monitoringV1.Alert.create(params);

    return response;
};

const updateAlert = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring');
    const response = await monitoringV1.Alert.update(params);

    return response;
};

const updateAlertState = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring');
    const response = await monitoringV1.Alert.updateState(params);

    return response;
};

const mergeAlert = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring');
    const response = await monitoringV1.Alert.merge(params);

    return response;
};

const snoozeAlert = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring');
    const response = await monitoringV1.Alert.snooze(params);

    return response;
};

const addAlertResponder = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring');
    const response = await monitoringV1.Alert.addResponder(params);

    return response;
};

const removeAlertResponder = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring');
    const response = await monitoringV1.Alert.removeResponder(params);

    return response;
};


const deleteAlert = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring');
    const response = await monitoringV1.Alert.delete(params);

    return response;
};

const getAlert = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring');
    const response = await monitoringV1.Alert.get(params);

    return response;
};

const listAlerts = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring');
    const response = await monitoringV1.Alert.list(params);

    return response;
};

const statAlerts = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring');
    const response = await monitoringV1.Alert.stat(params);

    return response;
};

export {
    createAlert,
    updateAlert,
    updateAlertState,
    mergeAlert,
    snoozeAlert,
    addAlertResponder,
    removeAlertResponder,
    deleteAlert,
    getAlert,
    listAlerts,
    statAlerts
};
