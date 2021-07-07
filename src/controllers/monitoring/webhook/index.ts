import grpcClient from '@lib/grpc-client';

const createWebhook = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring');
    const response = await monitoringV1.Webhook.create(params);

    return response;
};

const updateWebhook = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring');
    const response = await monitoringV1.Webhook.update(params);

    return response;
};

const updateWebhookPlugin = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring');
    const response = await monitoringV1.Webhook.update_plugin(params);

    return response;
};

const enableWebhook = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring');
    const response = await monitoringV1.Webhook.enable(params);

    return response;
};

const disableWebhook = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring');
    const response = await monitoringV1.Webhook.disable(params);

    return response;
};

const deleteWebhook = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring');
    const response = await monitoringV1.Webhook.delete(params);

    return response;
};

const getWebhook = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring');
    const response = await monitoringV1.Webhook.get(params);

    return response;
};

const listWebhooks = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring');
    const response = await monitoringV1.Webhook.list(params);

    return response;
};

const statWebhooks = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring');
    const response = await monitoringV1.Webhook.stat(params);

    return response;
};

export {
    createWebhook,
    updateWebhook,
    updateWebhookPlugin,
    enableWebhook,
    disableWebhook,
    deleteWebhook,
    getWebhook,
    listWebhooks,
    statWebhooks
};
