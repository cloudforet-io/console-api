//@ts-nocheck
import { statSavingCosts } from '@controllers/cost-saving/cost-saving';
import moment from 'moment';
import faker from 'faker';

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
    if (!params.spot_groups) {
        throw new Error('Required Parameter. (key = spot_groups)');
    }

    const requestParams = getDefaultQuery();

    requestParams['query']['filter'].push({
        k: 'saving_by',
        v: params.spot_groups,
        o: 'in'
    });

    if (params.month) {
        if (!isValidMonth(params.month)) {
            throw new Error('month parameter format is invalid. (YYYY-MM)');
        }

        const start_dt = moment.utc(params.month);
        const end_dt = start_dt.clone().add(1, 'month');

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
    }

    return requestParams;
};

const makeResponse = (results, spotGroups) => {
    const spotGroupResults = {};
    spotGroups.forEach((spotGroupId) => {
        // spotGroupResults[spotGroupId] = {
        //     normal_cost: 0,
        //     saving_cost: 0,
        //     saving_result: 0
        // };
        const normalCost = faker.random.number({ min: 2500, max: 5000 });
        const savingCost = faker.random.number({ min: 1000, max: 2500 });
        if (spotGroupId === 'spotgroup-a1b2005dc2bd') {
            spotGroupResults[spotGroupId] = {
                normal_cost: normalCost,
                saving_cost: savingCost,
                saving_result: 650
            };
        } else {
            spotGroupResults[spotGroupId] = {
                normal_cost: normalCost,
                saving_cost: savingCost,
                saving_result: normalCost - savingCost
            };
        }
    });

    results.forEach((item) => {
        spotGroupResults[item.spot_group_id] = {
            normal_cost: item.normal_cost || 0,
            saving_cost: item.saving_cost || 0,
            saving_result: item.saving_result || 0
        };
    });

    return {
        spot_groups: spotGroupResults
    };
};

const getSpotGroupSavingCost = async (params) => {
    const requestParams = makeRequest(params);
    const response = await statSavingCosts(requestParams);
    return makeResponse(response.results, params.spot_groups);
};

export default getSpotGroupSavingCost;
