import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

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
                        }
                    ]
                }
            },
            'filter': [
                {
                    'key': 'tags.spaceone:is_major',
                    'operator': 'eq',
                    'value': 'true'
                }
            ]
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
                    'filter': [
                        {
                            'key': 'created_at',
                            'operator': 'timediff_gt',
                            'value': 'now/d-14d'
                        }
                    ]
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
                            'key': 'deleted_at',
                            'operator': 'timediff_gt',
                            'value': 'now/d-14d'
                        },
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
        'formulas': [
            {
                'formula': 'created_count > 0 or deleted_count > 0',
                'operator': 'QUERY'
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

    return requestParams;
};

const dailyUpdateCloudService = async (params) => {
    let statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    let response = await statisticsV1.Resource.stat(requestParams);

    return response;
};

export default dailyUpdateCloudService;
