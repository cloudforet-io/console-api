import grpcClient from '@lib/grpc-client';

const setExchangeRate = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.ExchangeRate.set(params);

    return response;
};

const resetExchangeRate = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.ExchangeRate.reset(params);

    return response;
};

const getExchangeRate = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.ExchangeRate.get(params);

    return response;
};

const listExchangeRates = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');
    const response = await costAnalysisV1.ExchangeRate.list(params);

    return response;
};

export {
    setExchangeRate,
    resetExchangeRate,
    getExchangeRate,
    listExchangeRates
};
