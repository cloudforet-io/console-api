import grpcClient from '@lib/grpc-client';


const listUserChannels = async (params) => {
    const alertManagerV1 = await grpcClient.get('alert_manager', 'v1');
    return await alertManagerV1.UserChannel.list(params);
};

export {
    listUserChannels
};
