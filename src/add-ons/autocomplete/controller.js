import ejs from 'ejs';
import grpcClient from '@lib/grpc-client';
import autoConfig from '@/add-ons/autocomplete/config.json';

const getClient = async (service) => {
    return await grpcClient.get(service);
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

    if (!params.distinct && supportedResourceTypes.indexOf(resourceType) < 0) {
        throw new Error(`Resource type not supported. (${supportedResourceTypes.join('|')})`);
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
}
const makeDistinctRequest = (params, options) => {
    let query = {
        distinct: params.distinct
    };

    if (params.search) {
        query.filter = [{
            k: params.distinct,
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
        domain_id: params.domain_id,
        query: query
    };
};

const makeListRequest = (params, options) => {
    let query = {};
    const requestConfig = autoConfig.resourceTypes[params.resource_type].request;
    if (params.search) {
        query.filter_or = requestConfig.search.map((key) => {
            return {
                k: key,
                v: params.search,
                o: 'contain',
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

const makeDistinctResponse = (params, response) => {
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

const makeListResponse = (params, response) => {
    const responseConfig = autoConfig.resourceTypes[params.resource_type].response;
    const results = response.results.map((result) => {
        return {
            key: result[responseConfig.id],
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
    const [service, resource] = parseResourceType(params.resource_type);
    const client = await getClient(service);

    if (params.distinct) {
        const requestParams = makeDistinctRequest(params, options);
        const response = await client[resource].stat(requestParams);
        return makeDistinctResponse(params, response);
    } else {
        const requestParams = makeListRequest(params, options);
        const response = await client[resource].list(requestParams);
        return makeListResponse(params, response);
    }
};

export {
    getAutocomplete
};
