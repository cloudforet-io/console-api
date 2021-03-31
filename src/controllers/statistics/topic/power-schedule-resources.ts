//@ts-nocheck
import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
import httpContext from 'express-http-context';
import { listSchedules } from '@controllers/power-scheduler/schedule';
import { PowerSchedulerResourcesFactory } from '@factories/statistics/topic/power-scheduler-resources';

const SUPPORTED_RESOURCE_TYPE = [
    '.aws.EC2.Instance',
    '.aws.EC2.AutoScalingGroup',
    '.aws.RDS.Database',
    '.google_cloud.ComputeEngine.Instance',
    '.google_cloud.ComputeEngine.InstanceGroup',
    '.google_cloud.CloudSQL.Instance'
];

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
                                        'name': 'project_id',
                                        'key': 'project_id'
                                    }
                                ],
                                'fields': []
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
                        'project_id'
                    ],
                    'query': {
                        'aggregate': [{
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
                        }],
                        'filter': []
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
                        }],
                        'filter': []
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
                        }],
                        'filter': []
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
                        }],
                        'filter': []
                    }
                }
            },
            {
                'fill_na': {
                    'data': {
                        'server_total_count': 0,
                        'server_managed_count': 0,
                        'cloud_service_total_count': 0,
                        'cloud_service_managed_count': 0
                    }
                }
            },
            {
                'formula': {
                    'eval': 'total_count = cloud_service_total_count + server_total_count'
                }
            },
            {
                'formula': {
                    'eval': 'managed_count = cloud_service_managed_count + server_managed_count'
                }
            }
        ]
    };
};

const makeRequest = (params) => {
    let requestParams = getDefaultQuery();

    const refCloudServiceTypes = SUPPORTED_RESOURCE_TYPE.map((resourceType) => {
        return  httpContext.get('domain_id') + resourceType;
    });

    requestParams['aggregate'][0]['query']['query']['filter'].push({
        k: 'project_id',
        v: params.projects,
        o: 'in'
    });

    [...Array(4).keys()].forEach((i) => {
        requestParams['aggregate'][i+1]['join']['query']['filter'].push({
            k: 'project_id',
            v: params.projects,
            o: 'in'
        });

        requestParams['aggregate'][i+1]['join']['query']['filter'].push({
            k: 'ref_cloud_service_type',
            v: refCloudServiceTypes,
            o: 'in'
        });
    });

    requestParams['aggregate'][3]['join']['query']['filter'].push({
        k: 'resource_group_id',
        v: params.resource_groups,
        o: 'in'
    });

    requestParams['aggregate'][4]['join']['query']['filter'].push({
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
