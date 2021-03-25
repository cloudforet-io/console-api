import ejs from 'ejs';
import grpcClient from '@lib/grpc-client';
import pageConfig from '@controllers/add-ons/page-discovery/config.json';
import { Query } from '@lib/config/type';

const getClient = async (service, version) => {
    return await grpcClient.get(service, version);
};

const checkParameter = (params) => {
    const resourceType = params.resource_type;
    const supportedResourceTypes = Object.keys(pageConfig.resourceTypes);
    if (!resourceType) {
        throw new Error('Required Parameter. (key = resource_type)');
    }

    if (supportedResourceTypes.indexOf(resourceType) < 0) {
        throw new Error(`Resource type not supported. (support = ${supportedResourceTypes.join(' | ')})`);
    }

    if (!params.search) {
        throw new Error('Required Parameter. (key = search)');
    }
};

const parseResourceType = (resourceType) => {
    const version = pageConfig.resourceTypes[resourceType].version || 'v1';
    const [service, resource] = resourceType.split('.');
    return [service, resource, version];
};

const makeRequest = (params) => {
    const query: Query = {};
    const requestConfig = pageConfig.resourceTypes[params.resource_type].request;

    query.filter_or = requestConfig.search.map((key) => {
        return {
            k: key,
            v: params.search,
            o: 'contain'
        };
    });
    // if (!params.search_key) {
    //     query.filter_or = requestConfig.search.map((key) => {
    //         return {
    //             k: key,
    //             v: params.search,
    //             o: 'contain'
    //         };
    //     });
    // } else {
    //     query.filter = [{
    //         k: params.search_key,
    //         v: params.search,
    //         o: 'contain'
    //     }];
    // }

    if (requestConfig.only) {
        query.only = requestConfig.only;
    } else {
        query.only = requestConfig.search;
    }

    return {
        domain_id: params.domain_id,
        query: query
    };
};

const makeResponse = (params, response) => {
    if (response.total_count > 0) {
        if (params.resource_type === 'inventory.CloudServiceType') {
            const cloudServiceTypeInfo = response.results[0];
            if (cloudServiceTypeInfo.resource_type) {
                return {
                    exists: true,
                    url: ejs.render(pageConfig.resourceTypes[params.resource_type].url[cloudServiceTypeInfo.resource_type], cloudServiceTypeInfo)
                };
            } else {
                return {
                    exists: false,
                    url: pageConfig.resourceTypes[params.resource_type].defaultUrl
                };
            }
        } else {
            return {
                exists: true,
                url: ejs.render(pageConfig.resourceTypes[params.resource_type].url, response.results[0])
            };
        }
    } else {
        return {
            exists: false,
            url: pageConfig.resourceTypes[params.resource_type].defaultUrl
        };
    }
};

const getPageUrl = async (params) => {
    checkParameter(params);
    const [service, resource, version] = parseResourceType(params.resource_type);
    const client = await getClient(service, version);
    const requestParams = makeRequest(params);
    const response = await client[resource].list(requestParams);
    return makeResponse(params, response);
};

export {
    getPageUrl
};
