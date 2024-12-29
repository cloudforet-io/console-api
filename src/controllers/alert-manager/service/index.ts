import grpcClient from '@lib/grpc-client';


const listServices = async (params) => {
    const alertManagerV1 = await grpcClient.get('alert_manager', 'v1');
    return await alertManagerV1.Service.list(params);
};

export {
    listServices
};
