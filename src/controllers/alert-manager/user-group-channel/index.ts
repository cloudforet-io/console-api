import grpcClient from '@lib/grpc-client';


const listUserGroupChannels = async (params) => {
    const alertManagerV1 = await grpcClient.get('alert_manager', 'v1');
    return await alertManagerV1.UserGroupChannel.list(params);
};

export {
    listUserGroupChannels
};
