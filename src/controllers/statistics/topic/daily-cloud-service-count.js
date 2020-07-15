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
                    }],
                    'fields': [{
                        'name': 'count',
                        'operator': 'sum',
                        'key': 'values.cloud_service_count'
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
        }, 'topic': 'daily_cloud_service_count'
    };
};

const makeRequest = (params) => {
    let requestParams = getDefaultQuery();

    if (params.project_id) {
        requestParams.query.filter.push({
            k: 'values.project_id',
            v: params.project_id,
            o: 'eq'
        });
    }

    return requestParams;
};

const dailyCloudServiceCount = async (params) => {
    let statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    let response = await statisticsV1.History.stat(requestParams);

    return response;
};

export default dailyCloudServiceCount;
