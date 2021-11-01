import grpcClient from '@lib/grpc-client';

const createCostQuerySet = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.CostQuerySet.create(params);

    return response;
};

const updateCostQuerySet = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.CostQuerySet.update(params);

    return response;
};

const changeCostQuerySetScope = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.CostQuerySet.change_scope(params);

    return response;
};

const deleteCostQuerySet = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.CostQuerySet.delete(params);

    return response;
};

const getCostQuerySet = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.CostQuerySet.get(params);

    return response;
};

const listCostQuerySets = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.CostQuerySet.list(params);

    return response;
};

const statCostQuerySets = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.CostQuerySet.stat(params);

    return response;
};

export {
    createCostQuerySet,
    updateCostQuerySet,
    changeCostQuerySetScope,
    deleteCostQuerySet,
    getCostQuerySet,
    listCostQuerySets,
    statCostQuerySets
};
