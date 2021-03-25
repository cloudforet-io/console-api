import logger from '@lib/logger';
import httpContext from 'express-http-context';
import redisClient from '@lib/redis';
import { BillingSummaryFactory } from '@factories/statistics/topic/billing-summary';
import { getBillingData } from '@controllers/billing/billing';
import { listCloudServiceTypes } from '@controllers/inventory/cloud-service-type';
import { requestCache } from './request-cache';

const SUPPORTED_AGGREGATION = ['inventory.CloudServiceType', 'inventory.Region'];
const SUPPORTED_GRANULARITY = ['DAILY', 'MONTHLY'];
const CACHE_KEY = 'cloud-service-type-service-code-map';

const getDefaultQuery = () => {
    return {
        project_id: '',
        aggregation: [] as any,
        granularity: undefined,
        start: undefined,
        end: undefined,
        limit: undefined
    };
};

const makeRequest = (params) => {
    const requestParams = getDefaultQuery();

    if (params.project_id) {
        requestParams.project_id = params.project_id;
    }

    if (params.aggregation) {
        if (SUPPORTED_AGGREGATION.indexOf(params.aggregation) < 0) {
            throw new Error(`aggregation not supported. (support = ${SUPPORTED_AGGREGATION.join(' | ')})`);
        }

        if (params.aggregation) {
            requestParams.aggregation = ['identity.Provider', params.aggregation];
        }
    }

    if (params.granularity) {
        if (SUPPORTED_GRANULARITY.indexOf(params.granularity) < 0) {
            throw new Error(`granularity not supported. (support = ${SUPPORTED_GRANULARITY.join(' | ')})`);
        }

        requestParams.granularity = params.granularity;
    }

    if (!params.start) {
        throw new Error('Required Parameter. (key = start)');
    }

    if (!params.end) {
        throw new Error('Required Parameter. (key = end)');
    }

    requestParams.start = params.start;
    requestParams.end = params.end;

    if (params.limit) {
        requestParams.limit = params.limit;
    }

    return requestParams;
};

const getCloudServiceTypeMap = async () => {
    let cloudServiceTypeMap = {};
    const redis = await redisClient.connect();
    // const cloudServiceTypeCache = await redis.get(CACHE_KEY);
    const cloudServiceTypeCache = false;
    if (cloudServiceTypeCache) {
        cloudServiceTypeMap = JSON.parse(cloudServiceTypeCache);
    } else {
        const params = {
            query: {
                only: ['provider', 'group', 'service_code']
            },
            is_primary: true
        };

        const response = await listCloudServiceTypes(params);

        response.results.forEach((cloudServiceTypeInfo) => {
            if (cloudServiceTypeInfo.service_code) {
                cloudServiceTypeMap[cloudServiceTypeInfo.service_code] = {
                    cloud_service_group: cloudServiceTypeInfo.group,
                    cloud_service_type: cloudServiceTypeInfo.name
                };
            }
        });

        redis.set(CACHE_KEY, JSON.stringify(cloudServiceTypeMap), 3600);
    }

    return cloudServiceTypeMap;
};

const makeResponse = async (params, response) => {
    let cloudServiceTypeMap = {};

    if (params.aggregation === 'inventory.CloudServiceType') {
        cloudServiceTypeMap = await getCloudServiceTypeMap();
    }

    const results = response.results.map((result) => {
        if (result.resource_type) {
            delete result['resource_type'];
        }

        if (params.aggregation === 'inventory.CloudServiceType') {
            result.service_code = result['inventory.CloudServiceType']['service_code'];
            result.provider = result['identity.Provider']['provider'];
            if (cloudServiceTypeMap[result.service_code]) {
                result.cloud_service_type = cloudServiceTypeMap[result.service_code].cloud_service_type;
                result.cloud_service_group = cloudServiceTypeMap[result.service_code].cloud_service_group;
            } else {
                result.cloud_service_type = null;
                result.cloud_service_group = null;
            }

            delete result['inventory.CloudServiceType'];
            delete result['identity.Provider'];
        } else if (params.aggregation === 'inventory.Region') {
            result.region_code = result['inventory.Region']['region_code'];
            result.provider = result['identity.Provider']['provider'];

            delete result['inventory.Region'];
            delete result['identity.Provider'];
        }

        return result;
    });

    return {
        results: results,
        total_count: response.total_count
    };
};

const requestStat = async (params) => {
    if (httpContext.get('mock_mode')) {
        if (params.aggregation) {
            return {
                results: BillingSummaryFactory.buildBatch(10, params)
            };
        } else {
            return {
                results: BillingSummaryFactory.buildBatch(1, params)
            };
        }
    }

    const requestParams = makeRequest(params);
    const response = await getBillingData(requestParams);

    return makeResponse(params, response);
};

const billingSummary = async (params) => {
    return await requestCache('stat:billingSummary', params, requestStat);
};

export default billingSummary;
