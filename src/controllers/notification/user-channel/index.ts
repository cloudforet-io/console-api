import grpcClient from '@lib/grpc-client';

const createUserChannel = async (params) => {
    const notificationV1 = await grpcClient.get('notification', 'v1');
    const response = await notificationV1.UserChannel.create(params);

    return response;
};

const updateUserChannel = async (params) => {
    const notificationV1 = await grpcClient.get('notification', 'v1');
    const response = await notificationV1.UserChannel.update(params);

    return response;
};

const setSubscriptionUserChannel = async (params) => {
    const notificationV1 = await grpcClient.get('notification', 'v1');
    const response = await notificationV1.UserChannel.set_subscription(params);

    return response;
};

const setScheduleUserChannel = async (params) => {
    const notificationV1 = await grpcClient.get('notification', 'v1');
    const response = await notificationV1.UserChannel.set_schedule(params);

    return response;
};

const enableUserChannel = async (params) => {
    const notificationV1 = await grpcClient.get('notification', 'v1');
    const response = await notificationV1.UserChannel.enable(params);

    return response;
};

const disableUserChannel = async (params) => {
    const notificationV1 = await grpcClient.get('notification', 'v1');
    const response = await notificationV1.UserChannel.disable(params);

    return response;
};

const deleteUserChannel = async (params) => {
    const notificationV1 = await grpcClient.get('notification', 'v1');
    const response = await notificationV1.UserChannel.delete(params);

    return response;
};

const getUserChannel = async (params) => {
    const notificationV1 = await grpcClient.get('notification', 'v1');
    const response = await notificationV1.UserChannel.get(params);

    return response;
};

const listUserChannel = async (params) => {
    const notificationV1 = await grpcClient.get('notification', 'v1');
    const response = await notificationV1.UserChannel.list(params);

    return response;
};

const statUserChannel = async (params) => {
    const notificationV1 = await grpcClient.get('notification', 'v1');
    const response = await notificationV1.UserChannel.stat(params);

    return response;
};

export {
    createUserChannel,
    updateUserChannel,
    setSubscriptionUserChannel,
    setScheduleUserChannel,
    enableUserChannel,
    disableUserChannel,
    deleteUserChannel,
    getUserChannel,
    listUserChannel,
    statUserChannel
};
