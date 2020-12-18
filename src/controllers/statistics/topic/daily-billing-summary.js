import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
import httpContext from 'express-http-context';
import { DailyBillingSummaryFactory } from '@factories/statistics/topic/daily-billing-summary';
import {BillingSummaryFactory} from '@factories/statistics/topic/billing-summary';

const getDefaultQuery = () => {
    return {

    };
};

const makeRequest = (params) => {
    let requestParams = getDefaultQuery();
    return requestParams;
};

const dailyBillingSummary = async (params) => {
    if (httpContext.get('mock_mode')) {
        if (params.aggregation) {
            return {
                results: DailyBillingSummaryFactory.buildBatch(10, params)
            };
        } else {
            return {
                results: DailyBillingSummaryFactory.buildBatch(1, params)
            };
        }
    }

    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    const response = await statisticsV1.Resource.stat(requestParams);

    return response;
};

export default dailyBillingSummary;
