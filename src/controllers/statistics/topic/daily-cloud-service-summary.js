import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const getDefaultQuery = () => {
    return {
        'query': {
            'aggregate': {
                'group': {
                    'keys': [{
                        'key': 'created_at',
                        'name': 'date',
                        'date_format': '%Y-%m-%d'
                    }],
                    'fields': [{
                        'name': 'value',
                        'operator': 'last',
                        'key': 'values.value'
                    }]
                }
            },
            'filter': [],
            'sort': {
                'name': 'date'
            }
        },
        'topic': 'daily_cloud_service_summary'
    };
};

const makeRequest = (params) => {
    let requestParams = getDefaultQuery();

    if (params.project_id) {
        requestParams.topic = 'daily_cloud_service_summary_by_project';
        requestParams.query.filter.push({
            k: 'values.project_id',
            v: params.project_id,
            o: 'eq'
        });
    }

    if (params.label) {
        requestParams.query.filter.push({
            k: 'values.label',
            v: params.label,
            o: 'eq'
        });
    }

    if (params.aggregate === 'monthly') {
        requestParams.query.filter.push({
            'k': 'created_at',
            'v': 'now/d-365d',
            'o': 'timediff_gt'
        });
        requestParams.query.aggregate.group.keys = [{
            'key': 'created_at',
            'name': 'date',
            'date_format': '%Y-%m'
        }];
    } else {
        requestParams.query.filter.push({
            'k': 'created_at',
            'v': 'now/d-14d',
            'o': 'timediff_gt'
        });
        requestParams.query.aggregate.group.keys = [{
            'key': 'created_at',
            'name': 'date',
            'date_format': '%Y-%m-%d'
        }];
    }

    return requestParams;
};

const dailyCloudServiceSummary = async (params) => {
    let statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    let response = await statisticsV1.History.stat(requestParams);

    return response;
};

export default dailyCloudServiceSummary;
