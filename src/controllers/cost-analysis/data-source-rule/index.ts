import grpcClient from '@lib/grpc-client';

const createDataSourceRule = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.DataSourceRule.create(params);

    return response;
};

const updateDataSourceRule = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.DataSourceRule.update(params);

    return response;
};

const changeDataSourceRuleOrder = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.DataSourceRule.change_order(params);

    return response;
};

const deleteDataSourceRule = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.DataSourceRule.delete(params);

    return response;
};

const getDataSourceRule = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.DataSourceRule.get(params);

    return response;
};

const listDataSourceRules = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.DataSourceRule.list(params);

    return response;
};

const statDataSourceRules = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.DataSourceRule.stat(params);

    return response;
};

export {
    createDataSourceRule,
    updateDataSourceRule,
    changeDataSourceRuleOrder,
    deleteDataSourceRule,
    getDataSourceRule,
    listDataSourceRules,
    statDataSourceRules
};
