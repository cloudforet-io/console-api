import grpcClient from '@lib/grpc-client';

const createBudget = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.Budget.create(params);

    return response;
};

const updateBudget = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.Budget.update(params);

    return response;
};

const setBudgetNotification = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.Budget.set_notification(params);

    return response;
};

const deleteBudget = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.Budget.delete(params);

    return response;
};

const getBudget = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.Budget.get(params);

    return response;
};

const listBudgets = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.Budget.list(params);

    return response;
};

const statBudgets = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.Budget.stat(params);

    return response;
};

export {
    createBudget,
    updateBudget,
    setBudgetNotification,
    deleteBudget,
    getBudget,
    listBudgets,
    statBudgets
};
