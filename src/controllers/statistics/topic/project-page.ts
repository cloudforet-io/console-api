import grpcClient from '@lib/grpc-client';
import { Filter } from '@lib/grpc-client/type';

const getDefaultQuery = () => {
    return {
        aggregate: [
            {
                query: {
                    query: {
                        aggregate: [{
                            group: {
                                keys: [
                                    {
                                        key: 'project_id',
                                        name: 'project_id'
                                    }
                                ],
                                fields: []
                            }
                        }],
                        filter: [] as Filter[]
                    },
                    resource_type: 'identity.Project'
                }
            },
            {
                join: {
                    resource_type: 'inventory.Server',
                    keys: [
                        'project_id'
                    ],
                    query: {
                        aggregate: [{
                            group: {
                                keys: [
                                    {
                                        key: 'project_id',
                                        name: 'project_id'
                                    }
                                ],
                                fields: [
                                    {
                                        name: 'server_count',
                                        operator: 'count'
                                    }
                                ]
                            }
                        }],
                        filter: [] as Filter[]
                    }
                }
            },
            {
                join: {
                    resource_type: 'inventory.CloudService',
                    keys: [
                        'project_id'
                    ],
                    query: {
                        aggregate: [{
                            group: {
                                keys: [
                                    {
                                        key: 'project_id',
                                        name: 'project_id'
                                    }
                                ],
                                fields: [
                                    {
                                        name: 'cloud_service_count',
                                        operator: 'count'
                                    }
                                ]
                            }
                        }],
                        filter: [
                            {
                                key: 'ref_cloud_service_type.is_major',
                                value: true,
                                operator: 'eq'
                            },
                            {
                                key: 'ref_cloud_service_type.is_primary',
                                value: true,
                                operator: 'eq'
                            }
                        ]
                    }
                }
            },
            {
                join: {
                    resource_type: 'identity.ServiceAccount',
                    keys: [
                        'project_id'
                    ],
                    query: {
                        aggregate: [{
                            group: {
                                keys: [
                                    {
                                        key: 'project_id',
                                        name: 'project_id'
                                    }
                                ],
                                fields: [
                                    {
                                        key: 'provider',
                                        name: 'provider',
                                        operator: 'add_to_set'
                                    }
                                ]
                            }
                        }],
                        filter: [] as Filter[]
                    }
                }
            },
            {
                fill_na: {
                    data: {
                        server_count: 0,
                        cloud_service_count: 0
                    }
                }
            }
        ]
    };
};

const makeRequest = (params) => {
    const requestParams: any = getDefaultQuery();
    requestParams['aggregate'][0]['query']['query']['filter'].push({
        k: 'project_id',
        v: params.projects,
        o: 'in'
    });

    requestParams['aggregate'][1]['join']['query']['filter'].push({
        k: 'project_id',
        v: params.projects,
        o: 'in'
    });

    requestParams['aggregate'][2]['join']['query']['filter'].push({
        k: 'project_id',
        v: params.projects,
        o: 'in'
    });

    requestParams['aggregate'][3]['join']['query']['filter'].push({
        k: 'project_id',
        v: params.projects,
        o: 'in'
    });

    if (params.domain_id) {
        requestParams['domain_id'] = params.domain_id;
    }

    return requestParams;
};

const projectPage = async (params) => {
    if (!params.projects) {
        throw new Error('Required Parameter. (key = projects)');
    }

    if (params.projects.length === 0) {
        return {
            results: [],
            total_count: 0
        };
    }
    else
    {
        const statisticsV1 = await grpcClient.get('statistics', 'v1');
        const requestParams = makeRequest(params);
        const response = await statisticsV1.Resource.stat(requestParams);

        return response;
    }
};

export default projectPage;
