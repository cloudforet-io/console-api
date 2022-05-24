import faker from 'faker';

import { statHistory } from '@controllers/spot-automation/history';

const getDefaultQuery = () => {
    return {
        query: {
            aggregate: [
                {
                    sort: {
                        key: 'created_at'
                    }
                },
                {
                    group: {
                        keys: [
                            {
                                key: 'spot_group_id',
                                name: 'spot_group_id'
                            }
                        ],
                        fields: [
                            {
                                name: 'total',
                                key: 'total_count',
                                operator: 'last'
                            },
                            {
                                name: 'spot',
                                key: 'spot_count',
                                operator: 'last'
                            },
                            {
                                name: 'ondemand',
                                key: 'ondemand_count',
                                operator: 'last'
                            }
                        ]
                    }
                }
            ],
            filter: [
                {
                    k: 'created_at',
                    v: 'now/d-1d',
                    o: 'timediff_gte'
                }
            ]
        }
    };
};

const makeRequest = (params) => {
    if (!params.spot_groups) {
        throw new Error('Required Parameter. (key = spot_groups)');
    }

    const requestParams = getDefaultQuery();

    requestParams['query']['filter'].push({
        k: 'spot_group_id',
        v: params.spot_groups,
        o: 'in'
    });

    return requestParams;
};

const makeResponse = (results, spotGroups) => {
    const spotGroupResults = {};
    spotGroups.forEach((spotGroupId) => {
        // spotGroupResults[spotGroupId] = {
        //     total: 0,
        //     spot: 0,
        //     ondemand: 0
        // };
        const total = faker.random.number({ min: 1, max: 10 });
        let spot = faker.random.number({ min: 1, max: 10 });

        if (spot > total) {
            spot = total;
        }
        spotGroupResults[spotGroupId] = {
            total: total,
            spot: spot,
            ondemand: total - spot
        };
    });

    results.forEach((item) => {
        spotGroupResults[item.spot_group_id] = {
            total: item.total || 0,
            spot: item.spot || 0,
            ondemand: item.ondemand || 0
        };
    });

    return {
        spot_groups: spotGroupResults
    };
};

const getSpotGroupInstanceCount = async (params) => {
    const requestParams = makeRequest(params);
    const response = await statHistory(requestParams);
    return makeResponse(response.results, params.spot_groups);
};

export default getSpotGroupInstanceCount;
