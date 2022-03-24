import _ from 'lodash';
import ejs from 'ejs';
import grpcClient from '@lib/grpc-client';
import autoConfig from '@controllers/add-ons/autocomplete/config.json';

interface Query {
    filter?: object[];
    filter_or?: object[];
    page?: object;
    only?: string[];
}

const getClient = async (service) => {
    return await grpcClient.get(service);
};

const checkParameter = (params) => {
    const resourceType = params.resource_type;
    const supportedResourceTypes = Object.keys(autoConfig.resourceTypes);
    if (!resourceType) {
        throw new Error('Required Parameter. (key = resource_type)');
    }

    if (supportedResourceTypes.indexOf(resourceType) < 0) {
        throw new Error(`Resource type not supported. (support = ${supportedResourceTypes.join(' | ')})`);
    }
};

const getOptions = (options) => {
    return {
        limit: (options && options.limit),
        filter: (options && options.filter) || []
    };
};

const parseResourceType = (resourceType) => {
    const [service, resource] = resourceType.split('.');
    return [service, resource];
};

const makeRequest = (params, options) => {
    const query: Query = {};
    const requestConfig = autoConfig.resourceTypes[params.resource_type].request;

    if (options.filter) {
        query.filter = _.cloneDeep(options.filter);
    }

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
        query: query
    };
};

interface AutocompleteResource {
    key: string;
    name: string;
    data?: Record<string, string>;
}
const makeResponse = (params, resources) => {
    const { key, name, data } = autoConfig.resourceTypes[params.resource_type].response as AutocompleteResource;
    const results = resources.results.map((resource) => {
        const result: AutocompleteResource = {
            key: resource[key],
            name: ejs.render(name, resource)
        };
        if (data) {
            const _data = {};
            Object.keys(data).forEach(key => {
                _data[key] = ejs.render(data[key], resource);
            });
            result.data = _data;
        }
        return result;
    });

    return {
        total_count: resources.total_count,
        results: results
    };
};

const getResources = async (params) => {
    checkParameter(params);
    const options = getOptions(params.options);
    const [service, resource] = parseResourceType(params.resource_type);
    const client = await getClient(service);

    const requestParams = makeRequest(params, options);
    const response = await client[resource].list(requestParams);
    return makeResponse(params, response);
};

export {
    getResources
};
