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


const listIdentityPolicy = async (params) => {
    const identityV1 = await grpcClient.get('identity', 'v1');
    const { results, total_count } = await identityV1.Policy.list(params);
    const _results = results.map((d) => ({
        ...d,
        policy_type: 'CUSTOM'
    }));
    return { results: _results, total_count };
};
const listRepositoryPolicy = async (params) => {
    /**
     * 1. Collect all repository_id
     * 2. Collect repository.Policy with the set of repository_id
     * 3. Merge repository.Policy into identity.Policy
    */
    const repositoryV1 = await grpcClient.get('repository', 'v1');
    const { results: repositoryResults } = await repositoryV1.Repository.list(params);
    const repositoryResponse = await Promise.allSettled(repositoryResults.map(d => (
        repositoryV1.Policy.list({ ...params, repository_id: d.repository_id })
    )));
    let results = [];
    let totalCount = 0;
    repositoryResponse.forEach((res) => {
        if (res.status === 'fulfilled') {
            const _totalCount = res.value.total_count;
            const _results = res.value.results.map((r) => ({
                ...r,
                policy_type: 'MANAGED'
            }));
            results = results.concat(_results);
            totalCount += _totalCount;
        }
    });
    return { results, total_count: totalCount };
};
const listPolicies = async (params) => {
    const [identityResponse, repositoryResponse] = await Promise.all([
        listIdentityPolicy(params),
        listRepositoryPolicy(params)
    ]);
    const policyResults = repositoryResponse.results.concat(identityResponse.results);
    return {
        results: policyResults,
        total_count: identityResponse.total_count + repositoryResponse.total_count
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
