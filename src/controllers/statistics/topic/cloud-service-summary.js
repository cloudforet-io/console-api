import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const SUPPORTED_LABELS = ['Compute', 'Container', 'Database', 'Networking', 'Storage', 'Security', 'Analytics'];

const getComputeQuery = () => {
    return {
        'resource_type': 'inventory.Server',
        'query': {
            'aggregate': {
                'group': {
                    'fields': [
                        {
                            'name': 'total',
                            'operator': 'count'
                        }
                    ]
                }
            },
            'filter': []
        }
    };
};

const getCloudServiceQuery = (label) => {
    let requestParams =  {
        'resource_type': 'inventory.CloudService',
        'query': {
            'aggregate': {
                'group': {
                    'fields': [
                        {
                            'name': 'total',
                            'operator': 'count'
                        }
                    ]
                }
            },
            'filter': [
                {
                    'key': 'ref_cloud_service_type.is_primary',
                    'value': true,
                    'operator': 'eq'
                }
            ]
        }
    };

    if (label) {
        requestParams['query']['filter'].push({
            'key': 'ref_cloud_service_type.labels',
            'value': label,
            'operator': 'eq'
        });
    }

    return requestParams;
};

const getStorageQuery = () => {
    return {
        'resource_type': 'inventory.CloudService',
        'query': {
            'aggregate': {
                'group': {
                    'fields': [
                        {
                            'key': 'data.size',
                            'name': 'total',
                            'operator': 'sum'
                        }
                    ]
                }
            },
            'filter': [
                {
                    'key': 'ref_cloud_service_type.labels',
                    'value': 'Storage',
                    'operator': 'eq'
                },
                {
                    'key': 'ref_cloud_service_type.is_major',
                    'value': true,
                    'operator': 'eq'
                }
            ]
        }
    };
};

const makeRequest = (params) => {
    if (params.label && SUPPORTED_LABELS.indexOf(params.label) < 0) {
        throw new Error(`label not supported. (support = ${SUPPORTED_LABELS.join(' | ')})`);
    }

    let requestParams;
    if (params.label == 'Compute') {
        requestParams = getComputeQuery();
    } else if (params.label == 'Storage') {
        requestParams = getStorageQuery();
    } else {
        requestParams = getCloudServiceQuery(params.label);
    }

    if (params.project_id) {
        requestParams['query']['filter'].push({
            k: 'project_id',
            v: params.project_id,
            o: 'eq'
        });
    }

    if (params.aggregation === 'inventory.Region') {
        requestParams['query']['aggregate']['group']['keys'] = [
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

    return requestParams;
};

const cloudServiceSummary = async (params) => {
    let statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    let response = await statisticsV1.Resource.stat(requestParams);

    return response;
};

export default cloudServiceSummary;
