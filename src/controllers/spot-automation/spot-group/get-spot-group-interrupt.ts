import { statSpotGroups } from '@controllers/spot-automation/spot-group';

const getDefaultQuery = () => {
    return {
        query: {
            aggregate: [
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
                                name: 'count',
                                operator: 'count'
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
        // spotGroupResults[spotGroupId] = 0;
        spotGroupResults[spotGroupId] = Math.floor(Math.random() * 10);
    });

    results.forEach((item) => {
        spotGroupResults[item.spot_group_id] = item.count;
    });

    return {
        spot_groups: spotGroupResults
    };
};

const getSpotGroupInterrupt = async (params) => {
    const requestParams = makeRequest(params);
    const response = await statSpotGroups(requestParams);
    return makeResponse(response.results, params.spot_groups);
};

export default getSpotGroupInterrupt;
