import { cloneDeep } from 'lodash';
import { statCosts } from '@controllers/cost-analysis/cost';

const SUPPORTED_GRANULARITY = ['DAILY', 'MONTHLY', 'YEARLY', 'ACCUMULATED'];

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

const makeRequest = (params, isEtcCosts) => {
    const requestParams = getDefaultQuery();

    if (!params.start) {
        throw new Error('Required Parameter. (key = start)');
    }

    if (!params.end) {
        throw new Error('Required Parameter. (key = end)');
    }

    requestParams.start = params.start;
    requestParams.end = params.end;

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

    if (!SUPPORTED_GRANULARITY.includes(params.granularity)) {
        throw new Error(`granularity not supported. (support = ${SUPPORTED_GRANULARITY.join(' | ')})`);
    }

    if (params.granularity === 'ACCUMULATED') {
        requestParams.query.aggregate.push({
            sort: {
                key: 'usd_cost',
                desc: true
            }
        });

        if (isEtcCosts === true) {
            if (params.limit) {
                requestParams.query.aggregate.push({
                    skip: params.limit
                });
            }

            requestParams.query.aggregate.push({
                group: {
                    fields: [
                        {
                            name: 'usd_cost',
                            operator: 'sum',
                            key: 'usd_cost'
                        }
                    ]
                }
            });
        } else {
            if (params.limit) {
                requestParams.query.aggregate.push({
                    limit: params.limit
                });
            }
        }
    } else {
        if (params.granularity === 'YEARLY') {
            requestParams.query.aggregate[0].group.keys.push({
                key: 'billed_at',
                name: 'year',
                date_format: 'year'
            });
            requestParams.query.aggregate.push({
                project: {
                    fields: [
                        {
                            key: 'usd_cost',
                            name: 'usd_cost'
                        },
                        {
                            key: '$_id.year',
                            name: 'date',
                            operator: 'concat'
                        }
                    ]
                }
            });
        } else if (params.granularity === 'MONTHLY') {
            requestParams.query.aggregate[0].group.keys.push({
                key: 'billed_at',
                name: 'year',
                date_format: 'year'
            });
            requestParams.query.aggregate[0].group.keys.push({
                key: 'billed_at',
                name: 'month',
                date_format: 'month'
            });
            requestParams.query.aggregate.push({
                project: {
                    fields: [
                        {
                            key: 'usd_cost',
                            name: 'usd_cost'
                        },
                        {
                            key: '$_id.year|-|$_id.month',
                            name: 'date',
                            operator: 'concat'
                        }
                    ]
                }
            });
        } else if (params.granularity === 'DAILY') {
            requestParams.query.aggregate[0].group.keys.push({
                key: 'billed_at',
                name: 'year',
                date_format: 'year'
            });
            requestParams.query.aggregate[0].group.keys.push({
                key: 'billed_at',
                name: 'month',
                date_format: 'month'
            });
            requestParams.query.aggregate[0].group.keys.push({
                key: 'billed_at',
                name: 'day',
                date_format: 'day'
            });
            requestParams.query.aggregate.push({
                project: {
                    fields: [
                        {
                            key: 'usd_cost',
                            name: 'usd_cost'
                        },
                        {
                            key: '$_id.year|-|$_id.month|-|$_id.day',
                            name: 'date',
                            operator: 'concat'
                        }
                    ]
                }
            });
        }

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
                    requestParams.query.aggregate[requestParams.query.aggregate.length-1].group.keys.push({
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

        if (isEtcCosts === true) {
            if (params.limit) {
                requestParams.query.aggregate.push({
                    skip: params.limit
                });

                requestParams.query.aggregate.push({
                    project: {
                        fields: [
                            {
                                key: 'usd_cost',
                                name: 'usd_cost',
                                operator: 'object_to_array'
                            }
                        ]
                    }
                });

                requestParams.query.aggregate.push({
                    unwind: {
                        path: 'usd_cost'
                    }
                });

                requestParams.query.aggregate.push({
                    group: {
                        keys: [
                            {
                                name: 'date',
                                key: 'usd_cost.k'
                            }
                        ],
                        fields: [
                            {
                                name: 'usd_cost',
                                operator: 'sum',
                                key: 'usd_cost.v'
                            }
                        ]
                    }
                });
            }
        } else {
            if (params.limit) {
                requestParams.query.aggregate.push({
                    limit: params.limit
                });
            }
        }
    }

    if (params.filter) {
        requestParams.query.filter = cloneDeep(params.filter);
    }

    if (params.page) {
        requestParams.query.page = cloneDeep(params.page);
    }

    // if (params.include_usage_quantity === true) {
    //     requestParams.query.aggregate[0].group.fields.push({
    //         key: 'usage_quantity',
    //         name: 'usage_quantity',
    //         operator: 'sum'
    //     });
    //
    //     if (params.granularity === 'ACCUMULATED') {
    //         if (isEtcCosts === true) {
    //             requestParams.query.aggregate[requestParams.query.aggregate.length-1].group.fields.push({
    //                 key: 'usage_quantity',
    //                 name: 'usage_quantity',
    //                 operator: 'sum'
    //             });
    //         }
    //     } else {
    //         requestParams.query.aggregate[1].group.fields.push({
    //             name: 'usage_quantity',
    //             operator: 'push',
    //             fields: [
    //                 {
    //                     key: 'date',
    //                     name: 'k'
    //                 },
    //                 {
    //                     key: 'usage_quantity',
    //                     name: 'v'
    //                 }
    //             ]
    //         });
    //
    //         requestParams.query.aggregate[2].project.fields.push({
    //             name: 'usage_quantity',
    //             key: 'usage_quantity',
    //             operator: 'array_to_object'
    //         });
    //     }
    // }

    if (params.domain_id) {
        requestParams['domain_id'] = params.domain_id;
    }

    return requestParams;
};

const mergeResponse = (costResults, etcCostResults, includeUsageQuantity, granularity) => {
    let results: any[] = [];

    if (granularity === 'ACCUMULATED') {
        results = costResults;

        if (etcCostResults.length > 0) {
            const etcCostValue = etcCostResults[0];
            etcCostValue.is_etc = true;
            results.push(etcCostValue);
        }

    } else {
        results = costResults;

        if (etcCostResults.length > 0) {
            const etcCostValue = {
                is_etc: true,
                usd_cost: {}
            };

            for (const etcCostInfo of etcCostResults) {
                etcCostValue.usd_cost[etcCostInfo.date] = etcCostInfo.usd_cost;
            }

            results.push(etcCostValue);
        }
    }


    return results;
};

export const analyzeCosts = async (params) => {
    const requestParams = makeRequest(params, false);
    const response = await statCosts(requestParams);

    if (params.include_etc === true && params.limit) {
        const requestParams = makeRequest(params, true);
        const etcResponse = await statCosts(requestParams);
        response.results = mergeResponse(response.results || [], etcResponse.results || [],
            params.include_usage_quantity, params.granularity);
    }

    return response;
};
