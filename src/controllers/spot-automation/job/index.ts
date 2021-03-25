import grpcClient from '@lib/grpc-client';

const listJobs = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    const response = await spotAutomationV1.Job.list(params);

    return response;
};

const statJobs = async (params) => {
    const spotAutomationV1 = await grpcClient.get('spot_automation', 'v1');
    const response = await spotAutomationV1.Job.stat(params);

    return response;
};

export {
    listJobs,
    statJobs
};
