import grpcClient from '@lib/grpc-client';

const createNotification = async (params) => {
    const notificationV1 = await grpcClient.get('notification');
    const response = await notificationV1.Notification.create(params);

    return response;
};

const deleteNotification = async (params) => {
    const notificationV1 = await grpcClient.get('notification');
    const response = await notificationV1.Notification.delete(params);

    return response;
};

const setReadNotification = async (params) => {
    const notificationV1 = await grpcClient.get('notification');
    const response = await notificationV1.Notification.set_read(params);

    return response;
};

const getNotification = async (params) => {
    const notificationV1 = await grpcClient.get('notification');
    const response = await notificationV1.Notification.get(params);

    return response;
};

const listNotification = async (params) => {
    const notificationV1 = await grpcClient.get('notification');
    const response = await notificationV1.Notification.list(params);

    return response;
};

const statNotification = async (params) => {
    const notificationV1 = await grpcClient.get('notification');
    const response = await notificationV1.Notification.stat(params);

    return response;
};


export {
    createNotification,
    deleteNotification,
    setReadNotification,
    getNotification,
    listNotification,
    statNotification
};
