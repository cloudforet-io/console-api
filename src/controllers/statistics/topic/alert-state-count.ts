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
            filter: []
        }
    };
};

const makeRequest = () => {
    return getDefaultQuery();
};

const makeResponse = async (params) => {
    return await statAlerts(params);
};

const alertStateCount = async () => {
    const requestParams = makeRequest();
    return makeResponse(requestParams);
};

export default alertStateCount;

