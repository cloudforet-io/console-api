import grpcClient from '@lib/grpc-client';

const getDefaultQuery = () => {
    return {
        'aggregate': [
            {
                'query': {
                    'resource_type': 'monitoring.Alert',
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
            }
        ]
    };
};

const makeRequest = (params) => {
    const requestParams = getDefaultQuery();

    if (params.activated_projects) {
        // @ts-ignore
        requestParams.aggregate[0].query.query.filter.push({
            k: 'project_id',
            v: params.activated_projects,
            o: 'in'
        });
    }

    return requestParams;
};

const alertByProject = async (params) => {
    const statistics = await grpcClient.get('statistics');
    const requestParams = makeRequest(params);
    return await statistics.Resource.stat(requestParams);
};

export default alertByProject;

