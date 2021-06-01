import grpcClient from '@lib/grpc-client';

const createEscalationPolicy = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.EscalationPolicy.create(params);

    return response;
};

const updateEscalationPolicy = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.EscalationPolicy.update(params);

    return response;
};

const setDefaultEscalationPolicy = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.EscalationPolicy.setDefault(params);

    return response;
};

const deleteEscalationPolicy = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.EscalationPolicy.delete(params);

    return response;
};

const getEscalationPolicy = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.EscalationPolicy.get(params);

    return response;
};

const listEscalationPolicies = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.EscalationPolicy.list(params);

    return response;
};

const statEscalationPolicies = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.EscalationPolicy.stat(params);

    return response;
};

export {
    createEscalationPolicy,
    updateEscalationPolicy,
    setDefaultEscalationPolicy,
    deleteEscalationPolicy,
    getEscalationPolicy,
    listEscalationPolicies,
    statEscalationPolicies
};
