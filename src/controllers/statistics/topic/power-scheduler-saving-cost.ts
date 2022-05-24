import faker from 'faker';
import moment from 'moment';

import { statSavingCosts } from '@controllers/cost-saving/cost-saving';

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
                    v: 'power_scheduler.Schedule',
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
    if (!params.projects) {
        throw new Error('Required Parameter. (key = projects)');
    }

    const requestParams: any = getDefaultQuery();

    requestParams['query']['filter'].push({
        k: 'project_id',
        v: params.projects,
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

    if (params.domain_id) {
        requestParams['domain_id'] = params.domain_id;
    }

    return requestParams;
};

const makeResponse = (results, projects) => {
    const projectResults = {};
    projects.forEach((projectId) => {
        // projectResults[projectId] = {
        //     normal_cost: 0,
        //     saving_cost: 0,
        //     saving_result: 0
        // };

        const normalCost = faker.random.number({ min: 2500, max: 5000 });
        const savingCost = faker.random.number({ min: 1000, max: 2500 });
        if (projectId === 'project-4977c5005bc1') {
            projectResults[projectId] = {
                normal_cost: normalCost,
                saving_cost: savingCost,
                saving_result: 3080
            };
        } else if (projectId === 'project-cb04118c2c74') {
            projectResults[projectId] = {
                normal_cost: normalCost,
                saving_cost: savingCost,
                saving_result: 560
            };
        } else {
            projectResults[projectId] = {
                normal_cost: normalCost,
                saving_cost: savingCost,
                saving_result: normalCost - savingCost
            };
        }
    });

    results.forEach((item) => {
        projectResults[item.project_id] = {
            normal_cost: item.normal_cost || 0,
            saving_cost: item.saving_cost || 0,
            saving_result: item.saving_result || 0
        };
    });

    return {
        projects: projectResults
    };
};

const powerSchedulerSavingCost = async (params) => {
    const requestParams = makeRequest(params);
    const response = await statSavingCosts(requestParams);
    return makeResponse(response.results, params.projects);
};

export default powerSchedulerSavingCost;
