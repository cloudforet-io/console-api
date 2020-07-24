import ejs from 'ejs';
import grpcClient from '@lib/grpc-client';
import autoConfig from '@/add-ons/autocomplete/config.json';

const getClient = async (service, version) => {
    return await grpcClient.get(service, version);
};

const checkParameter = (params) => {
    if (!params.domain_id) {
        throw new Error('Required Parameter. (key = domain_id)');
    }

    const resourceType = params.resource_type;
    const supportedResourceTypes = Object.keys(autoConfig.resourceTypes);
    if (!resourceType) {
        throw new Error('Required Parameter. (key = resource_type)');
    }

    if (supportedResourceTypes.indexOf(resourceType) < 0) {
        throw new Error(`Resource type not supported. (${supportedResourceTypes.join('|')})`);
    }
};

const getOptions = (options) => {
    return {
        limit: (options && options.limit)
    };
};

const parseResourceType = (resourceType) => {
    let version = autoConfig.resourceTypes[resourceType].version || 'v1';
    const [service, resource] = resourceType.split('.');
    return [service, resource, version];
}

const makeRequest = (params, options) => {
    let query = {};
    const requestConfig = autoConfig.resourceTypes[params.resource_type].request;
    if (params.search) {
        query.filter_or = requestConfig.search.map((key) => {
            return {
                k: key,
                v: params.search,
                o: 'contain'
            };
        });
    }
    if (requestConfig.only) {
        query.only = requestConfig.only;
    } else {
        query.only = requestConfig.search;
    }

    if (options.limit) {
        query.page = {
            limit: options.limit
        };
    }

    return {
        domain_id: params.domain_id,
        query: query
    };
};

const makeResponse = (params, response) => {
    const responseConfig = autoConfig.resourceTypes[params.resource_type].response;
    const results = response.results.map((result) => {
        return {
            id: result[responseConfig.id],
            name: ejs.render(responseConfig.name, result)
        };
    });

    return {
        total_count: response.total_count,
        results: results
    };
};

const getAutocomplete = async (params) => {
    checkParameter(params);
    const options = getOptions(params.options);
    const [service, resource, version] = parseResourceType(params.resource_type);
    const client = await getClient(service, version);
    const requestParams = makeRequest(params, options);
    const response = await client[resource].list(requestParams);
    return makeResponse(params, response);
};

export {
    getAutocomplete
};
