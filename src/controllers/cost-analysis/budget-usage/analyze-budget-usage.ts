import { cloneDeep } from 'lodash';

import { statResource } from '@controllers/statistics/resource';

const getBudgetUsageQuery: any = () => {
    return {
        aggregate: [
            {
                query: {
                    resource_type: 'cost_analysis.BudgetUsage',
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
                                        },
                                        {
                                            key: 'limit',
                                            name: 'limit',
                                            operator: 'sum'
                                        }
                                    ]
                                }
                            }],
                        filter: []
                    }
                }
            },
            {
                formula: {
                    eval: 'usage = usd_cost / limit * 100'
                }
            }
        ]
    };
};

const getTotalBudgeUsageQuery: any = () => {
    return {
        aggregate: [
            {
                query: {
                    resource_type: 'cost_analysis.Budget',
                    query: {
                        aggregate: [
                            {
                                group: {
                                    keys: [],
                                    fields: [
                                        {
                                            key: 'total_usage_usd_cost',
                                            name: 'usd_cost',
                                            operator: 'sum'
                                        },
                                        {
                                            key: 'limit',
                                            name: 'limit',
                                            operator: 'sum'
                                        }
                                    ]
                                }
                            }],
                        filter: []
                    }
                }
            },
            {
                formula: {
                    eval: 'usage = usd_cost / limit * 100'
                }
            }
        ]
    };
};

const makeRequest = (params) => {
    let requestParams;

    if (params.start || params.end) {
        requestParams = getBudgetUsageQuery();
    } else {
        requestParams = getTotalBudgeUsageQuery();
    }

    if (params.group_by) {
        if (Array.isArray(params.group_by)) {
            for (const groupKey of params.group_by) {
                requestParams.aggregate[0].query.query.aggregate[0].group.keys.push({
                    key: groupKey,
                    name: groupKey
                });
            }
        }
    }

    if (params.include_budget_count === true) {
        requestParams.aggregate[0].query.query.aggregate[0].group.fields.push({
            key: 'budget_id',
            name: 'budgets',
            operator: 'add_to_set'
        });
        requestParams.aggregate[0].query.query.aggregate.push({
            project: {
                fields: [
                    {
                        key: 'usd_cost',
                        name: 'usd_cost'
                    },
                    {
                        key: 'limit',
                        name: 'limit'
                    },
                    {
                        key: 'budgets',
                        name: 'budget_count',
                        operator: 'size'
                    }
                ]
            }
        });
    }

    if (params.include_budget_info === true) {
        requestParams.aggregate.push({
            join: {
                resource_type: 'cost_analysis.Budget',
                keys: ['budget_id'],
                query: {
                    aggregate: [
                        {
                            group: {
                                keys: [
                                    {
                                        name: 'budget_id',
                                        key: 'budget_id'
                                    },
                                    {
                                        name: 'name',
                                        key: 'name'
                                    },
                                    {
                                        name: 'cost_types',
                                        key: 'cost_types'
                                    },
                                    {
                                        name: 'project_id',
                                        key: 'project_id'
                                    },
                                    {
                                        name: 'project_group_id',
                                        key: 'project_group_id'
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        });
    }

    if (params.filter) {
        requestParams.aggregate[0].query.query.filter = cloneDeep(params.filter);
    }

    if (params.start || params.end) {
        if (params.start) {
            requestParams.aggregate[0].query.query.filter.push({
                key: 'date',
                value: params.start,
                operator: 'gte'
            });
        }

        if (params.end) {
            requestParams.aggregate[0].query.query.filter.push({
                key: 'date',
                value: params.end,
                operator: 'lte'
            });
        }
    }

    if (params.sort) {
        requestParams.aggregate.push({ sort: cloneDeep(params.sort) });
    }

    if (params.page) {
        requestParams.page = cloneDeep(params.page);
    }

    if (params.keyword) {
        requestParams.aggregate[0].query.query.keyword = params.keyword;
    }

    if (params.domain_id) {
        requestParams['domain_id'] = params.domain_id;
    }

    if (params.usage_range) {
        const min = params.usage_range.min;
        const max = params.usage_range.max;
        const condition = params.usage_range.condition || 'and';
        let query;

        if (min && typeof min !== 'number') {
            throw new Error('Parameter type is invalid. (usage_range.min == number)');
        }

        if (max && typeof max !== 'number') {
            throw new Error('Parameter type is invalid. (usage_range.max == number)');
        }

        if (min && max) {
            query = `usage >= ${min} ${condition} usage <= ${max}`;
        } else if (min) {
            query = `usage >= ${min}`;
        } else if (max) {
            query = `usage <= ${max}`;
        } else {
            throw new Error('Required parameter. (usage_range.min / usage_range.max)');
        }

        requestParams['aggregate'].push({
            formula: {
                query: query
            }
        });

        if (!params.group_by) {
            requestParams.aggregate[0].query.query.aggregate[0].group.keys.push({
                key: 'budget_id',
                name: 'budget_id'
            });
        }

    }

    return requestParams;
};

const mergeResults = (results) => {
    const value = {
        usd_cost: 0,
        limit: 0,
        usage: 0
    };

    for (const result of results) {
        value.usd_cost += result.usd_cost;
        value.limit += result.limit;
    }

    value.usage = Math.round(value.usd_cost / value.limit * 10000) / 100;

    return [value];
};

export const analyzeBudgetUsage = async (params) => {
    const requestParams = makeRequest(params);
    const response = await statResource(requestParams);

    if (params.usage_range && !params.group_by) {
        return {
            results: mergeResults(response.results),
            total_count: 1
        };
    } else {
        return response;
    }
};
