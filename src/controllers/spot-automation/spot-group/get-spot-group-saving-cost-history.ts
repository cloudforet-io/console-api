//@ts-nocheck
import { statSavingCosts } from '@controllers/cost-saving/cost-saving';
import moment from 'moment';

const getDefaultQuery = () => {
    return {
        query: {
            aggregate: [
                {
                    group: {
                        keys: [
                            {
                                key: 'saving_by',
                                name: 'spot_group_id'
                            },
                            {
                                key: 'created_at',
                                name: 'date',
                                date_format: '%Y-%m'
                            }
                        ],
                        fields: [
                            {
                                name: 'normal_cost',
                                key: 'cost_normal',
                                operator: 'sum'
                            },
                            {
                                name: 'saving_cost',
                                key: 'cost_saving',
                                operator: 'sum'
                            },
                            {
                                name: 'saving_result',
                                key: 'saving_result',
                                operator: 'sum'
                            }
                        ]
                    }
                },
                {
                    sort: {
                        key: 'date'
                    }
                }
            ],
            filter: [
                {
                    k: 'saving_service',
                    v: 'spot_automation.SpotGroup',
                    o: 'eq'
                }
            ]
        }
    };
};

const isValidMonth = (dateString) => {
    const regEx = /^\d{4}-\d{2}$/;
    return dateString.match(regEx) != null;
};

const makeRequest = (params) => {
    if (!params.start) {
        throw new Error('Required Parameter. (key = start)');
    }

    if (!params.end) {
        throw new Error('Required Parameter. (key = end)');
    }

    const requestParams = getDefaultQuery();

    if (params.spot_group_id) {
        requestParams['query']['filter'].push({
            k: 'saving_by',
            v: params.spot_group_id,
            o: 'eq'
        });
    }

    if (!isValidMonth(params.start)) {
        throw new Error('start parameter format is invalid. (YYYY-MM)');
    }

    if (!isValidMonth(params.end)) {
        throw new Error('end parameter format is invalid. (YYYY-MM)');
    }

    const start_dt = moment.utc(params.month);
    const end_dt = moment.utc(params.month).add(1, 'month');

    requestParams['query']['filter'].push({
        key: 'created_at',
        value: start_dt.format(),
        operator: 'datetime_gte'
    });

    requestParams['query']['filter'].push({
        key: 'created_at',
        value: end_dt.format(),
        operator: 'datetime_lt'
    });

    return requestParams;
};

const makeResponse = (results) => {
    if (results.length == 0) {
        return {
            results: [
                {date: '2020-11', normal_cost: 0, saving_cost: 0, saving_result: 0, instance_count: 0},
                {date: '2020-12', normal_cost: 0, saving_cost: 0, saving_result: 0, instance_count: 0},
                {date: '2021-01', normal_cost: 0, saving_cost: 0, saving_result: 0, instance_count: 0},
                {date: '2021-02', normal_cost: 0, saving_cost: 0, saving_result: 0, instance_count: 0},
                {date: '2021-03', normal_cost: 0, saving_cost: 0, saving_result: 0, instance_count: 0},
                {date: '2021-04', normal_cost: 1400, saving_cost: 750, saving_result: 650, instance_count: 12}
                // {date: '2020-11', normal_cost: 1400, saving_cost: 700, saving_result: 700, instance_count: 15},
                // {date: '2020-12', normal_cost: 1700, saving_cost: 600, saving_result: 1100, instance_count: 16},
                // {date: '2021-01', normal_cost: 1800, saving_cost: 700, saving_result: 1100, instance_count: 16},
                // {date: '2021-02', normal_cost: 2000, saving_cost: 700, saving_result: 1300, instance_count: 18},
                // {date: '2021-03', normal_cost: 2000, saving_cost: 800, saving_result: 1200, instance_count: 20},
                // {date: '2021-04', normal_cost: 2500, saving_cost: 1250, saving_result: 1250, instance_count: 22}
            ]
        };
    } else {
        return {
            results: results
        };
    }
};

const getSpotGroupSavingCostHistory = async (params) => {
    const requestParams = makeRequest(params);
    const response = await statSavingCosts(requestParams);
    return makeResponse(response.results);
};

export default getSpotGroupSavingCostHistory;
