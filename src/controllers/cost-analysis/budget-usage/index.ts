import grpcClient from '@lib/grpc-client';

const listBudgetUsage = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.BudgetUsage.list(params);

    return response;
};

const statBudgetUsage = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.BudgetUsage.stat(params);

    return response;
};

export {
    listBudgetUsage,
    statBudgetUsage
};
