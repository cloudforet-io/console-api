import redisClient from '@lib/redis';
import ejs from 'ejs';
import _ from 'lodash';

import autoConfig from '@controllers/add-ons/autocomplete/config.json';
import grpcClient from '@lib/grpc-client';
import { Filter } from '@lib/grpc-client/type';

interface Query {
    filter?: object[];
    filter_or?: object[];
    page?: object;
    only?: string[];
}

interface Options {
    limit?: number;
    filter: Filter[];
    targets?: string[];
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

const getOptions = (options): Options => {
    return {
        limit: (options && options.limit),
        filter: (options && options.filter) || [],
        targets: options ? options.targets : undefined
    };
};

const parseResourceType = (resourceType) => {
    const [service, resource] = resourceType.split('.');
    return [service, resource];
};

const makeRequest = (params, options: Options) => {
    const parameters = params.options?.parameters || {};
    const query: Query = {};
    const requestConfig = autoConfig.resourceTypes[params.resource_type].request;

    if (options.filter) {
        query.filter = _.cloneDeep(options.filter);
    }

    if (params.search) {
        const searchTargets = options.targets ?? requestConfig.search;
        query.filter_or = searchTargets.map((key) => {
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

    parameters.query = query;

    return parameters;
};

interface AutocompleteResource {
    key: string;
    name: string;
    data?: Record<string, string>;
}

const getProjectGroupMap = async () => {
    const client = await getClient('identity');
    const response = await client.ProjectGroup.list(
        {
            query: {
                only: ['project_group_id', 'name']
            }
        }
    );

    const projectGroupMap = {};
    response.results.forEach((projectGroupInfo) => {
        projectGroupMap[projectGroupInfo.project_group_id] = projectGroupInfo.name;
    });

    return projectGroupMap;
};

const makeResponse = async (params, resources, resourceType) => {
    // let projectGroupMap = {};
    // if (resourceType == 'identity.Project') {
    //     projectGroupMap = await getProjectGroupMap();
    // }

    const { key, name, data } = autoConfig.resourceTypes[params.resource_type].response as AutocompleteResource;
    const results = resources.results.map((resource) => {
        const result: AutocompleteResource = {
            key: resource[key],
            name: ejs.render(name, resource)
        };

        // if (resourceType == 'identity.Project') {
        //     const projectGroupName = projectGroupMap[resource.project_group_id];
        //     if (projectGroupName)
        //     {
        //         result.name = `${projectGroupName} > ${result.name}`;
        //     }
        // }

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
    return makeResponse(params, response, params.resource_type);
};

export {
    getResources
};
