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
    if (!params.spot_group_id) {
        throw new Error('Required Parameter. (key = spot_group_id)');
    }

    if (!params.start) {
        throw new Error('Required Parameter. (key = start)');
    }

    if (!params.end) {
        throw new Error('Required Parameter. (key = end)');
    }

    const requestParams = getDefaultQuery();

    requestParams['query']['filter'].push({
        k: 'saving_by',
        v: params.spot_group_id,
        o: 'eq'
    });

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
                {date: '2020-11', total: 1400, spot: 700, ondemand: 700},
                {date: '2020-12', total: 1700, spot: 600, ondemand: 1100},
                {date: '2021-01', total: 1800, spot: 700, ondemand: 1100},
                {date: '2021-02', total: 2000, spot: 700, ondemand: 1300},
                {date: '2021-03', total: 2000, spot: 800, ondemand: 1200},
                {date: '2021-04', total: 2500, spot: 1250, ondemand: 1250}
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
