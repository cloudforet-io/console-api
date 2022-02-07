import grpcClient from '@lib/grpc-client';

const createCustomWidget = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.CustomWidget.create(params);

    return response;
};

const updateCustomWidget = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.CustomWidget.update(params);

    return response;
};

const deleteCustomWidget = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.CustomWidget.delete(params);

    return response;
};

const getCustomWidget = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.CustomWidget.get(params);

    return response;
};

const listCustomWidgets = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.CustomWidget.list(params);

    return response;
};

const statCustomWidgets = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.CustomWidget.stat(params);

    return response;
};

export {
    createCustomWidget,
    updateCustomWidget,
    deleteCustomWidget,
    getCustomWidget,
    listCustomWidgets,
    statCustomWidgets
};
