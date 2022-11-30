import hash from 'object-hash';
import httpContext from 'express-http-context';
import grpcClient from '@lib/grpc-client';
import redisClient from '@lib/redis';
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

const listCloudServiceIds = async (client, filter) => {
    const redis = await redisClient.connect();
    const filterHash = hash(filter);
    const userId = httpContext.get('user_id');
    const domainId = httpContext.get('domain_id');
    const cacheKey = `cloud-service-ids:${domainId}:${userId}:${filterHash}`;
    const cacheValue = await redis.get(cacheKey);
    if (cacheValue) {
        return JSON.parse(<string>cacheValue);
    }

    const query = {
        filter: [],
        only: ['cloud_service_id']
    };
    query.filter = query.filter?.concat(filter);

    const response = await client.CloudService.list({ query });
    const cloudServiceIds = response.results.map((cloudServiceInfo) => {
        return cloudServiceInfo.cloud_service_id;
    });

    await redis.set(cacheKey, JSON.stringify(cloudServiceIds), 600);

    return cloudServiceIds;
};

const listCloudServiceTagKeys = async (client, params, options) => {
    const cloudServiceIds = await listCloudServiceIds(client, options.filter);
    const query: Query = {
        distinct: 'key',
        filter: [
            {
                k: 'cloud_service_id',
                v: cloudServiceIds,
                o: 'in'
            },
            {
                k: 'key',
                v: null,
                o: 'not'
            },
            {
                k: 'key',
                v: '',
                o: 'not'
            }
        ]
    };

    if (params.search) {
        query.filter?.push({
            k: 'key',
            v: params.search,
            o: 'contain'
        });
    }

    if (options.limit) {
        query.page = {
            limit: options.limit
        };
    }

    const response = await client.CloudServiceTag.stat({ query });
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

const listCloudServiceTagValues = async (client, params, options) => {
    const cloudServiceIds = await listCloudServiceIds(client, options.filter);
    const tagValue = params.distinct_key.replace('tags.', '');
    const query: Query = {
        distinct: 'value',
        filter: [
            {
                k: 'cloud_service_id',
                v: cloudServiceIds,
                o: 'in'
            },
            {
                k: 'key',
                v: tagValue,
                o: 'eq'
            }
        ]
    };

    if (params.search) {
        query.filter?.push({
            k: 'value',
            v: params.search,
            o: 'contain'
        });
    }

    if (options.limit) {
        query.page = {
            limit: options.limit
        };
    }

    const response = await client.CloudServiceTag.stat({ query });
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

const listCostKeys = async (client, params, options) => {
    let distinctKey;
    if (params.distinct_key === 'tags') {
        distinctKey = 'cost_tag_keys';
    } else {
        distinctKey = 'cost_additional_info_keys';
    }

    const query: Query = {
        distinct: distinctKey
    };

    if (options.filter) {
        query.filter = query.filter?.concat(options.filter);
    }

    if (options.limit) {
        query.page = {
            limit: options.limit
        };
    }

    const response = await client.DataSource.stat({ query });

    if (params.search) {
        const searchKey = params.search.toLowerCase();
        response.results = response.results.filter((result) => {
            return result.toLowerCase().indexOf(searchKey) >= 0;
        });
    }

    const total_count = response.results.length;

    const results = response.results.map((result) => {
        return {
            key: result,
            name: result
        };
    });

    return {
        total_count: total_count,
        results: results
    };
};

const getDistinctValues = async (params) => {
    checkParameter(params);
    const options = getOptions(params.options);
    const [service, resource] = parseResourceType(params.resource_type);
    const client = await getClient(service);

    if (params.resource_type == 'cost_analysis.Cost' && ['tags', 'additional_info'].indexOf(params.distinct_key) >= 0) {
        return await listCostKeys(client, params, options);
    } else if (params.resource_type == 'inventory.CloudService' && params.distinct_key == 'tags') {
        return await listCloudServiceTagKeys(client, params, options);
    } else if (params.resource_type == 'inventory.CloudService' && params.distinct_key.indexOf('tags.') === 0) {
        return await listCloudServiceTagValues(client, params, options);
    } else {
        const requestParams = makeRequest(params, options);
        const response = await client[resource].stat(requestParams);
        return makeResponse(params, response, options);
    }
};

export {
    getDistinctValues
};
