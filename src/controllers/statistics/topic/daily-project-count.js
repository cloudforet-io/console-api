import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const getDefaultQuery = () => {
    return {
        'query': {
            'aggregate': {
                'group': {
                    'keys': [{
                        'key': 'created_at',
                        'name': 'date'
                    }]
                }
            },
            'filter': [{
                'k': 'created_at',
                'v': 'now/d-30d',
                'o': 'timediff_gt'
            }],
            'sort': {
                'name': 'date'
            }
        }, 'topic': 'daily_project_count'
    };
};

const makeRequest = (params) => {
    let requestParams = getDefaultQuery();
    return requestParams;
};

const dailyProjectCount = async (params) => {
    let statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    let response = await statisticsV1.History.stat(requestParams);

    return response;
};

export default dailyProjectCount;
