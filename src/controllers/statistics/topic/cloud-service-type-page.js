import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

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
                            'name': 'icon',
                            'key': 'ref_cloud_service_type.tags.spaceone:icon'
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
                'name': 'cloud_service_group'
            },
            'filter': []
        }
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
            }
        } else {
            throw new Error('Parameter type is invalid. (params.labels = list)');
        }
    }


    if (params.show_all !== true) {
        requestParams['query']['filter'].push({
            k: 'ref_cloud_service_type.tags.spaceone:is_major',
            v: 'true',
            o: 'eq'
        });
    }

    if (params.query) {
        if (params.query.page) {
            requestParams['query']['page'] = params.query.page;
        }

        if (params.query.filter) {
            requestParams['query']['filter'] = requestParams['query']['filter'].concat(params.query.filter);
        }

        if (params.query.keyword) {
            requestParams['query']['filter_or'] = [
                {k:'cloud_service_id', v:params.query.keyword, o:'contain'},
                {k:'cloud_service_type', v:params.query.keyword, o:'contain'},
                {k:'cloud_service_group', v:params.query.keyword, o:'contain'},
                {k:'provider', v:params.query.keyword, o:'contain'}
            ];
        }

        if (params.query.sort) {
            requestParams['query']['sort'] = params.query.sort;
        }
    }

    return requestParams;
};

const cloudServiceTypePage = async (params) => {
    let statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    console.log(JSON.stringify(requestParams));
    let response = await statisticsV1.Resource.stat(requestParams);

    return response;
};

export default cloudServiceTypePage;
