import grpcClient from '@lib/grpc-client';
import { BudgetBulkCreateRequestBody } from '@controllers/cost-analysis/budget/type';
import { createBudgetTemplateExcel } from '@controllers/cost-analysis/budget/create-template-helper';

const createBudget = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.Budget.create(params);

    return response;
};

const createTemplate = async ({ include_values, source }: BudgetBulkCreateRequestBody, response) => {
    if (include_values) {
        if (!source) {
            throw new Error('Invalid Parameter. (source = required in object type when include_values parameter is true)');
        }
        return await createBudgetTemplateExcel(response, source);
    }
    return await createBudgetTemplateExcel(response);
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
    createTemplate,
    updateBudget,
    setBudgetNotification,
    deleteBudget,
    getBudget,
    listBudgets,
    statBudgets
};
