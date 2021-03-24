import httpContext from 'express-http-context';
import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const createController = async (params) => {
    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    const response = await powerSchedulerV1.Controller.create(params);

    return response;
};

const updateController = async (params) => {
    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    const response = await powerSchedulerV1.Controller.update(params);

    return response;
};

const updateControllerPlugin = async (params) => {
    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    const response = await powerSchedulerV1.Controller.update_plugin(params);

    return response;
};

const verifyControllerPlugin = async (params) => {
    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    const response = await powerSchedulerV1.Controller.verify_plugin(params);

    return response;
};

const deleteController = async (params) => {
    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    const response = await powerSchedulerV1.Controller.delete(params);

    return response;
};

const getController = async (params) => {
    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    const response = await powerSchedulerV1.Controller.get(params);

    return response;
};

const listControllers = async (params) => {
    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    const response = await powerSchedulerV1.Controller.list(params);

    return response;
};

const statControllers = async (params) => {
    const powerSchedulerV1 = await grpcClient.get('power_scheduler', 'v1');
    const response = await powerSchedulerV1.Controller.stat(params);

    return response;
};

export {
    createController,
    updateController,
    updateControllerPlugin,
    verifyControllerPlugin,
    deleteController,
    getController,
    listControllers,
    statControllers
};
