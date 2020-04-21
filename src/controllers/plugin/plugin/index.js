import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';


const getPluginEndPoint = async (params) => {
    const pluginV1 = await grpcClient.get('plugin', 'v1');
    let response = await pluginV1.Plugin.get_plugin_endpoint(params);
    return response;
};

const notifyPluginFailure = async (params) => {
    const pluginV1 = await grpcClient.get('plugin', 'v1');
    let response = await pluginV1.Plugin.notify_failure(params);
    return response;
};

const pluginVerify = async (params) => {
    const pluginV1 = await grpcClient.get('plugin', 'v1');
    let response = await pluginV1.Plugin.verify(params);
    return response;
};

export {
    getPluginEndPoint,
    pluginVerify,
    notifyPluginFailure
};
