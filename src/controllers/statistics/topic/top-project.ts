import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
import { requestCache } from './request-cache';

const getDefaultQuery = () => {
    return {
        'aggregate': [
            {
                'query': {
                    'resource_type': 'identity.Project',
                    'query': {
                        'aggregate': [{
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
                                        'key': 'project_group_id',
                                        'name': 'project_group_id'
                                    }
                                ],
                                'fields': []
                            }
                        }]
                    }
                }
            },
            {
                'join': {
                    'resource_type': 'identity.ProjectGroup',
                    'keys': [
                        'project_group_id'
                    ],
                    'query': {
                        'aggregate': [{
                            'group': {
                                'keys': [
                                    {
                                        'key': 'project_group_id',
                                        'name': 'project_group_id'
                                    },
                                    {
                                        'key': 'name',
                                        'name': 'project_group'
                                    }
                                ],
                                'fields': []
                            }
                        }]
                    }
                }
            },
            {
                'join': {
                    'resource_type': 'inventory.Server',
                    'keys': [
                        'project_id'
                    ],
                    'query': {
                        'aggregate': [{
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
                        }]
                    }
                }
            },
            {
                'join': {
                    'resource_type': 'inventory.CloudService',
                    'keys': [
                        'project_id'
                    ],
                    'query': {
                        'aggregate': [{
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
                        }],
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
                }
            },
            {
                'join': {
                    'resource_type': 'inventory.CloudService',
                    'keys': [
                        'project_id'
                    ],
                    'query': {
                        'aggregate': [{
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
                        }],
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
            },
            {
                'fill_na': {
                    'data': {
                        'server_count': 0,
                        'database_count': 0,
                        'storage_size': 0
                    }
                }
            },
            {
                'formula': {
                    'eval': 'resource_count = server_count + database_count'
                }
            },
            {
                'formula': {
                    'query': 'resource_count > 0'
                }
            },
            {
                'sort': {
                    'key': 'resource_count',
                    'desc': true
                }
            }
        ],
        'page': {
            'limit': 5
        }
    };
};

const makeRequest = (params) => {
    const requestParams = getDefaultQuery();
    return requestParams;
};

const requestStat = async (params) => {
    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    const response = await statisticsV1.Resource.stat(requestParams);

    return response;
};

const topProject = async (params) => {
    return await requestCache('stat:topProject', params, requestStat);
};

export default topProject;
