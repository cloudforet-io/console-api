import grpcClient from '@lib/grpc-client';

const listHistory = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    const response = await spotAutomationV1.History.list(params);

    return response;
};

const statHistory = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    const response = await spotAutomationV1.History.stat(params);

    return response;
};

export {
    listHistory,
    statHistory
};
