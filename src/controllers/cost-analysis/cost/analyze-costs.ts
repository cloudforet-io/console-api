import { cloneDeep } from 'lodash';
import grpcClient from '@lib/grpc-client';
import dayjs from 'dayjs';

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

    if (params.granularity != 'ACCUMULATED') {
        requestParams.query.aggregate[0].group.keys.push({
            key: 'billed_at',
            name: 'date',
            date_format: GRANULARITY_FORMAT[params.granularity]
        });

        if (params.pivot_type === 'CHART') {
            requestParams.query.aggregate.push({
                group: {
                    keys: [
                        {
                            key: 'date',
                            name: 'date'
                        }
                    ],
                    fields: [
                        {
                            name: 'values',
                            operator: 'push',
                            fields: [
                                {
                                    key: 'usd_cost',
                                    name: 'usd_cost'
                                }
                            ]
                        }
                    ]
                }
            });

            if (params.group_by) {
                if (Array.isArray(params.group_by)) {
                    for (const groupKey of params.group_by) {
                        requestParams.query.aggregate[1].group.fields[0].fields.push({
                            key: groupKey,
                            name: groupKey
                        });
                    }
                }
            }

            requestParams.query.aggregate.push({
                sort: {
                    key: 'date'
                }
            });

        } else if (params.pivot_type === 'TABLE') {
            requestParams.query.aggregate.push({
                sort: {
                    key: 'date'
                }
            });

            const endDate = dayjs(params.end).add(-1, 'day');
            let endDateStr: string = '';

            if (params.granularity === 'DAILY') {
                endDateStr = endDate.format('YYYY-MM-DD');
            } else if (params.granularity === 'MONTHLY') {
                endDateStr = endDate.format('YYYY-MM');
            } else {
                endDateStr = endDate.format('YYYY');
            }

            requestParams.query.aggregate.push({
                group: {
                    keys: [],
                    fields: [
                        {
                            key: 'usd_cost',
                            name: 'last_date_usd_cost',
                            operator: 'sum',
                            condition: {
                                key: 'date',
                                value: endDateStr,
                                operator: 'eq'
                            }
                        },
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
                        }
                    ]
                }
            });

            if (params.group_by) {
                if (Array.isArray(params.group_by)) {
                    for (const groupKey of params.group_by) {
                        requestParams.query.aggregate[2].group.keys.push({
                            key: groupKey,
                            name: groupKey
                        });
                    }
                }
            }

            requestParams.query.aggregate.push({
                sort: {
                    key: 'last_date_usd_cost',
                    desc: true
                }
            });
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
    }

    if (params.domain_id) {
        requestParams['domain_id'] = params.domain_id;
    }

    return requestParams;
};

export const analyzeCosts = async (params) => {
    const costAnalysisV1 = await grpcClient.get('cost_analysis', 'v1');

    const requestParams = makeRequest(params);
    const response = await costAnalysisV1.Cost.stat(requestParams);

    return response;
};
