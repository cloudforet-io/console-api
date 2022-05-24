import { requestCache } from '@controllers/statistics/topic/request-cache';
import grpcClient from '@lib/grpc-client';

const createCost = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.Cost.create(params);

    return response;
};

const deleteCost = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.Cost.delete(params);

    return response;
};

const getCost = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.Cost.get(params);

    return response;
};

const listCosts = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.Cost.list(params);

    return response;
};

const requestAnalyzeCosts = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.Cost.analyze(params);

    return response;
};

const analyzeCosts = async (params) => {
    return await requestCache('topic:analyzeCosts', params, requestAnalyzeCosts, 120);
};

const statCosts = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.Cost.stat(params);

    return response;
};

export {
    createCost,
    deleteCost,
    getCost,
    listCosts,
    analyzeCosts,
    statCosts
};
