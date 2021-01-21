import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const getDefaultQuery = () => {
    return {
        'query': {
            'aggregate': {
                'group': {
                    'keys': [
                        {
                            'key': 'project_id',
                            'name': 'project_id'
                        }
                    ],
                    'fields': []
                }
            },
            'filter': []
        },
        'resource_type': 'identity.Project',
        'join': [
            {
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
                },
                'keys': [
                    'project_id'
                ],
                'resource_type': 'inventory.Server'
            },
            {
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
                                    'name': 'cloud_service_count',
                                    'operator': 'count'
                                }
                            ]
                        }
                    },
                    'filter': [
                        {
                            'key': 'ref_cloud_service_type.is_major',
                            'value': true,
                            'operator': 'eq'
                        },
                        {
                            'key': 'ref_cloud_service_type.is_primary',
                            'value': true,
                            'operator': 'eq'
                        }
                    ]
                },
                'keys': [
                    'project_id'
                ],
                'resource_type': 'inventory.CloudService'
            },
            {
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
                                    'key': 'provider',
                                    'name': 'provider',
                                    'operator': 'add_to_set'
                                }
                            ]
                        }
                    }
                },
                'keys': [
                    'project_id'
                ],
                'resource_type': 'identity.ServiceAccount'
            }
        ],
        'fill_na': {
            'server_count': 0,
            'cloud_service_count': 0
        }
    };
};

const makeRequest = (params) => {
    let requestParams = getDefaultQuery();
    requestParams['query']['filter'].push({
        k: 'project_id',
        v: params.projects,
        o: 'in'
    });

    return requestParams;
};

const projectPage = async (params) => {
    if (!params.projects) {
        throw new Error('Required Parameter. (key = projects)');
    }

    let statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    let response = await statisticsV1.Resource.stat(requestParams);

    return response;
};

export default projectPage;
