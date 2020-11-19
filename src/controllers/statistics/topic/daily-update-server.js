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
                            'name': 'provider',
                            'key': 'provider'
                        },
                        {
                            'name': 'cloud_service_group',
                            'key': 'cloud_service_group'
                        },
                        {
                            'name': 'cloud_service_type',
                            'key': 'cloud_service_type'
                        },
                        {
                            'name': 'icon',
                            'key': 'ref_cloud_service_type.tags.spaceone:icon'
                        }
                    ]
                }
            },
            'filter': []
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
                                    'name': 'provider',
                                    'key': 'provider'
                                },
                                {
                                    'name': 'cloud_service_group',
                                    'key': 'cloud_service_group'
                                },
                                {
                                    'name': 'cloud_service_type',
                                    'key': 'cloud_service_type'
                                }
                            ]
                        }
                    },
                    'filter': []
                },
                'keys': [
                    'provider',
                    'cloud_service_group',
                    'cloud_service_type'
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
                                    'name': 'provider',
                                    'key': 'provider'
                                },
                                {
                                    'name': 'cloud_service_group',
                                    'key': 'cloud_service_group'
                                },
                                {
                                    'name': 'cloud_service_type',
                                    'key': 'cloud_service_type'
                                }
                            ]
                        }
                    },
                    'filter': [
                        {
                            'key': 'state',
                            'operator': 'eq',
                            'value': 'DELETED'
                        }
                    ]
                },
                'keys': [
                    'provider',
                    'cloud_service_group',
                    'cloud_service_type'
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
                'formula': `create_warning = created_count >= total_count/100*${CREATE_WARNING_RATIO}`
            },
            {
                'formula': `delete_warning = deleted_count >= total_count/100*${DELETE_WARNING_RATIO}`
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
