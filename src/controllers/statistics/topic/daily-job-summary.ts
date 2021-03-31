import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const getDefaultQuery = () => {
    return {
        'aggregate': [
            {
                'query': {
                    'resource_type': 'inventory.Job',
                    'query': {
                        'aggregate': [{
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
                        }],
                        'filter': [
                            {
                                'k': 'status',
                                'v': 'SUCCESS',
                                'o': 'eq'
                            }
                        ]
                    }
                }
            },
            {
                'join': {
                    'resource_type': 'inventory.Job',
                    'type': 'OUTER',
                    'keys': ['date'],
                    'query': {
                        'aggregate': [{
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
                        }],
                        'filter': [
                            {
                                'k': 'status',
                                'v': ['ERROR', 'CANCELED', 'TIMEOUT'],
                                'o': 'in'
                            }
                        ]
                    }
                }
            },
            {
                'fill_na': {
                    'data': {
                        'success': 0,
                        'failure': 0
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
        'o': 'datetime_lte'
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
        'o': 'datetime_lte'
    });

    return requestParams;
};

const dailyJobSummary = async (params) => {
    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);

    const response = await statisticsV1.Resource.stat(requestParams);
    return response;
};

export default dailyJobSummary;
