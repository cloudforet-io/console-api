import { statSpotGroups } from '@controllers/spot-automation/spot-group';

const getDefaultQuery = () => {
    return {
        query: {
            aggregate: [
                {
                    group: {
                        keys: [
                            {
                                key: 'type',
                                name: 'type'
                            },
                            {
                                key: 'availability_zone',
                                name: 'availability_zone'
                            }
                        ],
                        fields: [
                            {
                                name: 'count',
                                operator: 'count'
                            }
                        ]
                    }
                },
                {
                    sort: {
                        key: 'count',
                        desc: true
                    }
                }
            ],
            filter: [
                {
                    k: 'created_at',
                    v: 'now/d-14d',
                    o: 'timediff_gte'
                }
            ]
        }
    };
};

const makeRequest = (params) => {
    if (!params.spot_group_id) {
        throw new Error('Required Parameter. (key = spot_group_id)');
    }

    const requestParams = getDefaultQuery();

    requestParams['query']['filter'].push({
        k: 'spot_group_id',
        v: params.spot_group_id,
        o: 'eq'
    });

    return requestParams;
};

const makeResponse = (results) => {
    if (results.length > 0) {
        return {
            results
        };
    } else {
        return {
            results: [
                {
                    type: 't3.nano',
                    availability_zone: 'ap-northeast-1c',
                    count: 10
                },
                {
                    type: 't4.micro',
                    availability_zone: 'ap-northeast-1b',
                    count: 8
                },
                {
                    type: 'm2.large',
                    availability_zone: 'ap-northeast-1c',
                    count: 5
                },
                {
                    type: 't3.nano',
                    availability_zone: 'ap-northeast-1a',
                    count: 2
                }
            ]
        };
    }
};

const getSpotGroupInterruptSummary = async (params) => {
    const requestParams = makeRequest(params);
    const response = await statSpotGroups(requestParams);
    return makeResponse(response.results);
};

export default getSpotGroupInterruptSummary;
