import grpcClient from '@lib/grpc-client';

const enableDomain = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    const response = await spotAutomationV1.Domain.enable(params);

    return response;
};

const disableDomain = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    const response = await spotAutomationV1.Domain.disable(params);

    return response;
};

const getDomain = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    const response = await spotAutomationV1.Domain.get(params);

    return response;
};

const listDomains = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    const response = await spotAutomationV1.Domain.list(params);

    return response;
};


export {
    enableDomain,
    disableDomain,
    getDomain,
    listDomains
};
