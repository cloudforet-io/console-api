import grpcClient from '@lib/grpc-client';

const createPolicy = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.Policy.create(params);

    return response;
};

const updatePolicy = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.Policy.update(params);

    return response;
};

const deletePolicy = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.Policy.delete(params);

    return response;
};

const getPolicy = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.Policy.get(params);

    return response;
};

const listPolicies = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const identityResponse = await identityV1.Policy.list(params);

    /*1. Collect all repository_id
    2. Collect repository.Policy with the set of repository_id
    3. Merge repository.Policy into identity.Policy*/
    const repositoryV1 = await grpcClient.get('repository', 'v1');
    const repositories = await repositoryV1.Repository.list(params);
    const repositoryPromise = repositories.results.map(d => (repositoryV1.Policy.list({ ...params, repository_id: d.repository_id })));
    const repositoryResponse = await Promise.allSettled(repositoryPromise);

    const policies = [...identityResponse.results];
    repositoryResponse.forEach(d => {
        if (d.status === 'fulfilled') {
            d.value.results.forEach(policy => policies.push(policy));
        }
    });

    return {
        results: policies,
        total_count: policies.length
    };
};

const statPolicies = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const response = await identityV1.Policy.stat(params);

    return response;
};

export {
    createPolicy,
    updatePolicy,
    deletePolicy,
    getPolicy,
    listPolicies,
    statPolicies
};
