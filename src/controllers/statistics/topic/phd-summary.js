import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
import httpContext from 'express-http-context';
import { PhdSummaryFactory } from '@factories/statistics/topic/phd-summary';

const getDefaultQuery = () => {
    return {

    };
};

const makeRequest = (params) => {
    let requestParams = getDefaultQuery();
    return requestParams;
};

const phdSummary = async (params) => {
    if (httpContext.get('mock_mode')) {
        return {
            results: PhdSummaryFactory.buildBatch(10),
            total_count: 10
        };
    }

    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    const response = await statisticsV1.Resource.stat(requestParams);

    return response;
};

export default phdSummary;
