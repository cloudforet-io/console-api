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
                        ]
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
        ],
        'page': {
            'limit': 5
        }
    };
};

const alertByProject = async () => {
    const statistics = await grpcClient.get('statistics');
    const requestParams = getDefaultQuery();
    return await statistics.Resource.stat(requestParams);
};

export default alertByProject;

