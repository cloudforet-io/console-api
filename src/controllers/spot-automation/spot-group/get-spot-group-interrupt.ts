import { statInterrupts } from '@controllers/spot-automation/interrupt';
import faker from 'faker';

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
        spotGroupResults[spotGroupId] = faker.random.number({ min: 1, max: 10 });
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
    const response = await statInterrupts(requestParams);
    return makeResponse(response.results, params.spot_groups);
};

export default getSpotGroupInterrupt;
