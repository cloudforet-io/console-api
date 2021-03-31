import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
import { requestCache } from './request-cache';

const getDefaultQuery = () => {
    return {
        'aggregate': [
            {
                'query': {
                    'resource_type': 'inventory.CloudService',
                    'query': {
                        'aggregate': [{
                            'group': {
                                'keys': [
                                    {
                                        'name': 'status',
                                        'key': 'data.status'
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
                                'key': 'provider',
                                'value': 'aws',
                                'operator': 'eq'
                            },
                            {
                                'key': 'cloud_service_group',
                                'value': 'TrustedAdvisor',
                                'operator': 'eq'
                            },
                            {
                                'key': 'cloud_service_type',
                                'value': 'Check',
                                'operator': 'eq'
                            },
                            {
                                'key': 'data.status',
                                'value': [
                                    'ok',
                                    'warning',
                                    'error'
                                ],
                                'operator': 'in'
                            }
                        ]
                    }
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

const trustedAdvisorSummary = async (params) => {
    return await requestCache('stat:trustedAdvisorSummary', params, requestStat);
};

export default trustedAdvisorSummary;
