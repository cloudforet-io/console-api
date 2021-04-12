import { statHistory } from '@controllers/spot-automation/history';

const getDefaultQuery = () => {
    return {
        query: {
            aggregate: [
                {
                    group: {
                        keys: [
                            {
                                key: 'created_at',
                                name: 'created_at',
                                date_format: '%Y-%m-%dT%H'
                            }
                        ],
                        fields: [
                            {
                                key: 'total_count',
                                name: 'total',
                                operator: 'sum'
                            },
                            {
                                key: 'spot_count',
                                name: 'spot',
                                operator: 'sum'
                            },
                            {
                                key: 'ondemand_count',
                                name: 'ondemand',
                                operator: 'sum'
                            }
                        ]
                    }
                },
                {
                    sort: {
                        key: 'created_at'
                    }
                },
                {
                    group: {
                        keys: [
                            {
                                key: 'project_id',
                                name: 'project_id'
                            }
                        ],
                        fields: [
                            {
                                name: 'total',
                                key: 'total',
                                operator: 'last'
                            },
                            {
                                name: 'spot',
                                key: 'spot',
                                operator: 'last'
                            },
                            {
                                name: 'ondemand',
                                key: 'ondemand',
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
    if (!params.projects) {
        throw new Error('Required Parameter. (key = projects)');
    }

    const requestParams = getDefaultQuery();

    requestParams['query']['filter'].push({
        k: 'project_id',
        v: params.projects,
        o: 'in'
    });

    return requestParams;
};

const makeResponse = (results, projects) => {
    const projectResults = {};
    projects.forEach((projectId) => {
        // spotGroupResults[projectId] = {
        //     total: 0,
        //     spot: 0,
        //     ondemand: 0
        // };
        const total = Math.floor(Math.random() * 10);
        projectResults[projectId] = {
            total: total,
            spot: total,
            ondemand: 0
        };
    });

    results.forEach((item) => {
        projects[item.project_id] = {
            total: item.total || 0,
            spot: item.spot || 0,
            ondemand: item.ondemand || 0
        };
    });

    return {
        projects: projectResults
    };
};

const getProjectInstanceCount = async (params) => {
    const requestParams = makeRequest(params);
    const response = await statHistory(requestParams);
    return makeResponse(response.results, params.projects);
};

export default getProjectInstanceCount;
