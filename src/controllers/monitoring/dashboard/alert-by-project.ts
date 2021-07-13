import grpcClient from '@lib/grpc-client';

const getDefaultQuery = () => {
    return {
        'aggregate': [
            {
                'query': {
                    'resource_type': 'identity.Project',
                    'query': {
                        'aggregate': [
                            {
                                'group': {
                                    'keys': [
                                        {
                                            'key': 'project_id',
                                            'name': 'project_id'
                                        },
                                        {
                                            'key': 'name',
                                            'name': 'project_name'
                                        }
                                    ]
                                }
                            }
                        ],
                        'filter': [] as any,
                        'keyword': ''
                    }
                }
            },
            {
                'join': {
                    'resource_type': 'monitoring.Alert',
                    'keys': [
                        'project_id'
                    ],
                    'query': {
                        'aggregate': [
                            {
                                'group': {
                                    'keys': [
                                        {
                                            'key': 'project_id',
                                            'name': 'project_id'
                                        }
                                    ],
                                    'fields': [
                                        {
                                            'name': 'alert_count',
                                            'operator': 'count'
                                        }
                                    ]
                                }
                            }
                        ],
                        'filter': [
                            {
                                'key': 'state',
                                'value': [
                                    'TRIGGERED',
                                    'ACKNOWLEDGED'
                                ],
                                'operator': 'in'
                            }
                        ] as any
                    }
                }
            },
            {
                'join': {
                    'resource_type': 'monitoring.MaintenanceWindow',
                    'keys': [
                        'project_id'
                    ],
                    'query': {
                        'aggregate': [
                            {
                                'unwind': {
                                    'path': 'projects'
                                }
                            },
                            {
                                'group': {
                                    'keys': [
                                        {
                                            'key': 'projects',
                                            'name': 'project_id'
                                        }
                                    ],
                                    'fields': [
                                        {
                                            'name': 'maintenance_window_count',
                                            'operator': 'count'
                                        }
                                    ]
                                }
                            }
                        ],
                        'filter': [
                            {
                                'key': 'state',
                                'value': 'OPEN',
                                'operator': 'eq'
                            }
                        ]
                    }
                }
            },
            {
                'fill_na': {
                    'data': {
                        'alert_count': 0,
                        'maintenance_window_count': 0
                    }
                }
            },
            {
                'sort': {
                    'key': 'alert_count',
                    'desc': true
                }
            },
            {
                'formula': {
                    'eval': 'total_count = alert_count + maintenance_window_count'
                }
            },
            {
                'formula': {
                    'query': 'total_count > 0'
                }
            }
        ],
        'page': {
            'start': 1,
            'limit': 12
        }
    };
};

const makeRequest = (params) => {
    const requestParams = getDefaultQuery();

    // @ts-ignore
    requestParams.page = params.query.page;

    if (params.activated_projects) {
        // @ts-ignore
        requestParams.aggregate[0].query.query.filter.push({
            k: 'project_id',
            v: params.activated_projects,
            o: 'in'
        });
    }

    if (params.query?.filter) {
        // @ts-ignore
        requestParams.aggregate[0].query.query.filter.push(...params.query.filter);
    }

    if (params.query?.keyword) {
        // @ts-ignore
        requestParams.aggregate[0].query.query.keyword = params.query.keyword;
    }

    return requestParams;
};

const alertByProject = async (params) => {
    const statistics = await grpcClient.get('statistics');
    const requestParams = makeRequest(params);
    return await statistics.Resource.stat(requestParams);
};

export default alertByProject;

