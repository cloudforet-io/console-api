import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const getDefaultQuery = () => {
    return {
        'resource_type': 'identity.Project',
        'query': {
            'sort': {
                'name': 'resource_count',
                'desc': true
            },
            'page': {
                'limit': 5
            },
            'aggregate': {
                'group': {
                    'keys': [
                        {
                            'key': 'project_id',
                            'name': 'project_id'
                        },
                        {
                            'key': 'name',
                            'name': 'project'
                        },
                        {
                            'key': 'project_group.project_group_id',
                            'name': 'project_group_id'
                        },
                        {
                            'key': 'project_group.name',
                            'name': 'project_group'
                        }
                    ],
                    'fields': []
                }
            }
        },
        'join': [
            {
                'keys': [
                    'project_id'
                ],
                'resource_type': 'inventory.Server',
                'query': {
                    'aggregate': {
                        'group': {
                            'keys': [
                                {
                                    'key': 'project_id',
                                    'name': 'project_id'
                                }
                            ],
                            'fields': [
                                {
                                    'name': 'server_count',
                                    'operator': 'count'
                                }
                            ]
                        }
                    }
                }
            },
            {
                'keys': [
                    'project_id'
                ],
                'resource_type': 'inventory.CloudService',
                'query': {
                    'aggregate': {
                        'group': {
                            'keys': [
                                {
                                    'key': 'project_id',
                                    'name': 'project_id'
                                }
                            ],
                            'fields': [
                                {
                                    'name': 'database_count',
                                    'operator': 'count'
                                }
                            ]
                        }
                    },
                    'filter': [
                        {
                            'key': 'ref_cloud_service_type.labels',
                            'value': 'Database',
                            'operator': 'eq'
                        },
                        {
                            'key': 'ref_cloud_service_type.is_major',
                            'value': true,
                            'operator': 'eq'
                        }
                    ]
                }
            },
            {
                'keys': [
                    'project_id'
                ],
                'resource_type': 'inventory.CloudService',
                'query': {
                    'aggregate': {
                        'group': {
                            'keys': [
                                {
                                    'key': 'project_id',
                                    'name': 'project_id'
                                }
                            ],
                            'fields': [
                                {
                                    'name': 'storage_size',
                                    'operator': 'sum',
                                    'key': 'data.size'
                                }
                            ]
                        }
                    },
                    'filter': [
                        {
                            'key': 'ref_cloud_service_type.labels',
                            'value': 'Storage',
                            'operator': 'eq'
                        },
                        {
                            'key': 'ref_cloud_service_type.is_major',
                            'value': true,
                            'operator': 'eq'
                        }
                    ]
                }
            }
        ],
        'fill_na': {
            'server_count': 0,
            'database_count': 0,
            'storage_size': 0
        },
        'formulas': [
            {
                'formula': 'resource_count = server_count + database_count'
            },
            {
                'formula': 'resource_count > 0',
                'operator': 'QUERY'
            }
        ]
    };
};

const makeRequest = (params) => {
    let requestParams = getDefaultQuery();
    return requestParams;
};

const topProject = async (params) => {
    let statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    let response = await statisticsV1.Resource.stat(requestParams);

    return response;
};

export default topProject;
