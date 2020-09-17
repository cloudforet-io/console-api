import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const getDefaultQuery = () => {
    return {
        'query': {
            'aggregate': {
                'group': {
                    'keys': [
                        {
                            'key': 'schema',
                            'name': 'name'
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
            'filter': []
        },
        'resource_type': 'secret.Secret'
    };
};

const makeRequest = (params) => {
    let requestParams = getDefaultQuery();

    if (params.provider) {
        requestParams.query.filter.push({
            k: 'provider',
            v: params.provider,
            o: 'eq'
        });
    }
    return requestParams;
};

const secretCount = async (params) => {
    let statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    let response = await statisticsV1.Resource.stat(requestParams);

    return response;
};

export default secretCount;
