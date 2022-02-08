import config from 'config';
import redisClient from '@lib/redis';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { analyzeCosts } from '@controllers/cost-analysis/cost';
import { getBillingData } from '@controllers/billing/billing';
import { listCloudServiceTypes } from '@controllers/inventory/cloud-service-type';
import { requestCache } from './request-cache';

const SUPPORTED_AGGREGATION = ['inventory.CloudServiceType', 'inventory.Region'];
const SUPPORTED_GRANULARITY = ['DAILY', 'MONTHLY'];
const CACHE_KEY = 'cloud-service-type-service-code-map';

dayjs.extend(utc);

const getDefaultQuery = () => {
    return {
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
        requestParams['project_id'] = params.project_id;
    }

    if (params.domain_id) {
        requestParams['domain_id'] = params.domain_id;
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

const getBillingV2Data = async (params) => {
    if (params.granularity) {
        if (SUPPORTED_GRANULARITY.indexOf(params.granularity) < 0) {
            throw new Error(`granularity not supported. (support = ${SUPPORTED_GRANULARITY.join(' | ')})`);
        }
    }

    if (params.aggregation) {
        if (SUPPORTED_AGGREGATION.indexOf(params.aggregation) < 0) {
            throw new Error(`aggregation not supported. (support = ${SUPPORTED_AGGREGATION.join(' | ')})`);
        }
    }

    if (!params.start) {
        throw new Error('Required Parameter. (key = start)');
    }

    if (!params.end) {
        throw new Error('Required Parameter. (key = end)');
    }

    const requestParams: any = {
        granularity: params.granularity
    };

    const startTime = dayjs(params.start);
    let endTime = dayjs(params.end);

    if (params.start.length === 7) {
        endTime = endTime.add(1, 'month');
    } else {
        endTime = endTime.add(1, 'day');
    }

    requestParams.start = startTime.format('YYYY-MM-DD');
    requestParams.end = endTime.format('YYYY-MM-DD');

    if (params.project_id) {
        requestParams.filter = [
            {
                k: 'project_id',
                v: params.project_id,
                o: 'eq'
            }
        ];
    }

    if (params.aggregation === 'inventory.CloudServiceType') {
        requestParams.group_by = ['product', 'provider'];
    } else if (params.aggregation === 'inventory.Region') {
        requestParams.group_by = ['region_code', 'provider'];
    }

    const costsResponse = await analyzeCosts(requestParams);

    const response: any = {
        results: []
    };

    for (const costInfo of costsResponse.results) {
        let serviceCode, provider, regionCode;
        const billingData = Object.keys(costInfo.usd_cost).map((key) => {
            if (params.aggregation === 'inventory.CloudServiceType') {
                serviceCode = costInfo.product;
                provider = costInfo.provider;
            } else if (params.aggregation === 'inventory.Region') {
                regionCode = costInfo.region_code;
                provider = costInfo.provider;
            }

            return {
                date: key,
                currency: 'USD',
                cost: costInfo.usd_cost[key]
            };
        });

        const billingInfo: any = {
            billing_data: billingData
        };

        if (params.aggregation === 'inventory.CloudServiceType') {
            billingInfo['inventory.CloudServiceType'] = {
                service_code: serviceCode
            };

            billingInfo['identity.Provider'] = {
                provider: provider
            };
        } else if (params.aggregation === 'inventory.Region') {
            billingInfo['inventory.Region'] = {
                region_code: regionCode
            };

            billingInfo['identity.Provider'] = {
                provider: provider
            };
        }

        response.results.push(billingInfo);
    }

    response.total_count = response.results.length;

    return response;
};

const requestStat = async (params) => {
    if (config.get('billing.source') === 'v2') {
        const response = await getBillingV2Data(params);
        return makeResponse(params, response);
    } else {
        const requestParams = makeRequest(params);
        const response = await getBillingData(requestParams);
        return makeResponse(params, response);
    }
};

const billingSummary = async (params) => {
    return await requestCache('stat:billingSummary', params, requestStat);
};

export default billingSummary;
