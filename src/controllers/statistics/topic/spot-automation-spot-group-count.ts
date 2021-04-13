//@ts-nocheck
import { statSpotGroups } from '@controllers/spot-automation/spot-group';

const getDefaultQuery = () => {
    return {
        query: {
            aggregate: [
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
                                name: 'spot_group_count',
                                key: 'spot_group_id',
                                operator: 'count'
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
        projectResults[projectId] = 0;
    });

    results.forEach((item) => {
        projectResults[item.project_id] = item.spot_group_count;
    });

    return {
        projects: projectResults
    };
};

const spotAutomationSpotGroupCount = async (params) => {
    const requestParams = makeRequest(params);
    const response = await statSpotGroups(requestParams);
    return makeResponse(response.results, params.projects);
};

export default spotAutomationSpotGroupCount;
