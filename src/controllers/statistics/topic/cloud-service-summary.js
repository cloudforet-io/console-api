import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const SUPPORTED_LABELS = ['Compute', 'Container', 'Database', 'Networking', 'Storage', 'Security', 'Analytics', 'All'];
const getDefaultQuery = () => {
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
            'filter': [
                {
                    'key': 'ref_cloud_service_type.is_primary',
                    'operator': 'eq',
                    'value': true
                }
            ]
        },
        'extend_data': {
            'label': 'Compute'
        },
        'concat': []
    };
};

const getConcatQuery = (label, projectId, aggregation) => {
    let concatQuery;
    if (label === 'Storage') {
        concatQuery = {
            'extend_data': {
                'label': label
            },
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
            'resource_type': 'inventory.CloudService'
        };
    } else if (label === 'All') {
        concatQuery = {
            'extend_data': {
                'label': label
            },
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
                        'operator': 'eq',
                        'value': true
                    }
                ]
            },
            'resource_type': 'inventory.CloudService'
        };
    } else {
        concatQuery = {
            'extend_data': {
                'label': label
            },
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
            'resource_type': 'inventory.CloudService'
        };
    }

    if (projectId) {
        concatQuery['query']['filter'].push({
            k: 'project_id',
            v: projectId,
            o: 'eq'
        });
    }

    if (aggregation) {
        concatQuery['query']['aggregate']['group']['keys'] = [
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

    return concatQuery;
};

const makeRequest = (params) => {
    const requestParams = getDefaultQuery();
    const labels = params.labels || SUPPORTED_LABELS;

    labels.forEach((label) => {
        if (label !== 'Compute') {
            const concatQuery = getConcatQuery(label, params.project_id, params.aggregation);
            requestParams['concat'].push(concatQuery);
        }
    });

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

        requestParams['query']['filter'].push({
            k: 'region_code',
            v: true,
            o: 'exists'
        });
    }

    requestParams['formulas'] = [
        {
            'formula': `label in ${JSON.stringify(labels)}`,
            'operator': 'QUERY'
        }
    ];

    return requestParams;
};

const cloudServiceSummary = async (params) => {
    let statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    let response = await statisticsV1.Resource.stat(requestParams);

    return response;
};

export default cloudServiceSummary;
