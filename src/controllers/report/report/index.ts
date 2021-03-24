import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const createReport = async (params) => {
    const reportV1 = await grpcClient.get('report', 'v1');
    const response = await reportV1.Report.create(params);
    return response;
};

const getDownloadUrl = async (params) => {
    const reportV1 = await grpcClient.get('report', 'v1');
    const response = await reportV1.Report.get_download_url(params);
    return response;
};

const getReport = async (params) => {
    const reportV1 = await grpcClient.get('report', 'v1');
    const response = await reportV1.Report.get(params);

    return response;
};

const listReports = async (params) => {
    const reportV1 = await grpcClient.get('report', 'v1');
    const response = await reportV1.Report.list(params);
    return response;
};

const statReports = async (params) => {
    const reportV1 = await grpcClient.get('report', 'v1');
    const response = await reportV1.Report.stat(params);
    return response;
};

export {
    createReport,
    getDownloadUrl,
    getReport,
    listReports,
    statReports
};
