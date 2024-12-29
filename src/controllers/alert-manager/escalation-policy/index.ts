import grpcClient from '@lib/grpc-client';


const listEscalationPolicies = async (params) => {
    const alertManagerV1 = await grpcClient.get('alert_manager', 'v1');
    return await alertManagerV1.EscalationPolicy.list(params);
};

export {
    listEscalationPolicies
};
