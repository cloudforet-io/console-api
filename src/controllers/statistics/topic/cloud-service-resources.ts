import { cloneDeep } from 'lodash';

import grpcClient from '@lib/grpc-client';
import { Filter } from '@lib/grpc-client/type';

import { requestCache } from './request-cache';



interface FilterNA {
    size?: number;
    count?: number;
}

const getDefaultQuery = () => {
    return {
        aggregate: [
            {
                query: {
                    resource_type: 'inventory.CloudServiceType',
                    query: {
                        aggregate: [{
                            group: {
                                keys: [
                                    {
                                        name: 'cloud_service_type_id',
                                        key: 'cloud_service_type_id'
                                    },
                                    {
                                        name: 'cloud_service_type',
                                        key: 'name'
                                    },
                                    {
                                        name: 'cloud_service_group',
                                        key: 'group'
                                    },
                                    {
                                        name: 'provider',
                                        key: 'provider'
                                    },
                                    {
                                        name: 'cloud_service_type_id',
                                        key: 'cloud_service_type_id'
                                    }
                                ],
                                fields: [
                                    {
                                        name: 'tags',
                                        key: 'tags',
                                        operator: 'first'
                                    },
                                    {
                                        name: 'labels',
                                        key: 'labels',
                                        operator: 'first'
                                    }
                                ]
                            }
                        }],
                        filter: [] as Filter[]
                    }
                }
            },
            {
                join: {
                    resource_type: 'inventory.CloudService',
                    keys: [
                        'cloud_service_type',
                        'cloud_service_group',
                        'provider'
                    ],
                    query: {
                        aggregate: [{
                            group: {
                                keys: [
                                    {
                                        name: 'cloud_service_type',
                                        key: 'cloud_service_type'
                                    },
                                    {
                                        name: 'cloud_service_group',
                                        key: 'cloud_service_group'
                                    },
                                    {
                                        name: 'provider',
                                        key: 'provider'
                                    }
                                ],
                                fields: [
                                    {
                                        name: 'count',
                                        operator: 'count'
                                    }
                                ]
                            }
                        }],
                        filter: [] as Filter[]
                    }
                }
            },
            {
                fill_na: {
                    data: {
                        count: 0
                    } as FilterNA
                }
            },
            {
                formula: {
                    query: 'count > 0'
                }
            },
            {
                sort: [{
                    key: 'provider'
                }]
            }
        ]
    };
};

const makeRequest = (params) => {
    const requestParams: any = getDefaultQuery();

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
                requestParams['aggregate'][1]['join']['query']['aggregate'][0]['group']['fields'] = cloneDeep([{
                    name: 'size',
                    operator: 'sum',
                    key: 'instance_size'
                }]);

                requestParams['aggregate'][2]['fill_na']['data'] = {
                    size: 0
                };

                requestParams['aggregate'][3]['formula'] = {
                    query: 'size > 0'
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

    if (params.query) {
        if (params.query.page) {
            requestParams['page'] = params.query.page;
        }

        if (params.query.sort) {
            requestParams['aggregate'][4]['sort'] = params.query.sort;
        }

        if (params.query.filter) {
            requestParams['aggregate'][1]['join']['query']['filter'] = requestParams['aggregate'][1]['join']['query']['filter'].concat(cloneDeep(params.query.filter));
        }

        if (params.query.keyword) {
            requestParams['aggregate'][0]['query']['query']['keyword'] = params.query.keyword;
            // requestParams['aggregate'][1]['join']['query']['keyword'] = params.query.keyword;
        }
    }

    if (params.domain_id) {
        requestParams['domain_id'] = params.domain_id;
    }

    return requestParams;
};

const requestStat = async (params) => {
    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const inventoryV1 = await grpcClient.get('inventory', 'v1');
    const requestParams: any = makeRequest(params);

    const cloudServiceTypeResponse = await inventoryV1.CloudServiceType.list({
        query: {
            filter: cloneDeep(requestParams['aggregate'][0]['query']['query']['filter']),
            only: ['cloud_service_type_id']
        }
    });
    const cloudServiceTypeIds = cloudServiceTypeResponse.results.map((cloudServiceTypeInfo) => {
        return cloudServiceTypeInfo.cloud_service_type_id;
    });

    requestParams['aggregate'][1]['join']['query']['filter'].push({
        k: 'ref_cloud_service_type.cloud_service_type_id',
        v: cloudServiceTypeIds,
        o: 'in'
    });

    const response = await statisticsV1.Resource.stat(requestParams);

    response.results = response.results.map((data) => {
        data.icon = data.tags['spaceone:icon'];
        data.display_name = data.tags['spaceone:display_name'];
        delete data['tags'];
        return data;
    });

    return response;
};

const cloudServiceResources = async (params) => {
    return await requestCache('stat:cloudServiceResources', params, requestStat);
};

export default cloudServiceResources;
