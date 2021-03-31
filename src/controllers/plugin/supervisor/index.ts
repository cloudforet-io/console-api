import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const registerSupervisor = async (params) => {
    const pluginV1 = await grpcClient.get('plugin', 'v1');
    const response = await pluginV1.Supervisor.register(params);
    return response;
};

const updateSupervisor = async (params) => {
    const pluginV1 = await grpcClient.get('plugin', 'v1');
    const response = await pluginV1.Supervisor.update(params);
    return response;
};

const deregisterSupervisor = async (params) => {
    const pluginV1 = await grpcClient.get('plugin', 'v1');
    const response = await pluginV1.Supervisor.deregister(params);
    return response;
};


const enableSupervisor = async (params) => {
    const pluginV1 = await grpcClient.get('plugin', 'v1');
    const response = await pluginV1.Supervisor.enable(params);
    return response;
};

const disableSupervisor = async (params) => {
    const pluginV1 = await grpcClient.get('plugin', 'v1');
    const response = await pluginV1.Supervisor.disable(params);
    return response;
};

const recoverPlugin = async (params) => {
    const pluginV1 = await grpcClient.get('plugin', 'v1');
    const response = await pluginV1.Supervisor.recover_plugin(params);
    return response;
};

const listPlugins = async (params) => {
    const pluginV1 = await grpcClient.get('plugin', 'v1');
    const response = await pluginV1.Supervisor.list_plugins(params);
    return response;
};

const getSupervisor = async (params) => {
    const pluginV1 = await grpcClient.get('plugin', 'v1');
    const response = await pluginV1.Supervisor.get(params);

    return response;
};

const listSupervisors = async (params) => {
    const pluginV1 = await grpcClient.get('plugin', 'v1');
    const response = await pluginV1.Supervisor.list(params);
    return response;
};

const statSupervisors = async (params) => {
    const pluginV1 = await grpcClient.get('plugin', 'v1');
    const response = await pluginV1.Supervisor.stat(params);
    return response;
};

export {
    registerSupervisor,
    updateSupervisor,
    deregisterSupervisor,
    enableSupervisor,
    disableSupervisor,
    recoverPlugin,
    listPlugins,
    getSupervisor,
    listSupervisors,
    statSupervisors
};
