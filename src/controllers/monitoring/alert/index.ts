import { UpdateAlertStateParams, AlertModel, UpdateAlertParams } from '@controllers/monitoring/alert/type';
import { ErrorModel } from '@lib/error';
import grpcClient from '@lib/grpc-client';

const createAlert = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring');
    const response = await monitoringV1.Alert.create(params);

    return response;
};

const updateAlert = async (params: UpdateAlertParams) => {
    const monitoringV1 = await grpcClient.get('monitoring');
    const response = await monitoringV1.Alert.update(params);

    return response;
};

const updateAlertState = async (params: UpdateAlertStateParams) => {
    if (!params.alerts) {
        throw new Error('Required Parameter. (key = alerts)');
    }

    if (!params.state) {
        throw new Error('Required Parameter. (key = state)');
    } else if (!['TRIGGERED', 'ACKNOWLEDGED', 'RESOLVED'].includes(params.state)) {
        throw new Error('Invalid Parameter. (state = TRIGGERED | ACKNOWLEDGED | RESOLVED)');
    }

    const monitoringV1 = await grpcClient.get('monitoring');

    let successCount = 0;
    let failCount = 0;
    const failItems = {};

    const promises = params.alerts.map(async (alert_id) => {
        try {
            const reqStateParams: AlertModel = {
                alert_id: alert_id,
                state: params.state
            };

            if(params.assignee) {
                reqStateParams.assignee = params.assignee;
            }

            await monitoringV1.Alert.update(reqStateParams);

            if(params.note) {
                const reqNoteParams = {
                    alert_id: alert_id,
                    note: params.note
                };
                await monitoringV1.Note.create(reqNoteParams);
            }

            successCount = successCount + 1;
        } catch (e: any) {
            failItems[alert_id] = e.details || e.message;
            failCount = failCount + 1;
        }
    });

    await Promise.all(promises);

    if (failCount > 0) {
        const error: ErrorModel = new Error(`Failed to change alerts' state. (success: ${successCount}, failure: ${failCount})`);
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
                ... params.domain_id && { domain_id : params.domain_id }
            };

            await monitoringV1.Alert.delete(reqParams);
            successCount = successCount + 1;
        } catch (e: any) {
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
    mergeAlert,
    snoozeAlert,
    addAlertResponder,
    removeAlertResponder,
    deleteAlerts,
    getAlert,
    listAlerts,
    statAlerts
};
