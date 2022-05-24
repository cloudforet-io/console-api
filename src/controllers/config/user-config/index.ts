import httpContext from 'express-http-context';

import { UserConfigFactory } from '@factories/config/user-config';
import grpcClient from '@lib/grpc-client';

const createUserConfig = async (params) => {
    if (httpContext.get('mock_mode')) {
        return new UserConfigFactory(params);
    }

    const configV1 = await grpcClient.get('config', 'v1');
    const response = await configV1.UserConfig.create(params);

    return response;
};

const updateUserConfig = async (params) => {
    if (httpContext.get('mock_mode')) {
        return new UserConfigFactory(params);
    }

    const configV1 = await grpcClient.get('config', 'v1');
    const response = await configV1.UserConfig.update(params);

    return response;
};

const setUserConfig = async (params) => {
    if (httpContext.get('mock_mode')) {
        return new UserConfigFactory(params);
    }

    const configV1 = await grpcClient.get('config', 'v1');
    const response = await configV1.UserConfig.set(params);

    return response;
};

const deleteUserConfig = async (params) => {
    if (httpContext.get('mock_mode')) {
        return {};
    }

    const configV1 = await grpcClient.get('config', 'v1');
    const response = await configV1.UserConfig.delete(params);

    return response;
};

const getUserConfig = async (params) => {
    if (httpContext.get('mock_mode')) {
        return new UserConfigFactory(params);
    }

    const configV1 = await grpcClient.get('config', 'v1');
    const response = await configV1.UserConfig.get(params);

    return response;
};

const listUserConfigs = async (params) => {
    if (httpContext.get('mock_mode')) {
        return {
            results: UserConfigFactory.buildBatch(),
            total_count: 10
        };
    }

    const configV1 = await grpcClient.get('config', 'v1');
    const response = await configV1.UserConfig.list(params);

    return response;
};

const statUserConfigs = async (params) => {
    const identityV1 = await grpcClient.get('config', 'v1');
    const response = await identityV1.UserConfig.stat(params);

    return response;
};

export {
    createUserConfig,
    updateUserConfig,
    setUserConfig,
    deleteUserConfig,
    getUserConfig,
    listUserConfigs,
    statUserConfigs
};
