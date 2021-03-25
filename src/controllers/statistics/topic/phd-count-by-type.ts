//@ts-nocheck
import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
import moment from 'moment-timezone';
import httpContext from 'express-http-context';
import { PhdCountByTypeFactory } from '@factories/statistics/topic/phd-count-by-type';
import { requestCache } from './request-cache';

const getDefaultQuery = () => {
    return {
        'aggregate': [
            {
                'query': {
                    'resource_type': 'inventory.CloudService',
                    'query': {
                        'aggregate': [{
                            'group': {
                                'keys': [
                                    {
                                        'name': 'event_type_category',
                                        'key': 'data.event_type_category'
                                    }
                                ],
                                'fields': [
                                    {
                                        'name': 'count',
                                        'operator': 'count'
                                    }
                                ]
                            }
                        }],
                        'filter': [
                            {
                                'key': 'provider',
                                'value': 'aws',
                                'operator': 'eq'
                            },
                            {
                                'key': 'cloud_service_group',
                                'value': 'PersonalHealthDashboard',
                                'operator': 'eq'
                            },
                            {
                                'key': 'cloud_service_type',
                                'value': 'Event',
                                'operator': 'eq'
                            },
                            {
                                'key': 'data.status_code',
                                'value': 'closed',
                                'operator': 'not'
                            }
                        ]
                    }
                }
            }
        ]
    };
};

const makeRequest = (params) => {
    const requestParams = getDefaultQuery();

    if (params.project_id) {
        requestParams['aggregate'][0]['query']['query']['filter'].push({
            k: 'project_id',
            v: params.project_id,
            o: 'eq'
        });
    }

    if (params.period) {
        if (typeof params.period !== 'number') {
            throw new Error('Parameter type is invalid. (params.period = integer)');
        }

        const dt = moment().tz('UTC').add(-params.period, 'days');
        requestParams['aggregate'][0]['query']['query']['filter'].push({
            k: 'data.last_update_time',
            v: dt.format('YYYY-MM-DDTHH:mm:ss'),
            o: 'gte'
        });
    }

    return requestParams;
};

const makeResponse = (params, response) => {
    const responseData = {};

    response.results.forEach((result) => {
        responseData[result.event_type_category] = result.count;
    });

    ['issue', 'scheduledChange', 'accountNotification'].forEach((category) => {
        if (!(category in responseData)) {
            responseData[category] = 0;
        }
    });

    return responseData;
};

const requestStat = async (params) => {
    if (httpContext.get('mock_mode')) {
        return new PhdCountByTypeFactory();
    }

    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    const response = await statisticsV1.Resource.stat(requestParams);

    return makeResponse(params, response);
};

const phdCountByType = async (params) => {
    return await requestCache('stat:phdCountByType', params, requestStat);
};

export default phdCountByType;
