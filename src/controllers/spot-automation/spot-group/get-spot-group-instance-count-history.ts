import { statHistory } from '@controllers/spot-automation/history';

const SUPPORTED_GRANULARITY = ['DAILY', 'MONTHLY'];

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

    const requestParams: any = getDefaultQuery();

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

        requestParams['query']['aggregate'][1]['group']['keys'].push({
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

        requestParams['query']['aggregate'][1]['group']['keys'].push({
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
                total: item.total || 0,
                spot: item.spot || 0,
                ondemand: item.ondemand || 0
            });
        });
    } else {
        spotGroups.forEach((spotGroupId) => {
            if (granularity === 'DAILY') {
                spotGroupResults[spotGroupId].push({ date: '2021-04-01', total: 10, spot: 10, ondemand: 0 });
                spotGroupResults[spotGroupId].push({ date: '2021-04-02', total: 10, spot: 8, ondemand: 2 });
                spotGroupResults[spotGroupId].push({ date: '2021-04-03', total: 10, spot: 8, ondemand: 2 });
                spotGroupResults[spotGroupId].push({ date: '2021-04-04', total: 14, spot: 10, ondemand: 4 });
                spotGroupResults[spotGroupId].push({ date: '2021-04-05', total: 14, spot: 14, ondemand: 0 });
                spotGroupResults[spotGroupId].push({ date: '2021-04-06', total: 15, spot: 15, ondemand: 0 });
                spotGroupResults[spotGroupId].push({ date: '2021-04-07', total: 15, spot: 14, ondemand: 1 });
                spotGroupResults[spotGroupId].push({ date: '2021-04-08', total: 17, spot: 15, ondemand: 2 });
                spotGroupResults[spotGroupId].push({ date: '2021-04-09', total: 12, spot: 12, ondemand: 0 });
                spotGroupResults[spotGroupId].push({ date: '2021-04-10', total: 12, spot: 12, ondemand: 0 });
                spotGroupResults[spotGroupId].push({ date: '2021-04-11', total: 12, spot: 12, ondemand: 0 });
                spotGroupResults[spotGroupId].push({ date: '2021-04-12', total: 14, spot: 12, ondemand: 2 });
                spotGroupResults[spotGroupId].push({ date: '2021-04-13', total: 14, spot: 12, ondemand: 2 });
                spotGroupResults[spotGroupId].push({ date: '2021-04-14', total: 14, spot: 12, ondemand: 2 });
            } else {
                spotGroupResults[spotGroupId].push({ date: '2020-05', total: 10, spot: 10, ondemand: 0 });
                spotGroupResults[spotGroupId].push({ date: '2020-06', total: 10, spot: 8, ondemand: 2 });
                spotGroupResults[spotGroupId].push({ date: '2020-07', total: 10, spot: 8, ondemand: 2 });
                spotGroupResults[spotGroupId].push({ date: '2020-08', total: 14, spot: 10, ondemand: 4 });
                spotGroupResults[spotGroupId].push({ date: '2020-09', total: 14, spot: 14, ondemand: 0 });
                spotGroupResults[spotGroupId].push({ date: '2020-10', total: 15, spot: 15, ondemand: 0 });
                spotGroupResults[spotGroupId].push({ date: '2020-11', total: 15, spot: 14, ondemand: 1 });
                spotGroupResults[spotGroupId].push({ date: '2020-12', total: 17, spot: 15, ondemand: 2 });
                spotGroupResults[spotGroupId].push({ date: '2021-01', total: 12, spot: 12, ondemand: 0 });
                spotGroupResults[spotGroupId].push({ date: '2021-02', total: 12, spot: 12, ondemand: 0 });
                spotGroupResults[spotGroupId].push({ date: '2021-03', total: 12, spot: 12, ondemand: 0 });
                spotGroupResults[spotGroupId].push({ date: '2021-04', total: 14, spot: 12, ondemand: 2 });
            }
        });
    }

    return {
        spot_groups: spotGroupResults
    };
};

const getSpotGroupInstanceCount = async (params) => {
    const requestParams = makeRequest(params);
    const response = await statHistory(requestParams);
    return makeResponse(response.results, params.spot_groups, params.granularity);
};

export default getSpotGroupInstanceCount;
