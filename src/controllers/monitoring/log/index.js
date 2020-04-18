import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const listLogs = async (params) => {
    let monitoringV1 = await grpcClient.get('monitoring', 'v1');
    let response = await monitoringV1.Log.list(params);

    return response;
};

export {
    listLogs,
};
