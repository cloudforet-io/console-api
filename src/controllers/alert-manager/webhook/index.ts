import grpcClient from '@lib/grpc-client';


const listWebhooks = async (params) => {
    const alertManagerV1 = await grpcClient.get('alert_manager', 'v1');
    return await alertManagerV1.Webhook.list(params);
};

export {
    listWebhooks
};
