import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const SUPPORTED_LABELS = ['Compute', 'Container', 'Database', 'Networking', 'Storage', 'Security', 'Analytics'];
const SUPPORTED_AGGREGATE = ['daily', 'monthly'];
const SUPPORTED_GRANULARITY = ['DAILY', 'MONTHLY'];

const getDefaultQuery = () => {
    return {
        'query': {
            'aggregate': [
                {
                    'group': {
                        'keys': [{
                            'key': 'created_at',
                            'name': 'created_at'
                        }],
                        'fields': [{
                            'name': 'value',
                            'operator': 'sum',
                            'key': 'values.value'
                        }]
                    }
                },
                {
                    'sort': {
                        'key': 'created_at'
                    }
                },
                {
                    'group': {
                        'keys': [],
                        'fields': [{
                            'name': 'total',
                            'operator': 'last',
                            'key': 'value'
                        }]
                    }
                },
                {
                    'sort': {
                        'key': 'date'
                    }
                }
            ],
            'filter': []
        },
        'topic': 'daily_cloud_service_summary'
    };
};

const makeRequest = (params) => {
    if (params.label && SUPPORTED_LABELS.indexOf(params.label) < 0) {
        throw new Error(`label not supported. (support = ${SUPPORTED_LABELS.join(' | ')})`);
    }

    if (params.aggregate && SUPPORTED_AGGREGATE.indexOf(params.aggregate) < 0) {
        throw new Error(`aggregate not supported. (support = ${SUPPORTED_AGGREGATE.join(' | ')})`);
    }

    if (params.granularity && SUPPORTED_GRANULARITY.indexOf(params.granularity) < 0) {
        throw new Error(`granularity not supported. (support = ${SUPPORTED_GRANULARITY.join(' | ')})`);
    }

    let requestParams = getDefaultQuery();

    if (params.project_id) {
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
    } else {
        requestParams.query.filter.push({
            k: 'values.label',
            v: 'All',
            o: 'eq'
        });
    }

    if (params.aggregate === 'monthly' || params.granularity === 'MONTHLY') {
        requestParams.query.filter.push({
            'k': 'created_at',
            'v': 'now/d-365d',
            'o': 'timediff_gt'
        });
        requestParams.query.aggregate[2].group.keys = [{
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
        requestParams.query.aggregate[2].group.keys = [{
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
