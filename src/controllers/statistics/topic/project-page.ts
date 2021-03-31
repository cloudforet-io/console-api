import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
import { Filter } from '@lib/config/type';

const getDefaultQuery = () => {
    return {
        'aggregate': [
            {
                'query': {
                    'query': {
                        'aggregate': [{
                            'group': {
                                'keys': [
                                    {
                                        'key': 'project_id',
                                        'name': 'project_id'
                                    }
                                ],
                                'fields': []
                            }
                        }],
                        'filter': [] as Filter[]
                    },
                    'resource_type': 'identity.Project'
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
                                        'name': 'cloud_service_count',
                                        'operator': 'count'
                                    }
                                ]
                            }
                        }],
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
                    }
                }
            },
            {
                'join': {
                    'resource_type': 'identity.ServiceAccount',
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
                                        'key': 'provider',
                                        'name': 'provider',
                                        'operator': 'add_to_set'
                                    }
                                ]
                            }
                        }]
                    }
                }
            },
            {
                'fill_na': {
                    'data': {
                        'server_count': 0,
                        'cloud_service_count': 0
                    }
                }
            }
        ]
    };
};

const makeRequest = (params) => {
    const requestParams = getDefaultQuery();
    // @ts-ignore
    requestParams['aggregate'][0]['query']['query']['filter'].push({
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

    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    const response = await statisticsV1.Resource.stat(requestParams);

    return response;
};

export default projectPage;
