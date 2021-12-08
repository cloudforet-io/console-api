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
            name: 'budget_count',
            operator: 'size'
        });
    }

    if (params.include_project_info === true) {
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

    if (params.sort) {
        requestParams.aggregate.push({ sort: cloneDeep(params.sort) });
    }

    if (params.page) {
        requestParams.page = cloneDeep(params.page);
    }

    if (params.domain_id) {
        requestParams['domain_id'] = params.domain_id;
    }

    return requestParams;
};

export const analyzeBudgetUsage = async (params) => {
    const requestParams = makeRequest(params);
    const response = statResource(requestParams);

    return response;
};
