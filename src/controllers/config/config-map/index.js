import httpContext from 'express-http-context';
import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const createConfigMap = async (params) => {
    const configV1 = await grpcClient.get('config', 'v1');
    let response = await configV1.ConfigMap.create(params);

    return response;
};

const updateConfigMap = async (params) => {
    const configV1 = await grpcClient.get('config', 'v1');
    let response = await configV1.ConfigMap.update(params);

    return response;
};

const deleteConfigMap = async (params) => {
    const configV1 = await grpcClient.get('config', 'v1');
    let response = await configV1.ConfigMap.delete(params);

    return response;
};

const getConfigMap = async (params) => {
    const configV1 = await grpcClient.get('config', 'v1');
    let response = await configV1.ConfigMap.get(params);

    return response;
};

const listConfigMaps = async (params) => {
    if (httpContext.get('mock_mode')) {
        return {
            'results': [{
                name: 'mock-data',
                data: {
                    'key': 'value'
                },
                tags: {
                    'tag_key': 'tag_value'
                },
                domain_id: httpContext.get('domain_id'),
                created_at: {
                    seconds: 0,
                    nanos: 0
                }
            }],
            'total_count': 20
        };
    } else {
        let configV1 = await grpcClient.get('config', 'v1');
        let response = await configV1.ConfigMap.list(params);

        return response;
    }
};

const statConfigMaps = async (params) => {
    const identityV1 = await grpcClient.get('config', 'v1');
    let response = await identityV1.ConfigMap.stat(params);

    return response;
};

export {
    createConfigMap,
    updateConfigMap,
    deleteConfigMap,
    getConfigMap,
    listConfigMaps,
    statConfigMaps
};
