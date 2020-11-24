import moment from 'moment-timezone';
import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const CREATE_WARNING_RATIO = '50';
const DELETE_WARNING_RATIO = '50';

const getDefaultQuery = () => {
    return {
        'resource_type': 'inventory.CloudServiceType',
        'query': {
            'aggregate': {
                'group': {
                    'keys': [
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
                        },
                        {
                            'name': 'icon',
                            'key': 'tags.spaceone:icon'
                        }
                    ]
                }
            },
            'filter': [
                {
                    'key': 'is_major',
                    'operator': 'eq',
                    'value': true
                },
                {
                    'key': 'is_primary',
                    'operator': 'eq',
                    'value': true
                }
            ],
            'sort': {
                'name': 'provider'
            }
        },
        'join': [
            {
                'query': {
                    'aggregate': {
                        'group': {
                            'fields': [
                                {
                                    'name': 'total_count',
                                    'operator': 'count'
                                }
                            ],
                            'keys': [
                                {
                                    'name': 'cloud_service_type',
                                    'key': 'cloud_service_type'
                                },
                                {
                                    'name': 'cloud_service_group',
                                    'key': 'cloud_service_group'
                                },
                                {
                                    'name': 'provider',
                                    'key': 'provider'
                                }
                            ]
                        }
                    }
                },
                'keys': [
                    'cloud_service_type',
                    'cloud_service_group',
                    'provider'
                ],
                'resource_type': 'inventory.CloudService'
            },
            {
                'query': {
                    'aggregate': {
                        'group': {
                            'fields': [
                                {
                                    'name': 'created_count',
                                    'operator': 'count'
                                }
                            ],
                            'keys': [
                                {
                                    'name': 'cloud_service_type',
                                    'key': 'cloud_service_type'
                                },
                                {
                                    'name': 'cloud_service_group',
                                    'key': 'cloud_service_group'
                                },
                                {
                                    'name': 'provider',
                                    'key': 'provider'
                                }
                            ]
                        }
                    },
                    'filter': []
                },
                'keys': [
                    'cloud_service_type',
                    'cloud_service_group',
                    'provider'
                ],
                'resource_type': 'inventory.CloudService'
            },
            {
                'query': {
                    'aggregate': {
                        'group': {
                            'fields': [
                                {
                                    'name': 'deleted_count',
                                    'operator': 'count'
                                }
                            ],
                            'keys': [
                                {
                                    'name': 'cloud_service_type',
                                    'key': 'cloud_service_type'
                                },
                                {
                                    'name': 'cloud_service_group',
                                    'key': 'cloud_service_group'
                                },
                                {
                                    'name': 'provider',
                                    'key': 'provider'
                                }
                            ]
                        }
                    },
                    'filter': [
                        {
                            'key': 'state',
                            'operator': 'eq',
                            'value': 'DELETED'
                        }
                    ]
                },
                'keys': [
                    'cloud_service_type',
                    'cloud_service_group',
                    'provider'
                ],
                'resource_type': 'inventory.CloudService'
            }
        ],
        'fill_na': {
            'total_count': 0,
            'created_count': 0,
            'deleted_count': 0
        },
        'formulas': [
            {
                'formula': 'created_count > 0 or deleted_count > 0',
                'operator': 'QUERY'
            },
            {
                'formula': `create_warning = created_count >= total_count/100*${CREATE_WARNING_RATIO}`
            },
            {
                'formula': `delete_warning = deleted_count >= total_count/100*${DELETE_WARNING_RATIO}`
            }
        ]
    };
};

const makeRequest = (params) => {
    let requestParams = getDefaultQuery();

    if (params.project_id) {
        requestParams.join[0].query.filter = [{
            k: 'project_id',
            v: params.project_id,
            o: 'eq'
        }];

        requestParams.join[1].query.filter.push({
            k: 'project_id',
            v: params.project_id,
            o: 'eq'
        });

        requestParams.join[2].query.filter.push({
            k: 'project_id',
            v: params.project_id,
            o: 'eq'
        });
    }

    const dt = moment().tz(params.timezone || 'UTC');
    dt.set({hour:0,minute:0,second:0,millisecond:0});

    requestParams.join[1].query.filter.push({
        k: 'created_at',
        v: dt.format(),
        o: 'datetime_gte'
    });

    requestParams.join[2].query.filter.push({
        k: 'deleted_at',
        v: dt.format(),
        o: 'datetime_gte'
    });

    return requestParams;
};

const dailyUpdateCloudService = async (params) => {
    let statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    let response = await statisticsV1.Resource.stat(requestParams);

    return response;
};

export default dailyUpdateCloudService;
