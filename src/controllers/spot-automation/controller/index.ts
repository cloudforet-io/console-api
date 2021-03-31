import grpcClient from '@lib/grpc-client';

const createController = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    const response = await spotAutomationV1.Controller.create(params);

    return response;
};

const updateController = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    const response = await spotAutomationV1.Controller.update(params);

    return response;
};

const updateControllerPlugin = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    const response = await spotAutomationV1.Controller.update_plugin(params);

    return response;
};

const verifyControllerPlugin = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    const response = await spotAutomationV1.Controller.verify_plugin(params);

    return response;
};

const deleteController = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    const response = await spotAutomationV1.Controller.delete(params);

    return response;
};

const getController = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    const response = await spotAutomationV1.Controller.get(params);

    return response;
};

const listControllers = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    const response = await spotAutomationV1.Controller.list(params);

    return response;
};

const statControllers = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    const response = await spotAutomationV1.Controller.stat(params);

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
