import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const enableDomain = async (params) => {
    const reportV1 = await grpcClient.get('report', 'v1');
    const response = await reportV1.Domain.enable(params);
    return response;
};

const disableDomain = async (params) => {
    const reportV1 = await grpcClient.get('report', 'v1');
    const response = await reportV1.Domain.disable(params);
    return response;
};

const getDomain = async (params) => {
    const reportV1 = await grpcClient.get('report', 'v1');
    const response = await reportV1.Domain.get(params);

    return response;
};

const listDomains = async (params) => {
    const reportV1 = await grpcClient.get('report', 'v1');
    const response = await reportV1.Domain.list(params);
    return response;
};

const statDomains = async (params) => {
    const reportV1 = await grpcClient.get('report', 'v1');
    const response = await reportV1.Domain.stat(params);
    return response;
};

export {
    enableDomain,
    disableDomain,
    getDomain,
    listDomains,
    statDomains
};
