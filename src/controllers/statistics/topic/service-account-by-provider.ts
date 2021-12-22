import grpcClient from '@lib/grpc-client';
import { requestCache } from './request-cache';

const getDefaultQuery = () => {
    return {
        aggregate: [
            {
                query: {
                    resource_type: 'identity.ServiceAccount',
                    query: {
                        aggregate: [{
                            group: {
                                keys: [
                                    {
                                        key: 'provider',
                                        name: 'provider'
                                    }
                                ],
                                fields: [
                                    {
                                        name: 'projects',
                                        operator: 'add_to_set',
                                        key: 'project'
                                    },
                                    {
                                        name: 'service_account_count',
                                        operator: 'count',
                                        key: 'service_account_id'
                                    }
                                ]
                            }
                        }, {
                            project: {
                                fields: [
                                    {
                                        name: 'project_count',
                                        key: 'projects',
                                        operator: 'size'
                                    },
                                    {
                                        name: 'service_account_count',
                                        key: 'service_account_count'
                                    }
                                ]
                            }
                        }],
                        filter: [
                            {
                                k: 'provider',
                                v: ['aws', 'google_cloud', 'azure'],
                                o: 'in'
                            }
                        ]
                    }
                }
            },
            {
                sort: {
                    key: 'service_account_count',
                    desc: true
                }
            }
        ]
    };
};

// eslint-disable-next-line no-unused-vars
const makeRequest = (params) => {
    const requestParams = getDefaultQuery();

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

const serviceAccountByProvider = async (params) => {
    return await requestCache('stat:serviceAccountByProvider', params, requestStat);
};

export default serviceAccountByProvider;
