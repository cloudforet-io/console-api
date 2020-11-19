import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
import _ from 'lodash';

const getDefaultQuery = () => {
    return {
        'resource_type': 'inventory.CloudService',
        'query': {
            'aggregate': {
                'group': {
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
                        },
                        {
                            'name': 'cloud_service_type_id',
                            'key': 'ref_cloud_service_type.cloud_service_type_id'
                        },
                        {
                            'name': 'icon',
                            'key': 'ref_cloud_service_type.tags.spaceone:icon'
                        },
                        {
                            'name': 'display_name',
                            'key': 'ref_cloud_service_type.tags.spaceone:display_name'
                        },
                        {
                            'name': 'labels',
                            'key': 'ref_cloud_service_type.labels'
                        }
                    ],
                    'fields': [
                        {
                            'name': 'count',
                            'operator': 'count'
                        }
                    ]
                }
            },
            'sort': {
                'name': 'provider'
            },
            'filter': []
        },
        'extend_data': {
            'resource_type': 'inventory.CloudService'
        },
        'concat': [
            {
                'resource_type': 'inventory.Server',
                'query': {
                    'aggregate': {
                        'group': {
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
                                },
                                {
                                    'name': 'cloud_service_type_id',
                                    'key': 'ref_cloud_service_type.cloud_service_type_id'
                                },
                                {
                                    'name': 'icon',
                                    'key': 'ref_cloud_service_type.tags.spaceone:icon'
                                },
                                {
                                    'name': 'display_name',
                                    'key': 'ref_cloud_service_type.tags.spaceone:display_name'
                                },
                                {
                                    'name': 'labels',
                                    'key': 'ref_cloud_service_type.labels'
                                }
                            ],
                            'fields': [
                                {
                                    'name': 'count',
                                    'operator': 'count'
                                }
                            ]
                        }
                    },
                    'filter': []
                },
                'extend_data': {
                    'resource_type': 'inventory.Server'
                }
            }
        ],
        'formulas': [
            {
                'formula': 'cloud_service_type.notnull()',
                'operator': 'QUERY'
            }
        ]
    };
};

const makeRequest = (params) => {
    let requestParams = getDefaultQuery();

    if (params.labels) {
        if (Array.isArray(params.labels)) {
            if (params.labels.length > 0) {
                requestParams['query']['filter'].push({
                    k: 'ref_cloud_service_type.labels',
                    v: params.labels,
                    o: 'in'
                });

                if (params.labels.indexOf('Compute') < 0) {
                    requestParams['concat'][0]['query']['filter'].push({
                        k: 'ref_cloud_service_type.labels',
                        v: params.labels,
                        o: 'in'
                    });
                }
            }
        } else {
            throw new Error('Parameter type is invalid. (params.labels = list)');
        }
    }

    if (params.fields) {
        if (Array.isArray(params.fields)) {
            if (params.fields.length > 0) {
                requestParams['query']['aggregate']['group']['fields'] = _.cloneDeep(params.fields);
                requestParams['concat'][0]['query']['aggregate']['group']['fields'] = _.cloneDeep(params.fields);
            }
        } else {
            throw new Error('Parameter type is invalid. (params.fields = list)');
        }
    }

    if (params.is_primary) {
        requestParams['query']['filter'].push({
            k: 'ref_cloud_service_type.is_primary',
            v: params.is_primary,
            o: 'eq'
        });
    }

    if (params.is_major) {
        requestParams['query']['filter'].push({
            k: 'ref_cloud_service_type.is_major',
            v: params.is_major,
            o: 'eq'
        });
    }

    if (params.resource_type) {
        requestParams['formulas'].push({
            formula: `resource_type == "${params.resource_type}"`,
            operator: 'QUERY'
        });
    }

    if (params.query) {
        if (params.query.page) {
            requestParams['query']['page'] = params.query.page;
        }

        if (params.query.filter) {
            requestParams['query']['filter'] = requestParams['query']['filter'].concat(_.cloneDeep(params.query.filter));
            requestParams['concat'][0]['query']['filter'] =
                requestParams['concat'][0]['query']['filter'].concat(_.cloneDeep(params.query.filter));
        }

        if (params.query.keyword) {
            requestParams['query']['keyword'] = params.query.keyword;
            requestParams['concat'][0]['query']['keyword'] = params.query.keyword;
        }

        if (params.query.sort) {
            requestParams['query']['sort'] = params.query.sort;
        }
    }

    return requestParams;
};

const cloudServiceResources = async (params) => {
    let statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    let response = await statisticsV1.Resource.stat(requestParams);

    return response;
};

export default cloudServiceResources;
