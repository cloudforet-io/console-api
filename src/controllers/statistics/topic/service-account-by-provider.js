import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

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
                        }]
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

const makeRequest = (params) => {
    let requestParams = getDefaultQuery();
    return requestParams;
};

const serviceAccountByProvider = async (params) => {
    let statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    let response = await statisticsV1.Resource.stat(requestParams);

    return response;
};

export default serviceAccountByProvider;
