import { cloneDeep } from 'lodash';
import { statCosts } from '@controllers/cost-analysis/cost';

const GRANULARITY_FORMAT = {
    DAILY: '%Y-%m-%d',
    MONTHLY: '%Y-%m',
    YEARLY: '%Y',
    ACCUMULATED: null
};

const getDefaultQuery: any = () => {
    return {
        query: {
            aggregate: [
                {
                    group: {
                        keys: [],
                        fields: [
                            {
                                key: 'usd_cost',
                                name: 'usd_cost',
                                operator: 'sum'
                            }
                        ]
                    }
                }],
            filter: []
        }
    };
};

const makeRequest = (params) => {
    const requestParams = getDefaultQuery();

    if (!params.start) {
        throw new Error('Required Parameter. (key = start)');
    }

    if (!params.end) {
        throw new Error('Required Parameter. (key = end)');
    }

    if (params.group_by) {
        if (Array.isArray(params.group_by)) {
            for (const groupKey of params.group_by) {
                requestParams.query.aggregate[0].group.keys.push({
                    key: groupKey,
                    name: groupKey
                });
            }
        }
    }

    if (!Object.keys(GRANULARITY_FORMAT).includes(params.granularity)) {
        throw new Error(`granularity not supported. (support = ${Object.keys(GRANULARITY_FORMAT).join(' | ')})`);
    }

    if (params.granularity === 'ACCUMULATED') {
        requestParams.query.aggregate.push({
            sort: {
                key: 'usd_cost',
                desc: true
            }
        });

        if (params.limit) {
            requestParams.query.aggregate.push({
                limit: params.limit
            });
        }

    } else {
        requestParams.query.aggregate[0].group.keys.push({
            key: 'billed_at',
            name: 'date',
            date_format: GRANULARITY_FORMAT[params.granularity]
        });

        if (['TABLE', 'CHART'].includes(params.pivot_type)) {
            if (params.pivot_type === 'CHART') {
                requestParams.query.aggregate.push({
                    group: {
                        keys: [],
                        fields: [
                            {
                                name: 'values',
                                operator: 'push',
                                fields: [
                                    {
                                        key: 'date',
                                        name: 'date'
                                    },
                                    {
                                        key: 'usd_cost',
                                        name: 'usd_cost'
                                    }
                                ]
                            },
                            {
                                key: 'usd_cost',
                                name: 'total_usd_cost',
                                operator: 'sum'
                            }
                        ]
                    }
                });

                if (params.group_by) {
                    if (Array.isArray(params.group_by)) {
                        for (const groupKey of params.group_by) {
                            requestParams.query.aggregate[1].group.keys.push({
                                key: groupKey,
                                name: groupKey
                            });
                        }
                    }
                }

                requestParams.query.aggregate.push({
                    sort: {
                        key: 'total_usd_cost',
                        desc: true
                    }
                });

                if (params.limit) {
                    requestParams.query.aggregate.push({
                        limit: params.limit
                    });
                }

                requestParams.query.aggregate.push({
                    unwind: {
                        path: 'values'
                    }
                });

                requestParams.query.aggregate.push({
                    group: {
                        keys: [
                            {
                                name: 'date',
                                key: 'values.date'
                            }
                        ],
                        fields: [
                            {
                                name: 'values',
                                operator: 'push',
                                fields: [
                                    {
                                        key: 'values.usd_cost',
                                        name: 'usd_cost'
                                    }
                                ]
                            }
                        ]
                    }
                });

                if (params.group_by) {
                    const idx = (params.limit)? 5: 4;
                    if (Array.isArray(params.group_by)) {
                        for (const groupKey of params.group_by) {
                            requestParams.query.aggregate[idx].group.fields[0].fields.push({
                                key: groupKey,
                                name: groupKey
                            });
                        }
                    }
                }

            } else {
                requestParams.query.aggregate.push({
                    group: {
                        keys: [],
                        fields: [
                            {
                                key: 'usd_cost',
                                name: 'total_usd_cost',
                                operator: 'sum'
                            },
                            {
                                name: 'usd_cost',
                                operator: 'push',
                                fields: [
                                    {
                                        key: 'date',
                                        name: 'k'
                                    },
                                    {
                                        key: 'usd_cost',
                                        name: 'v'
                                    }
                                ]
                            }
                        ]
                    }
                });

                if (params.group_by) {
                    if (Array.isArray(params.group_by)) {
                        for (const groupKey of params.group_by) {
                            requestParams.query.aggregate[1].group.keys.push({
                                key: groupKey,
                                name: groupKey
                            });
                        }
                    }
                }

                requestParams.query.aggregate.push({
                    project: {
                        fields: [
                            {
                                key: 'total_usd_cost',
                                name: 'total_usd_cost'
                            },
                            {
                                key: 'usd_cost',
                                name: 'usd_cost',
                                operator: 'array_to_object'
                            }
                        ]
                    }
                });

                if (params.sort) {
                    requestParams.query.aggregate.push({
                        sort: params.sort
                    });
                } else {
                    requestParams.query.aggregate.push({
                        sort: {
                            key: 'total_usd_cost',
                            desc: true
                        }
                    });
                }

                if (params.limit) {
                    requestParams.query.aggregate.push({
                        limit: params.limit
                    });
                }
            }
        }
    }

    if (params.filter) {
        requestParams.query.filter = cloneDeep(params.filter);
    }

    requestParams.query.filter.push({
        key: 'billed_at',
        value: params.start,
        operator: 'datetime_gte'
    });

    requestParams.query.filter.push({
        key: 'billed_at',
        value: params.end,
        operator: 'datetime_lt'
    });

    if (params.page) {
        requestParams.query.page = cloneDeep(params.page);
    }

    if (params.include_usage_quantity === true) {
        requestParams.query.aggregate[0].group.fields.push({
            key: 'usage_quantity',
            name: 'usage_quantity',
            operator: 'sum'
        });

        if (params.granularity !== 'ACCUMULATED') {
            if (params.pivot_type === 'CHART') {
                requestParams.query.aggregate[1].group.fields[0].fields.push({
                    key: 'usage_quantity',
                    name: 'usage_quantity'
                });

                requestParams.query.aggregate[5].group.fields[0].fields.push({
                    key: 'values.usage_quantity',
                    name: 'usage_quantity'
                });

            } else {
                requestParams.query.aggregate[1].group.fields.push({
                    name: 'usage_quantity',
                    operator: 'push',
                    fields: [
                        {
                            key: 'date',
                            name: 'k'
                        },
                        {
                            key: 'usage_quantity',
                            name: 'v'
                        }
                    ]
                });

                requestParams.query.aggregate[2].project.fields.push({
                    name: 'usage_quantity',
                    key: 'usage_quantity',
                    operator: 'array_to_object'
                });
            }
        }
    }

    if (params.domain_id) {
        requestParams['domain_id'] = params.domain_id;
    }

    return requestParams;
};

export const analyzeCosts = async (params) => {
    const requestParams = makeRequest(params);
    return await statCosts(requestParams);
};
