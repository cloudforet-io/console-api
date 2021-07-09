import grpcClient from '@lib/grpc-client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

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
                                            'key': 'urgency',
                                            'name': 'urgency'
                                        },
                                        {
                                            'key': 'created_at',
                                            'name': 'date',
                                            'date_format': '%Y-%m-%d'
                                        }
                                    ],
                                    'fields': [
                                        {
                                            'name': 'has_alert',
                                            'key': 'urgency',
                                            'operator': 'size'
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
                'sort': {
                    'key': 'date'
                }
            }
        ]
    };
};

const makeRequest = (params) => {
    if (!params.project_id) {
        throw new Error('Required Parameter. (key = project_id)');
    }

    if (!params.period) {
        throw new Error('Required Parameter. (key = period)');
    }

    const requestParams = getDefaultQuery();

    // @ts-ignore
    requestParams.aggregate[0].query.query.filter.push({
        k: 'project_id',
        v: params.project_id,
        o: 'eq'
    });

    if (params.period.includes('d')) {
        // @ts-ignore
        requestParams.aggregate[0].query.query.aggregate[0].group.keys[1].date_format = '%Y-%m-%d';
        // @ts-ignore
        requestParams.aggregate[0].query.query.filter.push({
            k: 'created_at',
            v: `now/d-${params.period}`,
            o: 'timediff_gte'
        });
    } else {
        // @ts-ignore
        requestParams.aggregate[0].query.query.aggregate[0].group.keys[1].date_format = '%Y-%m-%d %H';

        const now = dayjs.utc();
        const hour = parseInt(params.period.match(/\d+/)[0]);

        // @ts-ignore
        requestParams.aggregate[0].query.query.filter.push({
            k: 'created_at',
            v: now.subtract(hour, 'hours').toISOString(),
            o: 'datetime_gte'
        });
        // @ts-ignore
        requestParams.aggregate[0].query.query.filter.push({
            'k': 'created_at',
            'v': now.toISOString(),
            'o': 'datetime_lt'
        });
    }

    return requestParams;
};

const top5ProjectActivityMaintenanceDetails = async (params) => {
    const statistics = await grpcClient.get('statistics');
    const requestParams = makeRequest(params);
    return await statistics.Resource.stat(requestParams);
};

export default top5ProjectActivityMaintenanceDetails;

