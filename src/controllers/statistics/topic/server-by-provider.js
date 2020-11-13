import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const SERVER_TYPE_MAP = {
    aws: 'EC2',
    google_cloud: 'Compute Engine',
    azure: 'VM'
};

const getDefaultQuery = () => {
    return {
        'query': {
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
            'filter': [],
            'sort': {
                'name': 'count',
                'desc': true
            }
        },
        'resource_type': 'inventory.Server'
    };
};

const makeRequest = (params) => {
    let requestParams = getDefaultQuery();

    if (params.project_id) {
        requestParams.query.filter.push({
            k: 'project_id',
            v: params.project_id,
            o: 'eq'
        });
    }

    return requestParams;
};

const addServerType = (response) => {
    response.results = response.results.map((item) => {
        item.server_type = (SERVER_TYPE_MAP[item.provider])? SERVER_TYPE_MAP[item.provider]: 'Server';
        return item;
    });

    return response;
};

const serverByProvider = async (params) => {
    let statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    let response = await statisticsV1.Resource.stat(requestParams);
    response = addServerType(response);
    return response;
};

export default serverByProvider;
