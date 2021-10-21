import grpcClient from '@lib/grpc-client';

const listLogs = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.Log.list(params);

    return response;
};

export {
    listLogs
};
