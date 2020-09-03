import grpcClient from '@lib/grpc-client';

const getClient = async (service) => {
    return await grpcClient.get(service);
};

const checkParameter = (params) => {
    if (!params.resource_type) {
        throw new Error('Required Parameter. (key = resource_type)');
    }

    if (!params.distinct_key) {
        throw new Error('Required Parameter. (key = distinct_key)');
    }
};

const getOptions = (options) => {
    return {
        limit: (options && options.limit)
    };
};

const parseResourceType = (resourceType) => {
    const [service, resource] = resourceType.split('.');
    return [service, resource];
};

const makeRequest = (params, options) => {
    let query = {
        distinct: params.distinct_key
    };

    if (params.search) {
        query.filter = [{
            k: params.distinct_key,
            v: params.search,
            o: 'contain'
        }];
    }

    if (options.limit) {
        query.page = {
            limit: options.limit
        };
    }

    return {
        query: query
    };
};

const makeResponse = (params, response) => {
    const results = response.results.map((result) => {
        return {
            key: result,
            name: result
        };
    });

    return {
        total_count: response.total_count,
        results: results
    };
};

const getDistinctValues = async (params) => {
    checkParameter(params);
    const options = getOptions(params.options);
    const [service, resource] = parseResourceType(params.resource_type);
    const client = await getClient(service);

    const requestParams = makeRequest(params, options);
    const response = await client[resource].stat(requestParams);
    return makeResponse(params, response);
};

export {
    getDistinctValues
};
