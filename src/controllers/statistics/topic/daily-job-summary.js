import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const getDefaultQuery = () => {
    return {
        'query': {
            'aggregate': {
                'group': {
                    'keys': [
                        {
                            'key': 'created_at',
                            'name': 'date'
                        }
                    ],
                    'fields': [
                        {
                            'name': 'success',
                            'operator': 'sum',
                            'key': 'values.success_count'
                        },
                        {
                            'name': 'failure',
                            'operator': 'sum',
                            'key': 'values.fail_count'
                        }
                    ]
                }
            },
            'filter': [
                {
                    'k': 'created_at',
                    'v': 'now/d-6d',
                    'o': 'timediff_gt'
                }
            ]
        },
        'topic': 'daily_job_summary'
    };
};

const makeRequest = (params) => {
    let requestParams = getDefaultQuery();

    if (params.start && params.end) {
        requestParams['query']['filter'] = [{
            'k': 'created_at',
            'v': params.start,
            'o': 'datetime_gt'
        }, {
            'k': 'created_at',
            'v': params.end,
            'o': 'datetime_lt'
        }];
    } else {
        requestParams['query']['filter'] = [{
            'k': 'created_at',
            'v': 'now/d-6d',
            'o': 'timediff_gt'
        }];
    }


    return requestParams;
};

const dailyJobSummary = async (params) => {
    let statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    console.log(JSON.stringify(requestParams));
    let response = await statisticsV1.History.stat(requestParams);

    return response;
};

export default dailyJobSummary;
