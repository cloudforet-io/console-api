import grpcClient from '@lib/grpc-client';
import dayjs from 'dayjs';

const getDefaultQuery = () => {
    return {
        'aggregate': [
            {
                'query': {
                    'resource_type': 'monitoring.ProjectAlertConfig',
                    'query': {
                        'aggregate': [
                            {
                                'group': {
                                    'keys': [
                                        {
                                            'key': 'project_id',
                                            'name': 'project_id'
                                        }
                                    ]
                                }
                            }
                        ]
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
                                        },
                                        {
                                            'key': 'created_at',
                                            'name': 'date',
                                            'date_format': '%Y-%m-%d %H'
                                        }
                                    ],
                                    'fields': [
                                        {
                                            'name': 'has_alert',
                                            'key': 'project_id',
                                            'operator': 'size'
                                        },
                                        {
                                            'name': 'alert_count',
                                            'operator': 'count'
                                        }
                                    ]
                                }
                            },
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
                                            'name': 'score',
                                            'key': 'has_alert',
                                            'operator': 'sum'
                                        },
                                        {
                                            'name': 'alert_count',
                                            'key': 'alert_count',
                                            'operator': 'sum'
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
                'fill_na': {
                    'data': {
                        'alert_count': 0,
                        'score': 0
                    }
                }
            },
            {
                'sort': {
                    'key': 'score',
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
    if (!params.period) {
        throw new Error('Required Parameter. (key = period)');
    }

    const requestParams = getDefaultQuery();

    if (params.period.includes('d')) {
        // @ts-ignore
        requestParams.aggregate[1].join.query.aggregate[0].group.keys[1].date_format = '%Y-%m-%d';
        // @ts-ignore
        requestParams.aggregate[1].join.query.filter.push({
            k: 'created_at',
            v: `now/d-${params.period}`,
            o: 'timediff_gte'
        });
    } else {
        // @ts-ignore
        requestParams.aggregate[1].join.query.aggregate[0].group.keys[1].date_format = '%Y-%m-%d %H';

        const now = dayjs.utc();
        const hour = parseInt(params.period.match(/\d+/)[0]);

        // @ts-ignore
        requestParams.aggregate[1].join.query.filter.push({
            k: 'created_at',
            v: now.subtract(hour, 'hours').toISOString(),
            o: 'datetime_gte'
        });
        // @ts-ignore
        requestParams.aggregate[1].join.query.filter.push({
            'k': 'created_at',
            'v': now.toISOString(),
            'o': 'datetime_lt'
        });
    }

    return requestParams;
};

const top5ProjectActivityList = async (params) => {
    const statistics = await grpcClient.get('statistics');
    const requestParams = makeRequest(params);
    return await statistics.Resource.stat(requestParams);
};

export default top5ProjectActivityList;

