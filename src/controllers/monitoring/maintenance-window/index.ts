import grpcClient from '@lib/grpc-client';
import { ErrorModel } from '@lib/error';

const createMaintenanceWindow = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring');
    const response = await monitoringV1.MaintenanceWindow.create(params);

    return response;
};

const updateMaintenanceWindow = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring');
    const response = await monitoringV1.MaintenanceWindow.update(params);

    return response;
};

const closeMaintenanceWindows = async (params) => {
    if (!params.maintenance_windows) {
        throw new Error('Required Parameter. (key = maintenance_windows)');
    }

    const monitoringV1 = await grpcClient.get('monitoring');

    let successCount = 0;
    let failCount = 0;
    const failItems = {};

    const promises = params.maintenance_windows.map(async (maintenance_window_id) => {
        try {
            const reqParams = {
                maintenance_window_id: maintenance_window_id,
                ... params.domain_id && { domain_id : params.domain_id }
            };

            await monitoringV1.MaintenanceWindow.close(reqParams);
            successCount = successCount + 1;
        } catch (e: any) {
            failItems[maintenance_window_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        const error: ErrorModel = new Error(`Failed to close maintenance windows. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
};

const getMaintenanceWindow = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring');
    const response = await monitoringV1.MaintenanceWindow.get(params);

    return response;
};

const listMaintenanceWindows = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring');
    const response = await monitoringV1.MaintenanceWindow.list(params);

    return response;
};

const statMaintenanceWindows = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring');
    const response = await monitoringV1.MaintenanceWindow.stat(params);

    return response;
};

export {
    createMaintenanceWindow,
    updateMaintenanceWindow,
    closeMaintenanceWindows,
    getMaintenanceWindow,
    listMaintenanceWindows,
    statMaintenanceWindows
};
