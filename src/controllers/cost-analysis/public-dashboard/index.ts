import grpcClient from '@lib/grpc-client';

const createPublicDashboard = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.PublicDashboard.create(params);

    return response;
};

const updatePublicDashboard = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.PublicDashboard.update(params);

    return response;
};

const deletePublicDashboard = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.PublicDashboard.delete(params);

    return response;
};

const getPublicDashboard = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.PublicDashboard.get(params);

    return response;
};

const listPublicDashboards = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.PublicDashboard.list(params);

    return response;
};

const statPublicDashboards = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.PublicDashboard.stat(params);

    return response;
};

export {
    createPublicDashboard,
    updatePublicDashboard,
    deletePublicDashboard,
    getPublicDashboard,
    listPublicDashboards,
    statPublicDashboards
};
