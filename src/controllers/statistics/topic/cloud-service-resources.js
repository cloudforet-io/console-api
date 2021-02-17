import grpcClient from '@lib/grpc-client';
import { tagsToObject } from '@lib/utils';
import logger from '@lib/logger';
import _ from 'lodash';

const getDefaultQuery = () => {
    return {
        'aggregate': [
            {
                'query': {
                    'resource_type': 'inventory.CloudServiceType',
                    'query': {
                        'aggregate': [{
                            'group': {
                                'keys': [
                                    {
                                        'name': 'cloud_service_type_id',
                                        'key': 'cloud_service_type_id'
                                    },
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
                                        'name': 'cloud_service_type_id',
                                        'key': 'cloud_service_type_id'
                                    },
                                    {
                                        'name': 'resource_type',
                                        'key': 'resource_type'
                                    }
                                ],
                                'fields': [
                                    {
                                        'name': 'tags',
                                        'key': 'tags',
                                        'operator': 'first'
                                    },
                                    {
                                        'name': 'labels',
                                        'key': 'labels',
                                        'operator': 'first'
                                    }
                                ]
                            }
                        }],
                        'filter': []
                    }
                }
            },
            {
                'join': {
                    'resource_type': 'inventory.CloudService',
                    'keys': [
                        'cloud_service_type',
                        'cloud_service_group',
                        'provider'
                    ],
                    'query': {
                        'aggregate': [{
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
                                    }
                                ],
                                'fields': [
                                    {
                                        'name': 'cloud_service_count',
                                        'operator': 'count'
                                    }
                                ]
                            }
                        }],
                        'filter': []
                    }
                }
            },
            {
                'join': {
                    'resource_type': 'inventory.Server',
                    'keys': [
                        'cloud_service_type',
                        'cloud_service_group',
                        'provider'
                    ],
                    'query': {
                        'aggregate': [{
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
                                    }
                                ],
                                'fields': [
                                    {
                                        'name': 'server_count',
                                        'operator': 'count'
                                    }
                                ]
                            }
                        }],
                        'filter': []
                    }
                }
            },
            {
                'fill_na': {
                    'data': {
                        'cloud_service_count': 0,
                        'server_count': 0
                    }
                }
            },
            {
                'formula': {
                    'eval': 'count = cloud_service_count + server_count'
                }
            },
            {
                'formula': {
                    'query': 'count > 0'
                }
            },
            {
                'sort': {
                    'key': 'provider'
                }
            }
        ]
    };
};

const makeRequest = (params) => {
    let requestParams = getDefaultQuery();

    if (params.labels) {
        if (Array.isArray(params.labels)) {
            if (params.labels.length > 0) {
                requestParams['aggregate'][0]['query']['query']['filter'].push({
                    k: 'labels',
                    v: params.labels,
                    o: 'in'
                });
            }
        } else {
            throw new Error('Parameter type is invalid. (params.labels = list)');
        }
    }

    if (params.fields) {
        if (Array.isArray(params.fields)) {
            if (params.fields.length > 0 && params.fields[0].name === 'size') {
                requestParams['aggregate'][1]['join']['query']['aggregate'][0]['group']['fields'] = _.cloneDeep([{
                    'name': 'cloud_service_size',
                    'operator': 'sum',
                    'key': 'data.size'
                }]);
                requestParams['aggregate'][2]['join']['query']['aggregate'][0]['group']['fields'] = _.cloneDeep([{
                    'name': 'server_size',
                    'operator': 'sum',
                    'key': 'data.size'
                }]);

                requestParams['aggregate'][3]['fill_na']['data'] = {
                    'cloud_service_size': 0,
                    'server_size': 0
                };

                requestParams['aggregate'][4]['formula'] = {
                    'eval': 'size = cloud_service_size + server_size'
                };

                requestParams['aggregate'][5]['formula'] = {
                    'query': 'size > 0'
                };
            }
        } else {
            throw new Error('Parameter type is invalid. (params.fields = list)');
        }
    }

    if (params.is_primary) {
        requestParams['aggregate'][0]['query']['query']['filter'].push({
            k: 'is_primary',
            v: params.is_primary,
            o: 'eq'
        });
    }

    if (params.is_major) {
        requestParams['aggregate'][0]['query']['query']['filter'].push({
            k: 'is_major',
            v: params.is_major,
            o: 'eq'
        });
    }

    if (params.resource_type) {
        requestParams['aggregate'][0]['query']['query']['filter'].push({
            k: 'resource_type',
            v: params.resource_type,
            o: 'eq'
        });
    }

    if (params.query) {
        if (params.query.page) {
            requestParams['page'] = params.query.page;
        }

        if (params.query.sort) {
            requestParams['aggregate'][6]['sort'] = params.query.sort;
        }

        if (params.query.filter) {
            requestParams['aggregate'][1]['join']['query']['filter'] = requestParams['aggregate'][1]['join']['query']['filter'].concat(_.cloneDeep(params.query.filter));
            requestParams['aggregate'][2]['join']['query']['filter'] = requestParams['aggregate'][2]['join']['query']['filter'].concat(_.cloneDeep(params.query.filter));
        }

        if (params.query.keyword) {
            requestParams['aggregate'][0]['query']['query']['keyword'] = params.query.keyword;
            // requestParams['aggregate'][1]['join']['query']['keyword'] = params.query.keyword;
            // requestParams['aggregate'][2]['join']['query']['keyword'] = params.query.keyword;
        }
    }

    return requestParams;
};

const cloudServiceResources = async (params) => {
    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const requestParams = makeRequest(params);

    const cloudServiceTypeResponse = await inventoryV1.CloudServiceType.list({
        'query': {
            'filter': _.cloneDeep(requestParams['aggregate'][0]['query']['query']['filter']),
            'only': ['cloud_service_type_id']
        }
    });
    const cloudServiceTypeIds = cloudServiceTypeResponse.results.map((cloudServiceTypeInfo) => {
        return cloudServiceTypeInfo.cloud_service_type_id;
    });

    requestParams['aggregate'][1]['join']['query']['filter'].push({
        'key': 'ref_cloud_service_type.cloud_service_type_id',
        'value': cloudServiceTypeIds,
        'operator': 'in'
    });

    const response = await statisticsV1.Resource.stat(requestParams);

    response.results = response.results.map((data) => {
        const tags = tagsToObject(data.tags);
        data.icon = tags['spaceone:icon'];
        data.display_name = tags['spaceone:display_name'];
        delete data['tags'];
        return data;
    });

    return response;
};

export default cloudServiceResources;
