import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
import httpContext from 'express-http-context';
import { listResourceGroups } from '@controllers/inventory/resource-group';
import { PowerSchedulerResourcesFactory } from '@factories/statistics/topic/power-scheduler-resources';

const getDefaultQuery = () => {
    return {
        'resource_type': 'identity.Project',
        'query': {
            'aggregate': {
                'group': {
                    'keys': [
                        {
                            'name': 'project_id',
                            'key': 'project_id'
                        }
                    ],
                    'fields': []
                }
            },
            'filter': [
                {
                    'key': 'project_id',
                    'value': [
                        'project-18655561c535'
                    ],
                    'operator': 'in'
                }
            ]
        },
        'join': [
            {
                'query': {
                    'aggregate': {
                        'group': {
                            'keys': [
                                {
                                    'name': 'project_id',
                                    'key': 'project_id'
                                }
                            ],
                            'fields': [
                                {
                                    'name': 'server_total_count',
                                    'operator': 'count'
                                }
                            ]
                        }
                    },
                    'filter': [
                        {
                            'key': 'project_id',
                            'value': [
                                'project-18655561c535'
                            ],
                            'operator': 'in'
                        }
                    ]
                },
                'resource_type': 'inventory.Server',
                'keys': [
                    'project_id'
                ]
            },
            {
                'query': {
                    'aggregate': {
                        'group': {
                            'keys': [
                                {
                                    'name': 'project_id',
                                    'key': 'project_id'
                                }
                            ],
                            'fields': [
                                {
                                    'name': 'cloud_service_total_count',
                                    'operator': 'count'
                                }
                            ]
                        }
                    },
                    'filter': [
                        {
                            'key': 'project_id',
                            'value': [
                                'project-18655561c535'
                            ],
                            'operator': 'in'
                        },
                        {
                            'key': 'provider',
                            'value': [
                                'aws'
                            ],
                            'operator': 'in'
                        },
                        {
                            'key': 'cloud_service_type',
                            'value': [
                                'Database',
                                'AutoScalingGroup'
                            ],
                            'operator': 'in'
                        },
                        {
                            'key': 'cloud_service_group',
                            'value': [
                                'RDS',
                                'AutoScaliing'
                            ],
                            'operator': 'in'
                        }
                    ]
                },
                'resource_type': 'inventory.CloudService',
                'keys': [
                    'project_id'
                ]
            },
            {
                'query': {
                    'aggregate': {
                        'group': {
                            'keys': [
                                {
                                    'name': 'project_id',
                                    'key': 'project_id'
                                }
                            ],
                            'fields': [
                                {
                                    'name': 'server_used_count',
                                    'operator': 'count'
                                }
                            ]
                        }
                    },
                    'filter': [
                        {
                            'key': 'project_id',
                            'value': [
                                'project-18655561c535'
                            ],
                            'operator': 'in'
                        },
                        {
                            'key': 'resource_group_id',
                            'value': [
                                'rsc-grp-cbb10e8c7c2d',
                                'rsc-grp-69d63c787e76'
                            ],
                            'operator': 'in'
                        }
                    ]
                },
                'resource_type': 'inventory.Server',
                'keys': [
                    'project_id'
                ]
            },
            {
                'query': {
                    'aggregate': {
                        'group': {
                            'keys': [
                                {
                                    'name': 'project_id',
                                    'key': 'project_id'
                                }
                            ],
                            'fields': [
                                {
                                    'name': 'cloud_service_used_count',
                                    'operator': 'count'
                                }
                            ]
                        }
                    },
                    'filter': [
                        {
                            'key': 'project_id',
                            'value': [
                                'project-18655561c535'
                            ],
                            'operator': 'in'
                        },
                        {
                            'key': 'resource_group_id',
                            'value': [
                                'rsc-grp-cbb10e8c7c2d',
                                'rsc-grp-69d63c787e76'
                            ],
                            'operator': 'in'
                        }
                    ]
                },
                'resource_type': 'inventory.CloudService',
                'keys': [
                    'project_id'
                ]
            }
        ],
        'formulas': [
            {
                'formula': 'cloud_service_total_count + server_total_count',
                'name': 'total_count'
            },
            {
                'formula': 'cloud_service_used_count + server_used_count',
                'name': 'used_count'
            }
        ]
    };
};

const makeRequest = (params) => {
    let requestParams = getDefaultQuery();
    // requestParams['query']['filter'].push({
    //     k: 'project_id',
    //     v: params.projects,
    //     o: 'in'
    // });

    return requestParams;
};

const getResourceGroupIds = async (projectIds) => {
    const response = await listResourceGroups({
        query: {
            filter: [{
                k: 'project_id',
                v: projectIds,
                o: 'in'
            }],
            only: ['resource_group_id']
        }
    });

    const resourceGroupInfos = response.results || [];
    return resourceGroupInfos.map((resourceGroupInfo) => {
        return resourceGroupInfo.resource_group_id;
    });
};

const powerSchedulerResources = async (params) => {
    if (!params.projects) {
        throw new Error('Required Parameter. (key = projects)');
    }

    if (httpContext.get('mock_mode')) {
        return new PowerSchedulerResourcesFactory(params.projects);
    }

    params['resource_groups'] = await getResourceGroupIds(params.projects);

    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    const response = await statisticsV1.Resource.stat(requestParams);

    return response;
};

export default powerSchedulerResources;
