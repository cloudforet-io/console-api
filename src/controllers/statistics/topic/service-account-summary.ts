import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
import { requestCache } from './request-cache';

const getDefaultQuery = () => {
    return {
        'aggregate': [
            {
                'query': {
                    'resource_type': 'identity.ServiceAccount',
                    'query': {
                        'aggregate': [{
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
                        }],
                        'filter': [
                            {
                                'k': 'provider',
                                'v': ['aws', 'google_cloud', 'azure'],
                                'o': 'in'
                            }
                        ]
                    }
                }
            },
            {
                'join': {
                    'resource_type': 'inventory.Server',
                    'keys': [
                        'service_account_id'
                    ],
                    'query': {
                        'aggregate': [
                            {
                                'unwind': {
                                    'path': 'collection_info.service_accounts'
                                }
                            },
                            {
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
                            }
                        ],
                        'filter': [
                            // {
                            //     'k': 'ref_cloud_service_type.is_primary',
                            //     'v': true,
                            //     'o': 'eq'
                            // }
                        ]
                    }
                }
            },
            {
                'join': {
                    'resource_type': 'inventory.CloudService',
                    'keys': [
                        'service_account_id'
                    ],
                    'query': {
                        'aggregate': [
                            {
                                'unwind': {
                                    'path': 'collection_info.service_accounts'
                                }
                            },
                            {
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
                            }
                        ],
                        'filter': [
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
                }
            },
            {
                'join': {
                    'resource_type': 'inventory.CloudService',
                    'keys': [
                        'service_account_id'
                    ],
                    'query': {
                        'aggregate': [
                            {
                                'unwind': {
                                    'path': 'collection_info.service_accounts'
                                }
                            },
                            {
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
                            }
                        ],
                        'filter': [
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
            },
            {
                'fill_na': {
                    'data': {
                        'server_count': 0,
                        'database_count': 0,
                        'storage_size': 0
                    }
                }
            },
            {
                'formula': {
                    'eval': 'resource_count = server_count + database_count'
                }
            },
            {
                'sort': {
                    'key': 'resource_count',
                    'desc': true
                }
            }
        ]
    };
};

const makeRequest = (params) => {
    const requestParams = getDefaultQuery();

    if (params.project_id) {
        requestParams.aggregate[0].query?.query.filter.push({
            k: 'project_id',
            v: params.project_id,
            o: 'eq'
        });
        requestParams.aggregate[1].join?.query.filter.push({
            k: 'project_id',
            v: params.project_id,
            o: 'eq'
        });
        requestParams.aggregate[2].join?.query.filter.push({
            k: 'project_id',
            v: params.project_id,
            o: 'eq'
        });
        requestParams.aggregate[3].join?.query.filter.push({
            k: 'project_id',
            v: params.project_id,
            o: 'eq'
        });
    }

    return requestParams;
};

const requestStat = async (params) => {
    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    const response = await statisticsV1.Resource.stat(requestParams);

    return response;
};

const serviceAccountSummary = async (params) => {
    return await requestCache('stat:serviceAccountSummary', params, requestStat);
};

export default serviceAccountSummary;
