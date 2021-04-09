//@ts-nocheck
import { statSpotGroups } from '@controllers/spot-automation/spot-group';

const SUPPORTED_GRANULARITY = ['DAILY', 'MONTHLY'];

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
                },
                {
                    sort: {
                        key: 'created_at'
                    }
                }
            ],
            filter: []
        }
    };
};

const makeRequest = (params) => {
    if (!params.spot_groups) {
        throw new Error('Required Parameter. (key = spot_groups)');
    }

    if (!params.granularity) {
        throw new Error('Required Parameter. (key = granularity)');
    } else {
        if (SUPPORTED_GRANULARITY.indexOf(params.granularity) < 0) {
            throw new Error(`granularity not supported. (support = ${SUPPORTED_GRANULARITY.join(' | ')})`);
        }
    }

    const requestParams = getDefaultQuery();

    requestParams['query']['filter'].push({
        k: 'spot_group_id',
        v: params.spot_groups,
        o: 'in'
    });

    if (params.granularity === 'DAILY') {
        const period = params.period || 14;
        requestParams['query']['filter'].push({
            k: 'created_at',
            v: `now/d-${period}d`,
            o: 'timediff_gte'
        });

        requestParams['query']['aggregate'][0]['group']['keys'].push({
            key: 'created_at',
            name: 'date',
            date_format: '%Y-%m-%d'
        });
    } else {
        const period = params.period || 12;
        requestParams['query']['filter'].push({
            k: 'created_at',
            v: `now/d-${period*30}d`,
            o: 'timediff_gte'
        });

        requestParams['query']['aggregate'][0]['group']['keys'].push({
            key: 'created_at',
            name: 'date',
            date_format: '%Y-%m'
        });
    }


    return requestParams;
};

const makeResponse = (results, spotGroups, granularity) => {
    const spotGroupResults = {};
    spotGroups.forEach((spotGroupId) => {
        spotGroupResults[spotGroupId] = [];
    });

    if (results.length > 0) {
        results.forEach((item) => {
            spotGroupResults[item.spot_group_id].push({
                date: item.date,
                count: item.count
            });
        });
    } else {
        spotGroups.forEach((spotGroupId) => {
            if (granularity === 'DAILY') {
                spotGroupResults[spotGroupId].push({date: '2021-04-01', count: Math.floor(Math.random() * 10)});
                spotGroupResults[spotGroupId].push({date: '2021-04-02', count: Math.floor(Math.random() * 10)});
                spotGroupResults[spotGroupId].push({date: '2021-04-03', count: Math.floor(Math.random() * 10)});
                spotGroupResults[spotGroupId].push({date: '2021-04-04', count: Math.floor(Math.random() * 10)});
                spotGroupResults[spotGroupId].push({date: '2021-04-05', count: Math.floor(Math.random() * 10)});
                spotGroupResults[spotGroupId].push({date: '2021-04-06', count: Math.floor(Math.random() * 10)});
                spotGroupResults[spotGroupId].push({date: '2021-04-07', count: Math.floor(Math.random() * 10)});
                spotGroupResults[spotGroupId].push({date: '2021-04-08', count: Math.floor(Math.random() * 10)});
                spotGroupResults[spotGroupId].push({date: '2021-04-09', count: Math.floor(Math.random() * 10)});
                spotGroupResults[spotGroupId].push({date: '2021-04-10', count: Math.floor(Math.random() * 10)});
                spotGroupResults[spotGroupId].push({date: '2021-04-11', count: Math.floor(Math.random() * 10)});
                spotGroupResults[spotGroupId].push({date: '2021-04-12', count: Math.floor(Math.random() * 10)});
                spotGroupResults[spotGroupId].push({date: '2021-04-13', count: Math.floor(Math.random() * 10)});
                spotGroupResults[spotGroupId].push({date: '2021-04-14', count: Math.floor(Math.random() * 10)});
            } else {
                spotGroupResults[spotGroupId].push({date: '2020-05', count: Math.floor(Math.random() * 10)});
                spotGroupResults[spotGroupId].push({date: '2020-06', count: Math.floor(Math.random() * 10)});
                spotGroupResults[spotGroupId].push({date: '2020-07', count: Math.floor(Math.random() * 10)});
                spotGroupResults[spotGroupId].push({date: '2020-08', count: Math.floor(Math.random() * 10)});
                spotGroupResults[spotGroupId].push({date: '2020-09', count: Math.floor(Math.random() * 10)});
                spotGroupResults[spotGroupId].push({date: '2020-10', count: Math.floor(Math.random() * 10)});
                spotGroupResults[spotGroupId].push({date: '2020-11', count: Math.floor(Math.random() * 10)});
                spotGroupResults[spotGroupId].push({date: '2020-12', count: Math.floor(Math.random() * 10)});
                spotGroupResults[spotGroupId].push({date: '2021-01', count: Math.floor(Math.random() * 10)});
                spotGroupResults[spotGroupId].push({date: '2021-02', count: Math.floor(Math.random() * 10)});
                spotGroupResults[spotGroupId].push({date: '2021-03', count: Math.floor(Math.random() * 10)});
                spotGroupResults[spotGroupId].push({date: '2021-04', count: Math.floor(Math.random() * 10)});
            }
        });
    }

    return {
        spot_groups: spotGroupResults
    };
};

const getSpotGroupInterruptHistory = async (params) => {
    const requestParams = makeRequest(params);
    const response = await statSpotGroups(requestParams);
    return makeResponse(response.results, params.spot_groups, params.granularity);
};

export default getSpotGroupInterruptHistory;
