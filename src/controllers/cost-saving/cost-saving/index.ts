import grpcClient from '@lib/grpc-client';

const listSavingCosts = async (params) => {
    const costSavingV1 = await grpcClient.get('cost_saving', 'v1');
    const response = await costSavingV1.CostSaving.list(params);

    return response;
};

const statSavingCosts = async (params) => {
    const costSavingV1 = await grpcClient.get('cost_saving', 'v1');
    const response = await costSavingV1.CostSaving.stat(params);

    return response;
};

export {
    listSavingCosts,
    statSavingCosts
};
