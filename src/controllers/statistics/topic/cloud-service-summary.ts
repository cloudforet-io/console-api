import grpcClient from '@lib/grpc-client';
import { requestCache } from './request-cache';

const SUPPORTED_LABELS = ['Compute', 'Container', 'Database', 'Networking', 'Storage', 'Security', 'Analytics', 'All'];

const getStatQuery = (label, projectId, aggregation) => {
    let statQuery;
    if (label === 'Compute') {
        statQuery = {
            'resource_type': 'inventory.Server',
            'query': {
                'aggregate': [{
                    'group': {
                        'fields': [
                            {
                                'name': 'total',
                                'operator': 'count'
                            }
                        ]
                    }
                }],
                'filter': [
                    {
                        'key': 'ref_cloud_service_type.is_primary',
                        'operator': 'eq',
                        'value': true
                    }
                ]
            },
            'extend_data': {
                'label': label
            }
        };
    } else if (label === 'Storage') {
        statQuery = {
            'resource_type': 'inventory.CloudService',
            'query': {
                'aggregate': [{
                    'group': {
                        'fields': [
                            {
                                'key': 'data.size',
                                'name': 'total',
                                'operator': 'sum'
                            }
                        ]
                    }
                }],
                'filter': [
                    {
                        'key': 'ref_cloud_service_type.is_major',
                        'operator': 'eq',
                        'value': true
                    },
                    {
                        'key': 'ref_cloud_service_type.labels',
                        'operator': 'eq',
                        'value': label
                    }
                ]
            },
            'extend_data': {
                'label': label
            }
        };
    } else if (label === 'All') {
        statQuery = {
            'resource_type': 'inventory.CloudService',
            'query': {
                'aggregate': [{
                    'group': {
                        'fields': [
                            {
                                'name': 'total',
                                'operator': 'count'
                            }
                        ]
                    }
                }],
                'filter': [
                    {
                        'key': 'ref_cloud_service_type.is_primary',
                        'operator': 'eq',
                        'value': true
                    }
                ]
            },
            'extend_data': {
                'label': label
            }
        };
    } else {
        statQuery = {
            'resource_type': 'inventory.CloudService',
            'query': {
                'aggregate': [{
                    'group': {
                        'fields': [
                            {
                                'name': 'total',
                                'operator': 'count'
                            }
                        ]
                    }
                }],
                'filter': [
                    {
                        'key': 'ref_cloud_service_type.is_primary',
                        'operator': 'eq',
                        'value': true
                    },
                    {
                        'key': 'ref_cloud_service_type.labels',
                        'operator': 'eq',
                        'value': label
                    }
                ]
            },
            'extend_data': {
                'label': label
            }
        };
    }

    if (projectId) {
        statQuery['query']['filter'].push({
            k: 'project_id',
            v: projectId,
            o: 'eq'
        });
    }

    if (aggregation === 'inventory.Region') {
        statQuery['query']['aggregate'][0]['group']['keys'] = [
            {
                name: 'region_code',
                key: 'region_code'
            },
            {
                name: 'provider',
                key: 'provider'
            }
        ];
    }

    return statQuery;
};
interface RequestParam {
    aggregate: object[];
}

const makeRequest = (params) => {
    const requestParams: RequestParam = {
        'aggregate': []
    };
    const labels = params.labels || SUPPORTED_LABELS;

    labels.forEach((label, idx) => {
        const statQuery = getStatQuery(label, params.project_id, params.aggregation);

        if (idx === 0) {
            requestParams['aggregate'].push(
                {'query': statQuery}
            );
        } else {
            requestParams['aggregate'].push(
                {'concat': statQuery}
            );
        }
    });

    requestParams['aggregate'].push(
        {
            'formula': {
                'query': `label in ${JSON.stringify(labels)}`
            }
        }
    );

    return requestParams;
};

const requestStat = async (params) => {
    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    return await statisticsV1.Resource.stat(requestParams);
};

const cloudServiceSummary = async (params) => {
    return await requestCache('stat:cloudServiceSummary', params, requestStat);
};

export default cloudServiceSummary;
