import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
import httpContext from 'express-http-context';
import { PhdCountByTypeFactory } from '@factories/statistics/topic/phd-count-by-type';

const getDefaultQuery = () => {
    return {
        'resource_type': 'inventory.CloudService',
        'query': {
            'aggregate': {
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
            },
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
                // },
                // {
                //     'key': 'data.status_code',
                //     'value': 'closed',
                //     'operator': 'not'
                }
            ]
        }
    };
};

const makeRequest = (params) => {
    let requestParams = getDefaultQuery();

    if (params.project_id) {
        requestParams['query']['filter'].push({
            k: 'project_id',
            v: params.project_id,
            o: 'eq'
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

const phdCountByType = async (params) => {
    if (httpContext.get('mock_mode')) {
        return new PhdCountByTypeFactory();
    }

    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    const response = await statisticsV1.Resource.stat(requestParams);

    return makeResponse(params, response);
};

export default phdCountByType;
