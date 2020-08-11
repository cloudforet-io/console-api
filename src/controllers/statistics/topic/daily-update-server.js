import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const getDefaultQuery = () => {
    return {
        'resource_type': 'inventory.Server',
        'query': {
            'aggregate': {
                'group': {
                    'fields': [
                        {
                            'name': 'total_count',
                            'operator': 'count'
                        }
                    ],
                    'keys': [
                        {
                            'name': 'server_type',
                            'key': 'server_type'
                        }
                    ]
                }
            },
            'filter': [
                {
                    'key': 'server_type',
                    'operator': 'in',
                    'value': [
                        'BAREMETAL',
                        'VM',
                        'HYPERVISOR'
                    ]
                }
            ]
        },
        'join': [
            {
                'query': {
                    'aggregate': {
                        'group': {
                            'fields': [
                                {
                                    'name': 'deleted_count',
                                    'operator': 'count'
                                }
                            ],
                            'keys': [
                                {
                                    'name': 'server_type',
                                    'key': 'server_type'
                                }
                            ]
                        }
                    },
                    'filter': [
                        {
                            'key': 'server_type',
                            'operator': 'in',
                            'value': [
                                'BAREMETAL',
                                'VM',
                                'HYPERVISOR'
                            ]
                        },
                        {
                            'key': 'deleted_at',
                            'operator': 'timediff_gt',
                            'value': 'now/d'
                        },
                        {
                            'key': 'state',
                            'operator': 'eq',
                            'value': 'DELETED'
                        }
                    ]
                },
                'keys': [
                    'server_type'
                ],
                'type': 'OUTER',
                'resource_type': 'inventory.Server'
            },
            {
                'query': {
                    'aggregate': {
                        'group': {
                            'fields': [
                                {
                                    'name': 'created_count',
                                    'operator': 'count'
                                }
                            ],
                            'keys': [
                                {
                                    'name': 'server_type',
                                    'key': 'server_type'
                                }
                            ]
                        }
                    },
                    'filter': [
                        {
                            'key': 'server_type',
                            'operator': 'in',
                            'value': [
                                'BAREMETAL',
                                'VM',
                                'HYPERVISOR'
                            ]
                        },
                        {
                            'key': 'created_at',
                            'operator': 'timediff_gt',
                            'value': 'now/d'
                        }
                    ]
                },
                'keys': [
                    'server_type'
                ],
                'type': 'OUTER',
                'resource_type': 'inventory.Server'
            }
        ],
        'formulas': [
            {
                'formula': 'created_count > 0 or deleted_count',
                'operator': 'QUERY'
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
    }

    return requestParams;
};

const dailyUpdateServer = async (params) => {
    let statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    let response = await statisticsV1.Resource.stat(requestParams);

    return response;
};

export default dailyUpdateServer;