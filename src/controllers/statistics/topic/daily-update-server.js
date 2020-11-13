import moment from 'moment-timezone';
import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const CREATE_WARNING_RATIO = '100';
const DELETE_WARNING_RATIO = '50';

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
            }
        ],
        'formulas': [
            {
                'formula': 'created_count > 0 or deleted_count > 0',
                'operator': 'QUERY'
            },
            {
                'formula': `created_count >= total_count/100*${CREATE_WARNING_RATIO}`,
                'operator': 'EVAL',
                'name': 'create_warning'
            },
            {
                'formula': `deleted_count >= total_count/100*${DELETE_WARNING_RATIO}`,
                'operator': 'EVAL',
                'name': 'delete_warning'
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

    const dt = moment().tz(params.timezone || 'UTC');
    dt.set({hour:0,minute:0,second:0,millisecond:0});

    requestParams.join[0].query.filter.push({
        k: 'created_at',
        v: dt.format(),
        o: 'datetime_gte'
    });

    requestParams.join[1].query.filter.push({
        k: 'deleted_at',
        v: dt.format(),
        o: 'datetime_gte'
    });

    return requestParams;
};

const dailyUpdateServer = async (params) => {
    let statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    let response = await statisticsV1.Resource.stat(requestParams);

    return response;
};

export default dailyUpdateServer;
