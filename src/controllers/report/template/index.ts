import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const getTemplate = async (params) => {
    const reportV1 = await grpcClient.get('report', 'v1');
    const response = await reportV1.Template.get(params);

    return response;
};

const listTemplates = async (params) => {
    const reportV1 = await grpcClient.get('report', 'v1');
    const response = await reportV1.Template.list(params);
    return response;
};


export {
    getTemplate,
    listTemplates
};
