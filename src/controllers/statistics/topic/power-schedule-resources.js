import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
import httpContext from 'express-http-context';
import { listSchedules } from '@controllers/power-scheduler/schedule';
import { PowerSchedulerResourcesFactory } from '@factories/statistics/topic/power-scheduler-resources';

const PROVIDER = ['aws'];
const CLOUD_SERVICE_GROUP = ['RDS', 'AutoScaling'];
const CLOUD_SERVICE_TYPE = ['Database', 'AutoScalingGroup'];

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
            'filter': []
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
                    'filter': []
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
                            'key': 'provider',
                            'value': PROVIDER,
                            'operator': 'in'
                        },
                        {
                            'key': 'cloud_service_group',
                            'value': CLOUD_SERVICE_GROUP,
                            'operator': 'in'
                        },
                        {
                            'key': 'cloud_service_type',
                            'value': CLOUD_SERVICE_TYPE,
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
                                    'name': 'server_managed_count',
                                    'operator': 'count'
                                }
                            ]
                        }
                    },
                    'filter': []
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
                                    'name': 'cloud_service_managed_count',
                                    'operator': 'count'
                                }
                            ]
                        }
                    },
                    'filter': []
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
                'formula': 'cloud_service_managed_count + server_managed_count',
                'name': 'managed_count'
            }
        ]
    };
};

const makeRequest = (params) => {
    let requestParams = getDefaultQuery();
    requestParams['query']['filter'].push({
        k: 'project_id',
        v: params.projects,
        o: 'in'
    });

    [...Array(4).keys()].forEach((i) => {
        requestParams['join'][i]['query']['filter'].push({
            k: 'project_id',
            v: params.projects,
            o: 'in'
        });
    });

    requestParams['join'][2]['query']['filter'].push({
        k: 'resource_group_id',
        v: params.resource_groups,
        o: 'in'
    });

    requestParams['join'][3]['query']['filter'].push({
        k: 'resource_group_id',
        v: params.resource_groups,
        o: 'in'
    });

    return requestParams;
};

const getResourceGroupIds = async (projectIds) => {
    const response = await listSchedules({
        query: {
            filter: [{
                k: 'project_id',
                v: projectIds,
                o: 'in'
            }],
            only: ['resource_groups']
        }
    });

    const resourceGroupIds = response.results.map((scheduleInfo) => {
        return scheduleInfo.resource_groups.map((resourceGroup) => {
            return resourceGroup.resource_group_id;
        });
    });

    return resourceGroupIds.flat();
};

const makeResponse = (results) => {
    const response = {};

    results.forEach((item) => {
        response[item.project_id] = {
            managed_count: item.managed_count,
            total_count: item.total_count
        };
    });

    return response;
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

    return {
        projects: makeResponse(response.results || [])
    };
};

export default powerSchedulerResources;
