import _ from 'lodash';
import { statCloudServices } from '@controllers/inventory/cloud-service';
import { requestCache } from './request-cache';

const getDefaultQuery = () => {
    return {
        query: {
            aggregate: [{
                group: {
                    keys: [
                        {
                            key: 'provider',
                            name: 'provider'
                        },
                        {
                            key: 'region_code',
                            name: 'region_code'
                        },
                        {
                            key: 'cloud_service_group',
                            name: 'cloud_service_group'
                        },
                        {
                            key: 'cloud_service_type',
                            name: 'cloud_service_type'
                        }
                    ],
                    fields: [
                        {
                            name: 'count',
                            operator: 'count'
                        }
                    ]
                }
            }, {
                group: {
                    keys: [
                        {
                            key: 'provider',
                            name: 'provider'
                        },
                        {
                            key: 'region_code',
                            name: 'region_code'
                        }
                    ],
                    fields: [
                        {
                            name: 'total_count',
                            key: 'count',
                            operator: 'sum'
                        },
                        {
                            name: 'cloud_services',
                            operator: 'push',
                            fields: [
                                {
                                    key: 'cloud_service_group',
                                    name: 'cloud_service_group'
                                },
                                {
                                    key: 'cloud_service_type',
                                    name: 'cloud_service_type'
                                },
                                {
                                    key: 'count',
                                    name: 'count'
                                }
                            ]
                        }
                    ]
                }
            }, {
                sort: {
                    key: 'total_count',
                    desc: true

                }
            }],
            filter: [
                {
                    k: 'ref_cloud_service_type.is_major',
                    v: true,
                    o: 'eq'
                },
                {
                    k: 'region_code',
                    v: [null, 'global'],
                    o: 'not_in'
                }
            ]
        }
    };
};

const makeRequest = (params) => {
    const requestParams = getDefaultQuery();

    if (params.project_id) {
        requestParams.query.filter.push({
            k: 'project_id',
            v: params.project_id,
            o: 'eq'
        });
    }

    if (params.providers) {
        if (!Array.isArray(params.providers)) {
            throw new Error('Parameter type is invalid. (providers = Array)');
        }

        requestParams.query.filter.push({
            k: 'provider',
            v: params.providers,
            o: 'in'
        });
    }

    if (params.domain_id) {
        requestParams['domain_id'] = params.domain_id;
    }

    return requestParams;
};


const makeResponse = (response) => {
    for (const result of response.results) {
        result.cloud_services = _.sortBy(result.cloud_services, 'count').reverse();
        result.cloud_services = result.cloud_services.slice(0, 10);
    }

    return response;
};

const requestStat = async (params) => {
    const requestParams = makeRequest(params);
    const response = await statCloudServices(requestParams);

    return makeResponse(response);
};

const resourceByRegion = async (params) => {
    return await requestCache('stat:resourceByRegion', params, requestStat);
};

export default resourceByRegion;
