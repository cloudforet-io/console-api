import grpcClient from '@lib/grpc-client';


const listEventRules = async (params) => {
    const alertManagerV1 = await grpcClient.get('alert_manager', 'v1');
    return await alertManagerV1.EventRule.list(params);
};

export {
    listEventRules
};
