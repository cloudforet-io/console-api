import grpcClient from '@lib/grpc-client';
import _ from 'lodash';
import { Query } from '@lib/config/type';

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
    let query: Query = {};

    if (distinctKey === 'tags') {
        query = {
            distinct: 'tags.key',
            filter: []
        };
    } else if (distinctKey.startsWith('tags.')) {
        query = {
            distinct: 'tags.value',
            filter: []
        };
    } else {
        query = {
            distinct: distinctKey,
            filter: [
                {
                    'key': distinctKey,
                    'value': null,
                    'operator': 'not'
                }
            ]
        };
    }

    if (options.filter) {
        query.filter = _.merge(query.filter, _.cloneDeep(options.filter));
    }

    if (params.search  && distinctKey !== 'tags') {
        if (query.filter !== undefined) {
            query.filter.push({
                k: distinctKey,
                v: params.search,
                o: 'contain'
            });
        }
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
