import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const getDefaultQuery = () => {
    return {
        'resource_type': 'identity.ServiceAccount',
        'query': {
            'sort': {
                'name': 'resource_count',
                'desc': true
            },
            'aggregate': {
                'group': {
                    'keys': [
                        {
                            'key': 'provider',
                            'name': 'provider'
                        },
                        {
                            'key': 'service_account_id',
                            'name': 'service_account_id'
                        },
                        {
                            'key': 'name',
                            'name': 'service_account_name'
                        }
                    ],
                    'fields': []
                }
            },
            'filter': [
                {
                    'k': 'project_id',
                    'v': 'project-18655561c535',
                    'o': 'eq'
                }
            ]
        },
        'join': [
            {
                'keys': [
                    'service_account_id'
                ],
                'resource_type': 'inventory.Server',
                'query': {
                    'aggregate': {
                        'unwind': [
                            {
                                'path': 'collection_info.service_accounts'
                            }
                        ],
                        'group': {
                            'keys': [
                                {
                                    'key': 'collection_info.service_accounts',
                                    'name': 'service_account_id'
                                }
                            ],
                            'fields': [
                                {
                                    'name': 'server_count',
                                    'operator': 'count'
                                }
                            ]
                        }
                    },
                    'filter': [
                        {
                            'k': 'project_id',
                            'v': 'project-18655561c535',
                            'o': 'eq'
                        },
                        {
                            'k': 'ref_cloud_service_type.is_primary',
                            'v': true,
                            'o': 'eq'
                        }
                    ]
                }
            },
            {
                'keys': [
                    'service_account_id'
                ],
                'resource_type': 'inventory.CloudService',
                'query': {
                    'aggregate': {
                        'unwind': [
                            {
                                'path': 'collection_info.service_accounts'
                            }
                        ],
                        'group': {
                            'keys': [
                                {
                                    'key': 'collection_info.service_accounts',
                                    'name': 'service_account_id'
                                }
                            ],
                            'fields': [
                                {
                                    'name': 'database_count',
                                    'operator': 'count'
                                }
                            ]
                        }
                    },
                    'filter': [
                        {
                            'k': 'project_id',
                            'v': 'project-18655561c535',
                            'o': 'eq'
                        },
                        {
                            'k': 'ref_cloud_service_type.is_primary',
                            'v': true,
                            'o': 'eq'
                        },
                        {
                            'key': 'ref_cloud_service_type.labels',
                            'operator': 'eq',
                            'value': 'Database'
                        }
                    ]
                }
            },
            {
                'keys': [
                    'service_account_id'
                ],
                'resource_type': 'inventory.CloudService',
                'query': {
                    'aggregate': {
                        'unwind': [
                            {
                                'path': 'collection_info.service_accounts'
                            }
                        ],
                        'group': {
                            'keys': [
                                {
                                    'key': 'collection_info.service_accounts',
                                    'name': 'service_account_id'
                                }
                            ],
                            'fields': [
                                {
                                    'name': 'storage_size',
                                    'key': 'data.size',
                                    'operator': 'sum'
                                }
                            ]
                        }
                    },
                    'filter': [
                        {
                            'k': 'project_id',
                            'v': 'project-18655561c535',
                            'o': 'eq'
                        },
                        {
                            'k': 'ref_cloud_service_type.is_primary',
                            'v': true,
                            'o': 'eq'
                        },
                        {
                            'key': 'ref_cloud_service_type.labels',
                            'operator': 'eq',
                            'value': 'Storage'
                        }
                    ]
                }
            }
        ],
        'fill_na': {
            'server_count': 0,
            'database_count': 0,
            'storage_size': 0
        },
        'formulas': [
            {
                'formula': 'resource_count = server_count + database_count'
            }
        ]
    };
};

const makeRequest = (params) => {
    let requestParams = getDefaultQuery();

    if (params.project_id) {
        requestParams.query.filter.push({
            k: 'project_id',
            v: params.project_id,
            o: 'eq'
        });
        requestParams.join[0].query.filter.push({
            k: 'project_id',
            v: params.project_id,
            o: 'eq'
        });
        requestParams.join[1].query.filter.push({
            k: 'project_id',
            v: params.project_id,
            o: 'eq'
        });
        requestParams.join[2].query.filter.push({
            k: 'project_id',
            v: params.project_id,
            o: 'eq'
        });
    }

    return requestParams;
};

const serviceAccountSummary = async (params) => {
    let statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    let response = await statisticsV1.Resource.stat(requestParams);

    return response;
};

export default serviceAccountSummary;
