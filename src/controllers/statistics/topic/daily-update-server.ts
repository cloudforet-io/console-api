import moment from 'moment-timezone';
import grpcClient from '@lib/grpc-client';
import { tagsToObject } from '@lib/utils';
import logger from '@lib/logger';
import { requestCache } from './request-cache';

const CREATE_WARNING_RATIO = '50';
const DELETE_WARNING_RATIO = '50';

const getDefaultQuery = () => {
    return {
        'aggregate': [
            {
                'query': {
                    'resource_type': 'inventory.CloudServiceType',
                    'query': {
                        'aggregate': [{
                            'group': {
                                'keys': [
                                    {
                                        'name': 'cloud_service_type_id',
                                        'key': 'cloud_service_type_id'
                                    },
                                    {
                                        'name': 'cloud_service_type',
                                        'key': 'name'
                                    },
                                    {
                                        'name': 'cloud_service_group',
                                        'key': 'group'
                                    },
                                    {
                                        'name': 'provider',
                                        'key': 'provider'
                                    }
                                ],
                                'fields': [
                                    {
                                        'name': 'tags',
                                        'key': 'tags',
                                        'operator': 'first'
                                    }
                                ]
                            }
                        }],
                        'filter': [
                            {
                                'key': 'resource_type',
                                'operator': 'eq',
                                'value': 'inventory.Server'
                            }
                        ]
                    }
                }
            },
            {
                'join': {
                    'resource_type': 'inventory.Server',
                    'keys': [
                        'provider',
                        'cloud_service_group',
                        'cloud_service_type'
                    ],
                    'query': {
                        'aggregate': [{
                            'group': {
                                'fields': [
                                    {
                                        'name': 'total_count',
                                        'operator': 'count'
                                    }
                                ],
                                'keys': [
                                    {
                                        'name': 'provider',
                                        'key': 'provider'
                                    },
                                    {
                                        'name': 'cloud_service_group',
                                        'key': 'cloud_service_group'
                                    },
                                    {
                                        'name': 'cloud_service_type',
                                        'key': 'cloud_service_type'
                                    }
                                ]
                            }
                        }],
                        'filter': []
                    }
                }
            },
            {
                'join': {
                    'resource_type': 'inventory.Server',
                    'keys': [
                        'provider',
                        'cloud_service_group',
                        'cloud_service_type'
                    ],
                    'query': {
                        'aggregate': [{
                            'group': {
                                'fields': [
                                    {
                                        'name': 'created_count',
                                        'operator': 'count'
                                    }
                                ],
                                'keys': [
                                    {
                                        'name': 'provider',
                                        'key': 'provider'
                                    },
                                    {
                                        'name': 'cloud_service_group',
                                        'key': 'cloud_service_group'
                                    },
                                    {
                                        'name': 'cloud_service_type',
                                        'key': 'cloud_service_type'
                                    }
                                ]
                            }
                        }],
                        'filter': []
                    }
                }
            },
            {
                'join': {
                    'resource_type': 'inventory.Server',
                    'keys': [
                        'provider',
                        'cloud_service_group',
                        'cloud_service_type'
                    ],
                    'query': {
                        'aggregate': [{
                            'group': {
                                'fields': [
                                    {
                                        'name': 'deleted_count',
                                        'operator': 'count'
                                    }
                                ],
                                'keys': [
                                    {
                                        'name': 'provider',
                                        'key': 'provider'
                                    },
                                    {
                                        'name': 'cloud_service_group',
                                        'key': 'cloud_service_group'
                                    },
                                    {
                                        'name': 'cloud_service_type',
                                        'key': 'cloud_service_type'
                                    }
                                ]
                            }
                        }],
                        'filter': [
                            {
                                'key': 'state',
                                'operator': 'eq',
                                'value': 'DELETED'
                            }
                        ]
                    }
                }
            },
            {
                'fill_na': {
                    'data': {
                        'total_count': 0,
                        'created_count': 0,
                        'deleted_count': 0
                    }
                }
            },
            {
                'formula': {
                    'query': 'created_count > 0 or deleted_count > 0'
                }
            },
            {
                'formula': {
                    'eval': `create_warning = created_count >= total_count/100*${CREATE_WARNING_RATIO}`
                }
            },
            {
                'formula': {
                    'eval': `delete_warning = deleted_count >= total_count/100*${DELETE_WARNING_RATIO}`
                }
            },
            {
                'sort': {
                    'key': 'provider'
                }
            }
        ]
    };
};

const makeRequest = (params) => {
    const requestParams = getDefaultQuery();

    if (params.project_id) {
        requestParams.aggregate[1].join?.query.filter.push({
            key: 'project_id',
            value: params.project_id,
            operator: 'eq'
        });

        requestParams.aggregate[2].join?.query.filter.push({
            key: 'project_id',
            value: params.project_id,
            operator: 'eq'
        });

        requestParams.aggregate[3].join?.query.filter.push({
            key: 'project_id',
            value: params.project_id,
            operator: 'eq'
        });
    }

    const dt = moment().tz(params.timezone || 'UTC');
    dt.set({hour:0,minute:0,second:0,millisecond:0});

    requestParams.aggregate[2].join?.query.filter.push({
        key: 'created_at',
        value: dt.format(),
        operator: 'datetime_gte'
    });

    requestParams.aggregate[3].join?.query.filter.push({
        key: 'deleted_at',
        value: dt.format(),
        operator: 'datetime_gte'
    });

    return requestParams;
};

const requestStat = async (params) => {
    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    const response = await statisticsV1.Resource.stat(requestParams);

    response.results = response.results.map((data) => {
        const tags = tagsToObject(data.tags);
        data.icon = tags['spaceone:icon'];
        delete data['tags'];
        return data;
    });

    return response;
};

const dailyUpdateServer = async (params) => {
    return await requestCache('stat:dailyUpdateServer', params, requestStat);
};

export default dailyUpdateServer;
