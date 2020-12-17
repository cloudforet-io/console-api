import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
import httpContext from 'express-http-context';
import { PhdCountByTypeFactory } from '@factories/statistics/topic/phd-count-by-type';

const getDefaultQuery = () => {
    return {

    };
};

const makeRequest = (params) => {
    let requestParams = getDefaultQuery();
    return requestParams;
};

const phdCountByType = async (params) => {
    if (httpContext.get('mock_mode')) {
        return new PhdCountByTypeFactory();
    }

    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    const response = await statisticsV1.Resource.stat(requestParams);

    return response;
};

export default phdCountByType;
