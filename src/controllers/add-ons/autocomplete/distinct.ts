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
    const parameters = {
        ...(params.options?.parameters || {}),
        ...(params.extra_params || {})
    };
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

    if (options.limit) {
        if (!(params.search && (['labels', 'cost_tag_keys', 'cost_additional_info_keys'].includes(params.distinct_key) || params.distinct_key.indexOf('tag_keys.') === 0))) {
            query.page = {
                limit: options.limit
            };
        }
    }

    parameters.query = query;

    return parameters;
};

const changeTagsResults = (params, response, options) => {
    const tags: Array<string> = [];

    for (const tagsInfo of response.results) {
        for (const key of Object.keys(tagsInfo)) {
            const tagKey = key.trim().toLowerCase();

            if (params.search) {
                const searchKey = params.search.trim().toLowerCase();
                if (tagKey !== '' && String(tagKey).indexOf(searchKey) >= 0) {
                    tags.push(key);
                }
            } else {
                if (tagKey !== '') {
                    tags.push(key);
                }
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

const filterResults = (params, response, options) => {
    const searchValue = params.search?.trim().toLowerCase();
    const results = response.results.filter(value => {
        return value.trim().toLowerCase().indexOf(searchValue) >= 0;
    });

    if (options.limit) {
        return {
            results: results.slice(0, options.limit)
        };
    } else {
        return {
            results: results
        };
    }
};

const makeResponse = (params, response, options) => {
    if (params.distinct_key === 'tags') {
        response = changeTagsResults(params, response, options);
    } else if (params.search && (['labels', 'cost_tag_keys', 'cost_additional_info_keys'].includes(params.distinct_key) || params.distinct_key.indexOf('tag_keys.') === 0)) {
        response = filterResults(params, response, options);
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

    if (params.resource_type == 'cost_analysis.Cost' && params.distinct_key == 'tags') {
        params.resource_type = 'cost_analysis.DataSource';
        params.distinct_key = 'cost_tag_keys';
    } else if (params.resource_type == 'cost_analysis.Cost' && params.distinct_key == 'additional_info') {
        params.resource_type = 'cost_analysis.DataSource';
        params.distinct_key = 'cost_additional_info_keys';
    }

    const options = getOptions(params.options);
    const [service, resource] = parseResourceType(params.resource_type);
    const client = await getClient(service);

    const requestParams = makeRequest(params, options);
    console.log(requestParams);
    const response = await client[resource].stat(requestParams);
    return makeResponse(params, response, options);
};

export {
    getDistinctValues
};
