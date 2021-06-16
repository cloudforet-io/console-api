import {statAlerts} from '@controllers/monitoring/alert';

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
                                key: 'alert_id',
                                name: 'total',
                                operator: 'count'
                            }
                        ]
                    }
                }
            ],
            filter: [] as any
        }
    };
};

const makeRequest = (params) => {
    const requestParams = getDefaultQuery();

    if (params.project_id) {
        requestParams.query.filter.push({
            k: 'project_id',
            v: params.project_id,
            o: 'eq'
        });
    }

    return requestParams;
};

const makeResponse = async (params) => {
    return await statAlerts(params);
};

const alertStateCount = async (params) => {
    const requestParams = makeRequest(params);
    return makeResponse(requestParams);
};

export default alertStateCount;

