import grpcClient from '@lib/grpc-client';

const createDomainConfig = async (params) => {
    const configV1 = await grpcClient.get('config', 'v1');
    const response = await configV1.DomainConfig.create(params);

    return response;
};

const updateDomainConfig = async (params) => {
    const configV1 = await grpcClient.get('config', 'v1');
    const response = await configV1.DomainConfig.update(params);

    return response;
};

const setDomainConfig = async (params) => {
    const configV1 = await grpcClient.get('config', 'v1');
    const response = await configV1.DomainConfig.set(params);

    return response;
};

const deleteDomainConfig = async (params) => {
    const configV1 = await grpcClient.get('config', 'v1');
    const response = await configV1.DomainConfig.delete(params);

    return response;
};

const getDomainConfig = async (params) => {
    const configV1 = await grpcClient.get('config', 'v1');
    const response = await configV1.DomainConfig.get(params);

    return response;
};

const listDomainConfigs = async (params) => {
    const configV1 = await grpcClient.get('config', 'v1');
    console.log(params);
    const response = await configV1.DomainConfig.list(params);

    return response;
};

const statDomainConfigs = async (params) => {
    const identityV1 = await grpcClient.get('config', 'v1');
    const response = await identityV1.DomainConfig.stat(params);

    return response;
};

export {
    createDomainConfig,
    updateDomainConfig,
    setDomainConfig,
    deleteDomainConfig,
    getDomainConfig,
    listDomainConfigs,
    statDomainConfigs
};
