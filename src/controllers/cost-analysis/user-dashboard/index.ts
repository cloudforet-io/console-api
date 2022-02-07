import grpcClient from '@lib/grpc-client';

const createUserDashboard = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.UserDashboard.create(params);

    return response;
};

const updateUserDashboard = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.UserDashboard.update(params);

    return response;
};

const deleteUserDashboard = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.UserDashboard.delete(params);

    return response;
};

const getUserDashboard = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.UserDashboard.get(params);

    return response;
};

const listUserDashboards = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.UserDashboard.list(params);

    return response;
};

const statUserDashboards = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.UserDashboard.stat(params);

    return response;
};

export {
    createUserDashboard,
    updateUserDashboard,
    deleteUserDashboard,
    getUserDashboard,
    listUserDashboards,
    statUserDashboards
};
