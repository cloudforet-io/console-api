import grpcClient from '@lib/grpc-client';

const createProtocol = async (params) => {
    const notificationV1 = await grpcClient.get('notification', 'v1');
    const response = await notificationV1.Protocol.create(params);

    return response;
};

const updateProtocol = async (params) => {
    const notificationV1 = await grpcClient.get('notification', 'v1');
    const response = await notificationV1.Protocol.update(params);

    return response;
};

const updateProtocolPlugin = async (params) => {
    const notificationV1 = await grpcClient.get('notification', 'v1');
    const response = await notificationV1.Protocol.update_plugin(params);

    return response;
};

const enableProtocol = async (params) => {
    const notificationV1 = await grpcClient.get('notification', 'v1');
    const response = await notificationV1.Protocol.enable(params);

    return response;
};

const disableProtocol = async (params) => {
    const notificationV1 = await grpcClient.get('notification', 'v1');
    const response = await notificationV1.Protocol.disable(params);

    return response;
};

const deleteProtocol = async (params) => {
    const notificationV1 = await grpcClient.get('notification', 'v1');
    const response = await notificationV1.Protocol.delete(params);

    return response;
};

const getProtocol = async (params) => {
    const notificationV1 = await grpcClient.get('notification', 'v1');
    const response = await notificationV1.Protocol.get(params);

    return response;
};

const listProtocol = async (params) => {
    const notificationV1 = await grpcClient.get('notification', 'v1');
    const response = await notificationV1.Protocol.list(params);

    return response;
};

const statProtocol = async (params) => {
    const notificationV1 = await grpcClient.get('notification', 'v1');
    const response = await notificationV1.Protocol.stat(params);

    return response;
};

export {
    createProtocol,
    updateProtocol,
    updateProtocolPlugin,
    enableProtocol,
    disableProtocol,
    deleteProtocol,
    getProtocol,
    listProtocol,
    statProtocol
};
