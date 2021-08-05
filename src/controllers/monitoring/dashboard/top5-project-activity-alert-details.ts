import grpcClient from '@lib/grpc-client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const SUPPORTED_GRANULARITY = ['DAILY', 'HOURLY'];

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
                        'filter': [
                            {
                                key: 'state',
                                value: 'ERROR',
                                operator: 'not'
                            }
                        ] as any
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

    if (params.granularity) {
        if (SUPPORTED_GRANULARITY.indexOf(params.granularity) < 0) {
            throw new Error(`granularity not supported. (support = ${SUPPORTED_GRANULARITY.join(' | ')})`);
        }
    }

    if (!params.start) {
        throw new Error('Required Parameter. (key = start)');
    }

    if (!params.end) {
        throw new Error('Required Parameter. (key = end)');
    }

    const requestParams = getDefaultQuery();

    // @ts-ignore
    requestParams.aggregate[0].query.query.filter.push({
        k: 'project_id',
        v: params.project_id,
        o: 'eq'
    });

    if (params.granularity === 'DAILY') {
        // @ts-ignore
        requestParams.aggregate[0].query.query.aggregate[0].group.keys[1].date_format = '%Y-%m-%d';
    } else {
        // @ts-ignore
        requestParams.aggregate[0].query.query.aggregate[0].group.keys[1].date_format = '%Y-%m-%d %H';
    }
    // @ts-ignore
    requestParams.aggregate[0].query.query.filter.push({
        k: 'created_at',
        v: params.start,
        o: 'datetime_gte'
    });
    // @ts-ignore
    requestParams.aggregate[0].query.query.filter.push({
        k: 'created_at',
        v: params.end,
        o: 'datetime_lt'
    });

    return requestParams;
};

const top5ProjectActivityAlertDetails = async (params) => {
    const statistics = await grpcClient.get('statistics');
    const requestParams = makeRequest(params);
    return await statistics.Resource.stat(requestParams);
};

export default top5ProjectActivityAlertDetails;

