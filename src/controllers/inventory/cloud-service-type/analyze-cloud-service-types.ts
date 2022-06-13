import { cloneDeep } from 'lodash';

import { listCloudServiceTypes } from '@controllers/inventory/cloud-service-type';
import { statResource } from '@controllers/statistics/resource';
import { requestCache } from '@controllers/statistics/topic/request-cache';

const CLOUD_SERVICE_TYPE_KEYS = ['cloud_service_type_id', 'provider', 'cloud_service_group', 'cloud_service_type', 'service_code', 'labels', 'is_primary', 'is_major'];

const getDefaultQuery: any = () => {
    return {
        aggregate: [
            {
                query: {
                    resource_type: 'inventory.CloudService',
                    query: {
                        aggregate: [
                            {
                                group: {
                                    keys: [
                                        { name: 'provider', key: 'provider' },
                                        { name: 'cloud_service_group', key: 'cloud_service_group' },
                                        { name: 'cloud_service_type', key: 'cloud_service_type' }
                                    ],
                                    fields: [
                                        { name: 'count', operator: 'count' }
                                    ]
                                }
                            },
                            {
                                sort: {
                                    key: 'cloud_service_type'
                                }
                            },
                            {
                                group: {
                                    keys: [
                                        { name: 'provider', key: 'provider' },
                                        { name: 'cloud_service_group', key: 'cloud_service_group' }
                                    ],
                                    fields: [
                                        {
                                            name: 'cloud_services',
                                            operator: 'push',
                                            fields: [
                                                { name: 'cloud_service_type', key: 'cloud_service_type' },
                                                { name: 'count', key: 'count' }
                                            ]
                                        }
                                    ]
                                }
                            }
                        ],
                        filter: []
                    }
                }
            },
            {
                sort: {
                    key: 'cloud_service_group'
                }
            }
        ]
    };
};

const makeRequest = (params) => {
    const requestParams = getDefaultQuery();

    if (params.filter) {
        requestParams.aggregate[0].query.query.filter = cloneDeep(params.filter);
    }

    if (params.page) {
        requestParams.page = cloneDeep(params.page);
    }

    if (params.domain_id) {
        requestParams['domain_id'] = params.domain_id;
    }

    if (params.date_range) {
        const start = params.date_range.start;
        const end = params.date_range.end;
        if (!start) {
            throw new Error('Required Parameter. (key = date_range.start)');
        }

        if (!end) {
            throw new Error('Required Parameter. (key = date_range.end)');
        }

        requestParams.aggregate[0].query.query.filter.push(
            { k: 'state', v: ['ACTIVE', 'DELETED'], o: 'in' }
        );
        requestParams.aggregate[0].query.query.filter.push(
            { k: 'created_at', v: end, o: 'datetime_lte' }
        );
        requestParams.aggregate[0].query.query.filter_or = [
            { k: 'deleted_at', v: start, o: 'datetime_gt' },
            { k: 'deleted_at', v: null, o: 'eq' }
        ];
    }

    return requestParams;
};

const splitFilter = (params) => {
    const filter = params.filter || [];
    const cloudServiceTypeFilter: any[] = [];
    const cloudServiceFilter: any[] = [];

    for (const condition of filter) {
        const key = condition.key || condition.k;
        if (CLOUD_SERVICE_TYPE_KEYS.includes(key)) {

            if (key === 'cloud_service_group') {
                condition.key = 'group';
                condition.k = 'group';
            } else if (key === 'cloud_service_type') {
                condition.key = 'name';
                condition.k = 'name';
            }

            cloudServiceTypeFilter.push(condition);
        } else {
            cloudServiceFilter.push(condition);
        }
    }

    return [cloudServiceFilter, cloudServiceTypeFilter];

};

const getCloudServiceTypes = async (filter, keyword) => {
    const query: any = {
        filter: filter,
        only: ['domain_id', 'provider', 'group', 'name', 'tags'],
        sort: {
            key: 'name',
            desc: true
        }
    };

    query.filter.push({ key: 'is_primary', value: true, operator: 'eq' });

    if (keyword) {
        query.keyword = keyword;
    }

    const refCloudServiceTypes: string[] = [];
    const iconMap: any = {};
    const response: any = await listCloudServiceTypes({ query });
    for (const data of response.results || []) {
        refCloudServiceTypes.push(`${data.domain_id}.${data.provider}.${data.group}.${data.name}`);
        if (data.tags['spaceone:icon']) {
            iconMap[`${data.provider}.${data.group}`] = data.tags['spaceone:icon'];
        }
    }

    return [refCloudServiceTypes, iconMap];
};

const mergeFilter = (cloudServiceFilter, refCloudServiceTypes) => {
    cloudServiceFilter.push({
        k: 'ref_cloud_service_type',
        v: refCloudServiceTypes,
        o: 'in'

    });

    return cloudServiceFilter;
};

const mergeResources = (results = [], iconMap: any) => {
    const changedResults: any[] = [];
    for (const { cloud_service_group, provider, cloud_services } of results) {
        const CloudServices = cloud_services || [];
        changedResults.push({
            provider: provider,
            cloud_service_group: cloud_service_group,
            resources: CloudServices,
            icon: iconMap[`${provider}.${cloud_service_group}`]
        });
    }

    return changedResults;
};

const requestStat = async (params) => {
    const [cloudServiceFilter, cloudServiceTypeFilter] = splitFilter(params);
    const [refCloudServiceTypes, iconMap] = await getCloudServiceTypes(cloudServiceTypeFilter, params.keyword);
    if (refCloudServiceTypes.length > 0) {
        params.filter = mergeFilter(cloudServiceFilter, refCloudServiceTypes);
        const requestParams = makeRequest(params);
        const response = await statResource(requestParams);
        response.results = mergeResources(response.results, iconMap);
        return response;
    } else {
        return {
            results: [],
            total_count: 0
        };
    }
};

export const analyzeCloudServiceTypes = async (params) => {
    return await requestCache('stat:analyzeCloudServiceTypes', params, requestStat);
};
