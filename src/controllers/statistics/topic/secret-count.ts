import grpcClient from '@lib/grpc-client';
import { Filter } from '@lib/grpc-client/type';

const getDefaultQuery = () => {
    return {
        aggregate: [
            {
                query: {
                    resource_type: 'secret.Secret',
                    query: {
                        aggregate: [{
                            group: {
                                keys: [
                                    {
                                        key: 'schema',
                                        name: 'name'
                                    }
                                ],
                                fields: [
                                    {
                                        name: 'count',
                                        operator: 'count'
                                    }
                                ]
                            }
                        }],
                        filter: [] as unknown as Filter[]
                    }
                }
            }
        ]
    };
};

const makeRequest = (params) => {
    const requestParams = getDefaultQuery();

    if (params.provider) {
        requestParams.aggregate[0].query.query.filter.push({
            k: 'provider',
            v: params.provider,
            o: 'eq'
        });
    }

    if (params.domain_id) {
        requestParams['domain_id'] = params.domain_id;
    }

    return requestParams;
};

const secretCount = async (params) => {
    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    const response = await statisticsV1.Resource.stat(requestParams);

    return response;
};

export default secretCount;
