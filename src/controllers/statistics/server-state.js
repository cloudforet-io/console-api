import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const SERVER_STATE = [
    'INSERVICE',
    'MAINTENANCE',
    'DISCONNECTED'
];

const getServerState = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');

    let reqParams = {
        domain_id: params.domain_id,
        query: {
            count_only: true
        }
    };

    let response = {};
    let promises = SERVER_STATE.map(async (state) => {
        reqParams.query.filter = [{
            k: 'state',
            v: state,
            o: 'eq'
        }];

        let stateResponse = await inventoryV1.Server.list(reqParams);
        response[state] = stateResponse.total_count;
    });

    await Promise.all(promises);
    return response;
};

export default getServerState;
