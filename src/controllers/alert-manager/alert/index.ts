import grpcClient from '@lib/grpc-client';


const listAlerts = async (params) => {
    const alertManagerV1 = await grpcClient.get('alert_manager', 'v1');
    return await alertManagerV1.Alert.list(params);
};

export {
    listAlerts
};
