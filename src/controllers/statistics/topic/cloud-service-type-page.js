import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const getDefaultQuery = () => {
    return {
        'resource_type': 'inventory.CloudServiceType',
        'query': {
            'aggregate': {
                'group': {
                    'keys': [
                        {
                            'name': 'cloud_service_type',
                            'key': 'name'
                        },
                        {
                            'name': 'cloud_service_group',
                            'key': 'group'
                        },
                        {
                            'name': 'provider',
                            'key': 'provider'
                        },
                        {
                            'name': 'icon',
                            'key': 'tags.spaceone:icon'
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
                                    'name': 'cloud_service_count',
                                    'operator': 'count'
                                }
                            ],
                            'keys': [
                                {
                                    'name': 'cloud_service_type',
                                    'key': 'cloud_service_type'
                                },
                                {
                                    'name': 'cloud_service_group',
                                    'key': 'cloud_service_group'
                                },
                                {
                                    'name': 'provider',
                                    'key': 'provider'
                                }
                            ]
                        }
                    }
                },
                'keys': [
                    'cloud_service_type',
                    'cloud_service_group',
                    'provider'
                ],
                'resource_type': 'inventory.CloudService'
            }
        ],
        'formulas': [
            {
                'formula': 'cloud_service_count > 0',
                'operator': 'QUERY'
            }
        ]
    };
};

const makeRequest = (params) => {
    let requestParams = getDefaultQuery();

    if (params.show_all != true) {
        requestParams['query']['filter'].push({
            'key': 'tags.spaceone:is_major',
            'operator': 'eq',
            'value': 'true'
        });
    }

    if (params.query) {
        if (params.query.page) {
            requestParams['query']['page'] = params.query.page;
        }

        if (params.query.filter) {
            requestParams['join'][0]['query']['filter'] = params.query.filter;
        }

        if (params.query.filter_or) {
            requestParams['join'][0]['query']['filter_or'] = params.query.filter_or;
        }
    }

    return requestParams;
};

const cloudServiceTypePage = async (params) => {
    let statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    let response = await statisticsV1.Resource.stat(requestParams);

    return response;
};

export default cloudServiceTypePage;
