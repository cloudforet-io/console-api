import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
import { requestCache } from './request-cache';

const getDefaultQuery = () => {
    return {
        'aggregate': [
            {
                'query': {
                    'resource_type': 'identity.ServiceAccount',
                    'query': {
                        'aggregate': [{
                            'group': {
                                'keys': [
                                    {
                                        'key': 'provider',
                                        'name': 'provider'
                                    }
                                ],
                                'fields': [
                                    {
                                        'name': 'project_count',
                                        'operator': 'size',
                                        'key': 'project'
                                    },
                                    {
                                        'name': 'service_account_count',
                                        'operator': 'size',
                                        'key': 'service_account_id'
                                    }
                                ]
                            }
                        }],
                        'filter': [
                            {
                                'k': 'provider',
                                'v': ['aws', 'google_cloud', 'azure'],
                                'o': 'in'
                            }
                        ]
                    }
                }
            },
            {
                'sort': {
                    'key': 'service_account_count',
                    'desc': true
                }
            }
        ]
    };
};

// eslint-disable-next-line no-unused-vars
const makeRequest = (params) => {
    const requestParams = getDefaultQuery();
    return requestParams;
};

const requestStat = async (params) => {
    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    const response = await statisticsV1.Resource.stat(requestParams);

    return response;
};

const serviceAccountByProvider = async (params) => {
    return await requestCache('stat:serviceAccountByProvider', params, requestStat);
};

export default serviceAccountByProvider;
