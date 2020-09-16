import httpContext from 'express-http-context';
import grpcClient from '@lib/grpc-client';
import { ConfigMapFactory } from '@factories/config/config-map';
import logger from '@lib/logger';

const createConfigMap = async (params) => {
    if (httpContext.get('mock_mode')) {
        return new ConfigMapFactory(params);
    }

    const configV1 = await grpcClient.get('config', 'v1');
    let response = await configV1.ConfigMap.create(params);

    return response;
};

const updateConfigMap = async (params) => {
    if (httpContext.get('mock_mode')) {
        return new ConfigMapFactory(params);
    }

    const configV1 = await grpcClient.get('config', 'v1');
    let response = await configV1.ConfigMap.update(params);

    return response;
};

const deleteConfigMap = async (params) => {
    if (httpContext.get('mock_mode')) {
        return {};
    }

    const configV1 = await grpcClient.get('config', 'v1');
    let response = await configV1.ConfigMap.delete(params);

    return response;
};

const getConfigMap = async (params) => {
    if (httpContext.get('mock_mode')) {
        return new ConfigMapFactory(params);
    }

    const configV1 = await grpcClient.get('config', 'v1');
    let response = await configV1.ConfigMap.get(params);

    return response;
};

const listConfigMaps = async (params) => {
    if (httpContext.get('mock_mode')) {
        return ConfigMapFactory.buildBatch(10);
    }

    let configV1 = await grpcClient.get('config', 'v1');
    let response = await configV1.ConfigMap.list(params);

    return response;
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
