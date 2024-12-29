import grpcClient from '@lib/grpc-client';


const listServiceChannels = async (params) => {
    const alertManagerV1 = await grpcClient.get('alert_manager', 'v1');
    return await alertManagerV1.ServiceChannel.list(params);
};

export {
    listServiceChannels
};
