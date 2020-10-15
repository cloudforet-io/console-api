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

    return requestParams;
};

const cloudServiceCount = async (params) => {
    let statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    let response = await statisticsV1.Resource.stat(requestParams);

    return response;
};

export default cloudServiceCount;
