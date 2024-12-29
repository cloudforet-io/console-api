import grpcClient from '@lib/grpc-client';


const listNotificationProtocols = async (params) => {
    const alertManagerV1 = await grpcClient.get('alert_manager', 'v1');
    return await alertManagerV1.NotificationProtocol.list(params);
};

export {
    listNotificationProtocols
};
