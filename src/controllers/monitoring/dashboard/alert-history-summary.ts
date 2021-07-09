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
                                            'key': 'created_at',
                                            'name': 'date',
                                            'date_format': '%Y-%m'
                                        }
                                    ],
                                    'fields': [
                                        {
                                            'name': 'total_count',
                                            'operator': 'count'
                                        }
                                    ]
                                }
                            }
                        ],
                        'filter': [] as any
                    }
                }
            },
            {
                'join': {
                    'resource_type': 'monitoring.Alert',
                    'keys': [
                        'date'
                    ],
                    'query': {
                        'aggregate': [
                            {
                                'group': {
                                    'keys': [
                                        {
                                            'key': 'created_at',
                                            'name': 'date',
                                            'date_format': '%Y-%m'
                                        }
                                    ],
                                    'fields': [
                                        {
                                            'name': 'resolved_count',
                                            'operator': 'count'
                                        }
                                    ]
                                }
                            }
                        ],
                        'filter': [
                            {
                                'key': 'state',
                                'value': 'RESOLVED',
                                'operator': 'eq'
                            }
                        ] as any
                    }
                }
            },
            {
                'fill_na': {
                    'data': {
                        'total_count': 0,
                        'resolved_count': 0
                    }
                }
            }
        ]
    };
};

const makeRequest = (params) => {
    if (!params.start) {
        throw new Error('Required Parameter. (key = start)');
    }

    if (!params.end) {
        throw new Error('Required Parameter. (key = end)');
    }

    const requestParams = getDefaultQuery();

    // @ts-ignore
    requestParams['aggregate'][0]['query']['query']['filter'].push({
        'k': 'created_at',
        'v': params.start,
        'o': 'datetime_gte'
    });
    // @ts-ignore
    requestParams['aggregate'][0]['query']['query']['filter'].push({
        'k': 'created_at',
        'v': params.end,
        'o': 'datetime_lt'
    });

    // @ts-ignore
    requestParams['aggregate'][1]['join']['query']['filter'].push({
        'k': 'created_at',
        'v': params.start,
        'o': 'datetime_gte'
    });
    // @ts-ignore
    requestParams['aggregate'][1]['join']['query']['filter'].push({
        'k': 'created_at',
        'v': params.end,
        'o': 'datetime_lt'
    });

    return requestParams;
};

const alertHistorySummary = async (params) => {
    const statistics = await grpcClient.get('statistics');
    const requestParams = makeRequest(params);
    return await statistics.Resource.stat(requestParams);
};

export default alertHistorySummary;

