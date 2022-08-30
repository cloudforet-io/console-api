import grpcClient from '@lib/grpc-client';
import { Query } from '@lib/grpc-client/type';

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
        limit: (options && options.limit),
        filter: (options && options.filter) || [],
        search_type: (options && options.search_type) || 'value'
    };
};

const parseResourceType = (resourceType) => {
    const [service, resource] = resourceType.split('.');
    return [service, resource];
};

const makeRequest = (params, options) => {
    const distinctKey = params.distinct_key;
    const query: Query = {
        distinct: distinctKey,
        filter: [
            {
                key: distinctKey,
                value: null,
                operator: 'not'
            }
        ]
    };

    if (options.filter) {
        query.filter = query.filter?.concat(options.filter);
    }

    if (params.search && distinctKey !== 'tags') {
        query.filter?.push({
            k: distinctKey,
            v: params.search,
            o: 'contain'
        });
    }

    if (options.limit && distinctKey !== 'tags') {
        query.page = {
            limit: options.limit
        };
    }

    return {
        query: query
    };
};

const changeTagsResults = (params, response, options) => {
    const tags: Array<string> = [];

    for (const tagsInfo of response.results) {
        for (const key of Object.keys(tagsInfo)) {
            if (params.search) {
                const searchKey = params.search.toLowerCase();
                if (String(key.toLowerCase()).indexOf(searchKey) >= 0) {
                    tags.push(key);
                }
            } else {
                tags.push(key);
            }

        }
    }

    let distinctTags = [...new Set(tags)];

    if (options.limit) {
        distinctTags = distinctTags.slice(0, options.limit);
    }

    return {
        results: distinctTags
    };
};

const makeResponse = (params, response, options) => {
    if (params.distinct_key === 'tags') {
        response = changeTagsResults(params, response, options);
    }

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
    return makeResponse(params, response, options);
};

export {
    getDistinctValues
};
