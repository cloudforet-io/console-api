//@ts-nocheck
import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
import moment from 'moment-timezone';
import httpContext from 'express-http-context';
import { PhdEventsFactory } from '@factories/statistics/topic/phd-events';
import _ from 'lodash';
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
                                        'name': 'resource_id',
                                        'key': 'reference.resource_id'
                                    },
                                    {
                                        'name': 'project_id',
                                        'key': 'project_id'
                                    }
                                ],
                                'fields': [
                                    {
                                        'name': 'affected_resources',
                                        'key': 'data.affected_resources',
                                        'operator': 'add_to_set'
                                    },
                                    {
                                        'name': 'event_title',
                                        'key': 'data.event_title',
                                        'operator': 'first'
                                    },
                                    {
                                        'name': 'event_type_category',
                                        'key': 'data.event_type_category',
                                        'operator': 'first'
                                    },
                                    {
                                        'name': 'region_code',
                                        'key': 'region_code',
                                        'operator': 'first'
                                    },
                                    {
                                        'name': 'service',
                                        'key': 'data.service',
                                        'operator': 'first'
                                    },
                                    {
                                        'name': 'start_time',
                                        'key': 'data.start_time',
                                        'operator': 'first'
                                    },
                                    {
                                        'name': 'last_update_time',
                                        'key': 'data.last_update_time',
                                        'operator': 'first'
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
            },
            {
                'sort': {
                    'key': 'last_update_time',
                    'desc': true
                }
            }
        ]
    };
};

const makeRequest = (params) => {
    let requestParams = getDefaultQuery();

    if (params.project_id) {
        requestParams['aggregate'][0]['query']['query']['filter'].push({
            k: 'project_id',
            v: params.project_id,
            o: 'eq'
        });
    }

    if (params.event_type_category) {
        requestParams['aggregate'][0]['query']['query']['filter'].push({
            k: 'data.event_type_category',
            v: params.event_type_category,
            o: 'eq'
        });
    }

    if (params.query) {
        if (params.query.page) {
            requestParams['page'] = params.query.page;
        }

        if (params.query.sort) {
            requestParams['aggregate'][1]['sort'] = params.query.sort;
        }

        if (params.query.keyword) {
            requestParams['aggregate'][0]['query']['query']['keyword'] = params.query.keyword;
        }
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
    const results = response.results.map((result) => {
        result.affected_resources = result.affected_resources.flat();
        return result;
    });

    return {
        results: results,
        total_count: response.total_count
    };
};

const requestStat = async (params) => {
    if (httpContext.get('mock_mode')) {
        return {
            results: PhdEventsFactory.buildBatch(_.get(params, 'query.page.limit') || 10, params),
            total_count: 100
        };
    }

    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    const response = await statisticsV1.Resource.stat(requestParams);

    return makeResponse(params, response);
};

const phdEvents = async (params) => {
    return await requestCache('stat:phdEvents', params, requestStat);
};

export default phdEvents;
