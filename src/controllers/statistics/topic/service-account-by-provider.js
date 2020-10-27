import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const getDefaultQuery = () => {
    return {
        'query': {
            'sort': {
                'name': 'count',
                'desc': true
            },
            'aggregate': {
                'group': {
                    'keys': [
                        {
                            'key': 'provider',
                            'name': 'provider'
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
            'filter': [
                {
                    'k': 'provider',
                    'v': ['aws', 'azure', 'google_cloud'],
                    'o': 'in'
                }
            ]
        },
        'resource_type': 'identity.ServiceAccount'
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
