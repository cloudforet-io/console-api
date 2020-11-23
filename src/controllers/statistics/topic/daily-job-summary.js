import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const getDefaultQuery = () => {
    return {
        'resource_type': 'inventory.Job',
        'query': {
            'aggregate': {
                'group': {
                    'keys': [
                        {
                            'key': 'created_at',
                            'name': 'date',
                            'date_format': '%Y-%m-%d'
                        }
                    ],
                    'fields': [
                        {
                            'name': 'success',
                            'operator': 'count'
                        }
                    ]
                }
            },
            'filter': [
                {
                    'k': 'status',
                    'v': 'SUCCESS',
                    'o': 'eq'
                }
            ]
        },
        'join': [
            {
                'resource_type': 'inventory.Job',
                'type': 'OUTER',
                'keys': ['date'],
                'query': {
                    'aggregate': {
                        'group': {
                            'keys': [
                                {
                                    'key': 'created_at',
                                    'name': 'date',
                                    'date_format': '%Y-%m-%d'
                                }
                            ],
                            'fields': [
                                {
                                    'name': 'failure',
                                    'operator': 'count'
                                }
                            ]
                        }
                    },
                    'filter': [
                        {
                            'k': 'status',
                            'v': ['ERROR', 'CANCELED', 'TIMEOUT'],
                            'o': 'in'
                        }
                    ]
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

    let requestParams = getDefaultQuery();

    requestParams['query']['filter'].push({
        'k': 'created_at',
        'v': params.start,
        'o': 'datetime_gte'
    });
    requestParams['query']['filter'].push({
        'k': 'created_at',
        'v': params.end,
        'o': 'datetime_lte'
    });

    requestParams['join'][0]['query']['filter'].push({
        'k': 'created_at',
        'v': params.start,
        'o': 'datetime_gte'
    });
    requestParams['join'][0]['query']['filter'].push({
        'k': 'created_at',
        'v': params.end,
        'o': 'datetime_lte'
    });

    return requestParams;
};

const dailyJobSummary = async (params) => {
    let statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);

    let response = await statisticsV1.Resource.stat(requestParams);
    return response;
};

export default dailyJobSummary;
