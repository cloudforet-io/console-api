import { statAlerts } from '@controllers/monitoring/alert';

const getDefaultQuery = () => {
    return {
        query: {
            aggregate: [
                {
                    group: {
                        keys: [
                            {
                                key: 'state',
                                name: 'state'
                            }
                        ],
                        fields: [
                            {
                                name: 'total',
                                operator: 'count'
                            }
                        ]
                    }
                }
            ],
            filter: [
                {
                    key: 'state',
                    value: 'ERROR',
                    operator: 'not'
                }
            ] as any
        }
    };
};

const makeRequest = (params) => {
    const requestParams: any = getDefaultQuery();

    if (params.activated_projects) {
        requestParams.query.filter.push({
            k: 'project_id',
            v: params.activated_projects,
            o: 'in'
        });
    }
    if (params.project_id) {
        requestParams.query.filter.push({
            k: 'project_id',
            v: params.project_id,
            o: 'eq'
        });
    }
    if (params.assignee) {
        requestParams.query.filter.push({
            k: 'assignee',
            v: params.assignee,
            o: 'eq'
        });
    }

    return requestParams;
};

const makeResponse = async (params) => {
    return await statAlerts(params);
};

const alertCountByState = async (params) => {
    const requestParams = makeRequest(params);
    return makeResponse(requestParams);
};

export default alertCountByState;

