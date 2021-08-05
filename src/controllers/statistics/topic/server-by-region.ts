import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
import { requestCache } from './request-cache';

const getDefaultQuery = () => {
    return {
        'aggregate': [
            {
                'query': {
                    'resource_type': 'inventory.Server',
                    'query': {
                        'aggregate': [{
                            'group': {
                                'keys': [
                                    {
                                        'key': 'provider',
                                        'name': 'provider'
                                    },
                                    {
                                        'key': 'region_code',
                                        'name': 'region_name'
                                    }
                                ],
                                'fields': [
                                    {
                                        'name': 'count',
                                        'operator': 'count'
                                    }
                                ]
                            }
                        }],
                        'filter': [
                            {
                                'k': 'region_code',
                                'v': null,
                                'o': 'not'
                            }
                        ]
                    }
                }
            },
            {
                'sort': {
                    'key': 'count',
                    'desc': true
                }
            }
        ]
    };
};

const makeRequest = (params) => {
    const requestParams = getDefaultQuery();

    if (params.project_id) {
        requestParams.aggregate[0].query?.query.filter.push({
            k: 'project_id',
            v: params.project_id,
            o: 'eq'
        });
    }

    if (params.domain_id) {
        requestParams['domain_id'] = params.domain_id;
    }

    return requestParams;
};

const requestStat = async (params) => {
    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    const response = await statisticsV1.Resource.stat(requestParams);

    return response;
};

const serverByRegion = async (params) => {
    return await requestCache('stat:serverByRegion', params, requestStat);
};

export default serverByRegion;
