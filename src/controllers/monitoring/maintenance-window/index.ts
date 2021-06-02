import grpcClient from '@lib/grpc-client';

const createMaintenanceWindow = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.MaintenanceWindow.create(params);

    return response;
};

const updateMaintenanceWindow = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.MaintenanceWindow.update(params);

    return response;
};

const closeMaintenanceWindow = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.MaintenanceWindow.close(params);

    return response;
};

const getMaintenanceWindow = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.MaintenanceWindow.get(params);

    return response;
};

const listMaintenanceWindows = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.MaintenanceWindow.list(params);

    return response;
};

const statMaintenanceWindows = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.MaintenanceWindow.stat(params);

    return response;
};

export {
    createMaintenanceWindow,
    updateMaintenanceWindow,
    closeMaintenanceWindow,
    getMaintenanceWindow,
    listMaintenanceWindows,
    statMaintenanceWindows
};
