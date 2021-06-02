import grpcClient from '@lib/grpc-client';

const createProjectAlertConfig = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.ProjectAlertConfig.create(params);

    return response;
};

const updateProjectAlertConfig = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.ProjectAlertConfig.update(params);

    return response;
};

const deleteProjectAlertConfig = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.ProjectAlertConfig.delete(params);

    return response;
};

const getProjectAlertConfig = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.ProjectAlertConfig.get(params);

    return response;
};

const listProjectAlertConfigs = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.ProjectAlertConfig.list(params);

    return response;
};

const statProjectAlertConfigs = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.ProjectAlertConfig.stat(params);

    return response;
};

export {
    createProjectAlertConfig,
    updateProjectAlertConfig,
    deleteProjectAlertConfig,
    getProjectAlertConfig,
    listProjectAlertConfigs,
    statProjectAlertConfigs
};
