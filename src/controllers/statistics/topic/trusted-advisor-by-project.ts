import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
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
                                        'name': 'project_id',
                                        'key': 'project_id'
                                    },
                                    {
                                        'name': 'category',
                                        'key': 'data.category'
                                    }
                                ],
                                'fields': [
                                    {
                                        'name': 'ok_count',
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
                                'value': 'TrustedAdvisor',
                                'operator': 'eq'
                            },
                            {
                                'key': 'cloud_service_type',
                                'value': 'Check',
                                'operator': 'eq'
                            },
                            {
                                'key': 'data.status',
                                'value': 'ok',
                                'operator': 'eq'
                            },
                            {
                                'key': 'project_id',
                                'value': null,
                                'operator': 'not'
                            }
                        ]
                    }
                }
            },
            {
                'join': {
                    'resource_type': 'inventory.CloudService',
                    'keys': [
                        'project_id',
                        'category'
                    ],
                    'query': {
                        'aggregate': [{
                            'group': {
                                'keys': [
                                    {
                                        'name': 'project_id',
                                        'key': 'project_id'
                                    },
                                    {
                                        'name': 'category',
                                        'key': 'data.category'
                                    }
                                ],
                                'fields': [
                                    {
                                        'name': 'warning_count',
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
                                'value': 'TrustedAdvisor',
                                'operator': 'eq'
                            },
                            {
                                'key': 'cloud_service_type',
                                'value': 'Check',
                                'operator': 'eq'
                            },
                            {
                                'key': 'data.status',
                                'value': 'warning',
                                'operator': 'eq'
                            },
                            {
                                'key': 'project_id',
                                'value': null,
                                'operator': 'not'
                            }
                        ]
                    }
                }
            },
            {
                'join': {
                    'resource_type': 'inventory.CloudService',
                    'keys': [
                        'project_id',
                        'category'
                    ],
                    'query': {
                        'aggregate': [{
                            'group': {
                                'keys': [
                                    {
                                        'name': 'project_id',
                                        'key': 'project_id'
                                    },
                                    {
                                        'name': 'category',
                                        'key': 'data.category'
                                    }
                                ],
                                'fields': [
                                    {
                                        'name': 'error_count',
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
                                'value': 'TrustedAdvisor',
                                'operator': 'eq'
                            },
                            {
                                'key': 'cloud_service_type',
                                'value': 'Check',
                                'operator': 'eq'
                            },
                            {
                                'key': 'data.status',
                                'value': 'error',
                                'operator': 'eq'
                            },
                            {
                                'key': 'project_id',
                                'value': null,
                                'operator': 'not'
                            }
                        ]
                    }
                }
            },
            {
                'fill_na': {
                    'data': {

                        'ok_count': 0,
                        'warning_count': 0,
                        'error_count': 0
                    }
                }
            }
        ]
    };
};

const makeRequest = (params) => {
    const requestParams = getDefaultQuery();

    if (params.project_id) {
        requestParams.aggregate[0].query?.query.filter.push({
            // @ts-ignore
            k: 'project_id',
            v: params.project_id,
            o: 'eq'
        });
        requestParams.aggregate[1].join?.query.filter.push({
            // @ts-ignore
            k: 'project_id',
            v: params.project_id,
            o: 'eq'
        });
        requestParams.aggregate[1].join?.query.filter.push({
            // @ts-ignore
            k: 'project_id',
            v: params.project_id,
            o: 'eq'
        });
    }

    return requestParams;
};

const makeResponse = (results) => {
    const result = {};

    results.forEach((item) => {
        if (!(item.project_id in result)) {
            result[item.project_id] = {};
        }

        result[item.project_id][item.category] = {
            ok_count: item.ok_count,
            warning_count: item.warning_count,
            error_count: item.error_count
        };
    });

    return result;
};

const requestStat = async (params) => {
    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    const response = await statisticsV1.Resource.stat(requestParams);

    return makeResponse(response.results);
};

const trustedAdvisorByProject = async (params) => {
    return await requestCache('stat:trustedAdvisorByProject', params, requestStat);
};

export default trustedAdvisorByProject;
