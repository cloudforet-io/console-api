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
            }
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
                    }
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
                                    'name': 'cloud_service_count',
                                    'operator': 'count'
                                }
                            ]
                        }
                    }
                }
            },
            {
                'keys': [
                    'service_account_id'
                ],
                'resource_type': 'secret.Secret',
                'query': {
                    'aggregate': {
                        'group': {
                            'keys': [
                                {
                                    'key': 'service_account_id',
                                    'name': 'service_account_id'
                                }
                            ],
                            'fields': [
                                {
                                    'name': 'secret_count',
                                    'operator': 'count'
                                }
                            ]
                        }
                    }
                }
            }
        ],
        'formulas': [
            {
                'name': 'resource_count',
                'formula': 'server_count + cloud_service_count'
            }
        ]
    };
};

const makeRequest = (params) => {
    let requestParams = getDefaultQuery();

    if (params.project_id) {
        requestParams.query.filter = [{
            k: 'project_id',
            v: params.project_id,
            o: 'eq'
        }];
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
