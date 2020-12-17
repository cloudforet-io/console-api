import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
import httpContext from 'express-http-context';
import { PhdEventsFactory } from '@factories/statistics/topic/phd-events';
import _ from 'lodash';

const getDefaultQuery = () => {
    return {

    };
};

const makeRequest = (params) => {
    let requestParams = getDefaultQuery();
    return requestParams;
};

const phdEvents = async (params) => {
    if (httpContext.get('mock_mode')) {
        return {
            results: PhdEventsFactory.buildBatch(_.get(params, 'query.page.limit') || 10, params),
            total_count: 100
        };
    }

    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    const response = await statisticsV1.Resource.stat(requestParams);

    return response;
};

export default phdEvents;
