import grpcClient from '@lib/grpc-client';

const createProjectChannel = async (params) => {
    const notificationV1 = await grpcClient.get('notification', 'v1');
    const response = await notificationV1.ProjectChannel.create(params);

    return response;
};

const updateProjectChannel = async (params) => {
    const notificationV1 = await grpcClient.get('notification', 'v1');
    const response = await notificationV1.ProjectChannel.update(params);

    return response;
};

const setSubscriptionProjectChannel = async (params) => {
    const notificationV1 = await grpcClient.get('notification', 'v1');
    const response = await notificationV1.ProjectChannel.set_subscription(params);

    return response;
};

const enableProjectChannel = async (params) => {
    const notificationV1 = await grpcClient.get('notification', 'v1');
    const response = await notificationV1.ProjectChannel.enable(params);

    return response;
};

const disableProjectChannel = async (params) => {
    const notificationV1 = await grpcClient.get('notification', 'v1');
    const response = await notificationV1.ProjectChannel.disable(params);

    return response;
};

const deleteProjectChannel = async (params) => {
    const notificationV1 = await grpcClient.get('notification', 'v1');
    const response = await notificationV1.ProjectChannel.delete(params);

    return response;
};

const getProjectChannel = async (params) => {
    const notificationV1 = await grpcClient.get('notification', 'v1');
    const response = await notificationV1.ProjectChannel.get(params);

    return response;
};

const listProjectChannel = async (params) => {
    const notificationV1 = await grpcClient.get('notification', 'v1');
    const response = await notificationV1.ProjectChannel.list(params);

    return response;
};

const statProjectChannel = async (params) => {
    const notificationV1 = await grpcClient.get('notification', 'v1');
    const response = await notificationV1.ProjectChannel.stat(params);

    return response;
};

export {
    createProjectChannel,
    updateProjectChannel,
    setSubscriptionProjectChannel,
    enableProjectChannel,
    disableProjectChannel,
    deleteProjectChannel,
    getProjectChannel,
    listProjectChannel,
    statProjectChannel
};
