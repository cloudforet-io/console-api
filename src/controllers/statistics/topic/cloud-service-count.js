import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const getDefaultQuery = () => {
    return {
        'query': {
            'aggregate': {
                'count': {
                    'name': 'count'
                }
            },
            'filter': [
                {
                    'k': 'ref_cloud_service_type.tags.spaceone:is_major',
                    'v': 'true',
                    'o': 'eq'
                }
            ]
        },
        'resource_type': 'inventory.CloudService'
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

    if (params.provider) {
        requestParams.query.filter.push({
            k: 'provider',
            v: params.provider,
            o: 'eq'
        });
    }

    if (params.category) {
        requestParams.query.filter.push({
            k: 'ref_cloud_service_type.labels',
            v: params.category,
            o: 'eq'
        });
    }

    return requestParams;
};

const cloudServiceCount = async (params) => {
    let statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    let response = await statisticsV1.Resource.stat(requestParams);

    return response;
};

export default cloudServiceCount;
