import grpcClient from '@lib/grpc-client';

const createDashboard = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.Dashboard.create(params);

    return response;
};

const updateDashboard = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.Dashboard.update(params);

    return response;
};

const changeDashboardScope = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.Dashboard.change_scope(params);

    return response;
};

const deleteDashboard = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.Dashboard.delete(params);

    return response;
};

const getDashboard = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.Dashboard.get(params);

    return response;
};

const listDashboards = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.Dashboard.list(params);

    return response;
};

const statDashboards = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.Dashboard.stat(params);

    return response;
};

export {
    createDashboard,
    updateDashboard,
    changeDashboardScope,
    deleteDashboard,
    getDashboard,
    listDashboards,
    statDashboards
};
