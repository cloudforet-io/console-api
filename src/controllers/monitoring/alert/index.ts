import grpcClient from '@lib/grpc-client';
import {ErrorModel} from '@lib/config/type';

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

const changeAlertState = async (params) => {
    if (!params.alerts) {
        throw new Error('Required Parameter. (key = alerts)');
    }

    if (!params.state) {
        throw new Error('Required Parameter. (key = state)');
    } else if (['TRIGGERED', 'ACKNOWLEDGED', 'RESOLVED'].indexOf(params.state) < 0) {
        throw new Error('Invalid Parameter. (state = TRIGGERED | ACKNOWLEDGED | RESOLVED)');
    }

    const monitoringV1 = await grpcClient.get('monitoring');

    let successCount = 0;
    let failCount = 0;
    const failItems = {};

    const promises = params.alerts.map(async (alert_id) => {
        try {
            const reqParams = {
                alert_id: alert_id,
                state: params.state,
                ... params.domain_id && {domain_id : params.domain_id}
            };

            await monitoringV1.Alert.update(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[alert_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        const error: ErrorModel = new Error(`Failed to change alerts. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
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

const deleteAlerts = async (params) => {
    if (!params.alerts) {
        throw new Error('Required Parameter. (key = alerts)');
    }

    const monitoringV1 = await grpcClient.get('monitoring');

    let successCount = 0;
    let failCount = 0;
    const failItems = {};

    const promises = params.alerts.map(async (alert_id) => {
        try {
            const reqParams = {
                alert_id: alert_id,
                ... params.domain_id && {domain_id : params.domain_id}
            };

            await monitoringV1.Alert.delete(reqParams);
            successCount = successCount + 1;
        } catch (e) {
            failItems[alert_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });
    await Promise.all(promises);

    if (failCount > 0) {
        const error: ErrorModel = new Error(`Failed to delete alerts. (success: ${successCount}, failure: ${failCount})`);
        error.fail_items = failItems;
        throw error;
    } else {
        return {};
    }
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
    changeAlertState,
    mergeAlert,
    snoozeAlert,
    addAlertResponder,
    removeAlertResponder,
    deleteAlerts,
    getAlert,
    listAlerts,
    statAlerts
};
