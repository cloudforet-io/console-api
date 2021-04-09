import grpcClient from '@lib/grpc-client';

const listInterrupts = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    const response = await spotAutomationV1.Interrupt.list(params);

    return response;
};

const statInterrupts = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    const response = await spotAutomationV1.Interrupt.stat(params);

    return response;
};

export {
    listInterrupts,
    statInterrupts
};
