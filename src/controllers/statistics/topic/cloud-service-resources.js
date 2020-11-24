import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
import _ from 'lodash';

const getDefaultQuery = () => {
    // return {
    //     'resource_type': 'inventory.CloudService',
    //     'query': {
    //         'aggregate': {
    //             'group': {
    //                 'keys': [
    //                     {
    //                         'name': 'cloud_service_type',
    //                         'key': 'cloud_service_type'
    //                     },
    //                     {
    //                         'name': 'cloud_service_group',
    //                         'key': 'cloud_service_group'
    //                     },
    //                     {
    //                         'name': 'provider',
    //                         'key': 'provider'
    //                     },
    //                     {
    //                         'name': 'cloud_service_type_id',
    //                         'key': 'ref_cloud_service_type.cloud_service_type_id'
    //                     },
    //                     {
    //                         'name': 'icon',
    //                         'key': 'ref_cloud_service_type.tags.spaceone:icon'
    //                     },
    //                     {
    //                         'name': 'display_name',
    //                         'key': 'ref_cloud_service_type.tags.spaceone:display_name'
    //                     },
    //                     {
    //                         'name': 'labels',
    //                         'key': 'ref_cloud_service_type.labels'
    //                     }
    //                 ],
    //                 'fields': [
    //                     {
    //                         'name': 'count',
    //                         'operator': 'count'
    //                     }
    //                 ]
    //             }
    //         },
    //         'sort': {
    //             'name': 'provider'
    //         },
    //         'filter': []
    //     },
    //     'extend_data': {
    //         'resource_type': 'inventory.CloudService'
    //     },
    //     'concat': [
    //         {
    //             'resource_type': 'inventory.Server',
    //             'query': {
    //                 'aggregate': {
    //                     'group': {
    //                         'keys': [
    //                             {
    //                                 'name': 'cloud_service_type',
    //                                 'key': 'cloud_service_type'
    //                             },
    //                             {
    //                                 'name': 'cloud_service_group',
    //                                 'key': 'cloud_service_group'
    //                             },
    //                             {
    //                                 'name': 'provider',
    //                                 'key': 'provider'
    //                             },
    //                             {
    //                                 'name': 'cloud_service_type_id',
    //                                 'key': 'ref_cloud_service_type.cloud_service_type_id'
    //                             },
    //                             {
    //                                 'name': 'icon',
    //                                 'key': 'ref_cloud_service_type.tags.spaceone:icon'
    //                             },
    //                             {
    //                                 'name': 'display_name',
    //                                 'key': 'ref_cloud_service_type.tags.spaceone:display_name'
    //                             },
    //                             {
    //                                 'name': 'labels',
    //                                 'key': 'ref_cloud_service_type.labels'
    //                             }
    //                         ],
    //                         'fields': [
    //                             {
    //                                 'name': 'count',
    //                                 'operator': 'count'
    //                             }
    //                         ]
    //                     }
    //                 },
    //                 'filter': []
    //             },
    //             'extend_data': {
    //                 'resource_type': 'inventory.Server'
    //             }
    //         }
    //     ],
    //     'formulas': [
    //         {
    //             'formula': 'cloud_service_type_id.notnull()',
    //             'operator': 'QUERY'
    //         }
    //     ]
    // };

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
                            'name': 'cloud_service_type_id',
                            'key': 'cloud_service_type_id'
                        },
                        {
                            'name': 'resource_type',
                            'key': 'resource_type'
                        },
                        {
                            'name': 'icon',
                            'key': 'tags.spaceone:icon'
                        },
                        {
                            'name': 'display_name',
                            'key': 'tags.spaceone:display_name'
                        },
                        {
                            'name': 'labels',
                            'key': 'labels'
                        }
                    ],
                    'fields': []
                }
            },
            'sort': {
                'name': 'provider'
            },
            'filter': []
        },
        'join': [
            {
                'resource_type': 'inventory.CloudService',
                'keys': [
                    'cloud_service_type',
                    'cloud_service_group',
                    'provider'
                ],
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
                                }
                            ],
                            'fields': [
                                {
                                    'name': 'cloud_service_count',
                                    'operator': 'count'
                                }
                            ]
                        }
                    },
                    'filter': []
                }
            },
            {
                'resource_type': 'inventory.Server',
                'keys': [
                    'cloud_service_type',
                    'cloud_service_group',
                    'provider'
                ],
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
                    'filter': []
                }
            }
        ],
        'fill_na': {
            'cloud_service_count': 0,
            'server_count': 0
        },
        'formulas': [
            // {
            //     'formula': 'cloud_service_type_id.notnull()',
            //     'operator': 'QUERY'
            // }
            {
                'formula': 'count = cloud_service_count + server_count'
            },
            {
                'formula': 'count > 0',
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
                // requestParams['query']['filter'].push({
                //     k: 'ref_cloud_service_type.labels',
                //     v: params.labels,
                //     o: 'in'
                // });

                // if (params.labels.indexOf('Compute') < 0) {
                //     requestParams['concat'][0]['query']['filter'].push({
                //         k: 'ref_cloud_service_type.labels',
                //         v: params.labels,
                //         o: 'in'
                //     });
                // }

                requestParams['query']['filter'].push({
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
                // requestParams['query']['aggregate']['group']['fields'] = _.cloneDeep(params.fields);
                // requestParams['concat'][0]['query']['aggregate']['group']['fields'] = _.cloneDeep(params.fields);
                requestParams['join'][0]['query']['aggregate']['group']['fields'] = _.cloneDeep([{
                    'name': 'cloud_service_size',
                    'operator': 'sum',
                    'key': 'data.size'
                }]);
                requestParams['join'][1]['query']['aggregate']['group']['fields'] = _.cloneDeep([{
                    'name': 'server_size',
                    'operator': 'sum',
                    'key': 'data.size'
                }]);

                requestParams['fill_na'] = {
                    'cloud_service_size': 0,
                    'server_size': 0
                };

                requestParams['formulas'] = [
                    {
                        'formula': 'size = cloud_service_size + server_size'
                    },
                    {
                        'formula': 'size > 0',
                        'operator': 'QUERY'
                    }
                ];
            }
        } else {
            throw new Error('Parameter type is invalid. (params.fields = list)');
        }
    }

    if (params.is_primary) {
        // requestParams['query']['filter'].push({
        //     k: 'ref_cloud_service_type.is_primary',
        //     v: params.is_primary,
        //     o: 'eq'
        // });
        requestParams['query']['filter'].push({
            k: 'is_primary',
            v: params.is_primary,
            o: 'eq'
        });
    }

    if (params.is_major) {
        // requestParams['query']['filter'].push({
        //     k: 'ref_cloud_service_type.is_major',
        //     v: params.is_major,
        //     o: 'eq'
        // });
        requestParams['query']['filter'].push({
            k: 'is_major',
            v: params.is_major,
            o: 'eq'
        });
    }

    if (params.resource_type) {
        // requestParams['formulas'].push({
        //     formula: `resource_type == "${params.resource_type}"`,
        //     operator: 'QUERY'
        // });
        requestParams['query']['filter'].push({
            k: 'resource_type',
            v: params.resource_type,
            o: 'eq'
        });
    }

    if (params.query) {
        if (params.query.page) {
            requestParams['query']['page'] = params.query.page;
        }

        if (params.query.sort) {
            requestParams['query']['sort'] = params.query.sort;
        }

        if (params.query.filter) {
            // requestParams['query']['filter'] = requestParams['query']['filter'].concat(_.cloneDeep(params.query.filter));
            // requestParams['concat'][0]['query']['filter'] =
            //     requestParams['concat'][0]['query']['filter'].concat(_.cloneDeep(params.query.filter));

            requestParams['join'][0]['query']['filter'] = requestParams['join'][0]['query']['filter'].concat(_.cloneDeep(params.query.filter));
            requestParams['join'][1]['query']['filter'] = requestParams['join'][1]['query']['filter'].concat(_.cloneDeep(params.query.filter));
        }

        if (params.query.keyword) {
            // requestParams['query']['keyword'] = params.query.keyword;
            // requestParams['concat'][0]['query']['keyword'] = params.query.keyword;
            requestParams['join'][0]['query']['keyword'] = params.query.keyword;
            requestParams['join'][1]['query']['keyword'] = params.query.keyword;
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
            'filter': _.cloneDeep(requestParams.query.filter),
            'only': ['cloud_service_type_id']
        }
    });
    const cloudServiceTypeIds = cloudServiceTypeResponse.results.map((cloudServiceTypeInfo) => {
        return cloudServiceTypeInfo.cloud_service_type_id;
    });

    requestParams['join'][0]['query']['filter'].push({
        'key': 'ref_cloud_service_type.cloud_service_type_id',
        'value': cloudServiceTypeIds,
        'operator': 'in'
    });

    const response = await statisticsV1.Resource.stat(requestParams);

    return response;
};

export default cloudServiceResources;
