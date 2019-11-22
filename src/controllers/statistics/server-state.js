import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const SERVER_STATE = {
    'PENDING': 'Pending',
    'INSERVICE': 'In-Service',
    'MAINTENANCE': 'Maintenance',
    'CLOSED': 'Closed'
};

const getServerState = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');

    let reqParams = {
        domain_id: params.domain_id,
        query: {
            count_only: true
        }
    };

    if (params.region_id) {
        reqParams.region_id = params.region_id;
    }

    if (params.zone_id) {
        reqParams.zone_id = params.zone_id;
    }

    if (params.pool_id) {
        reqParams.pool_id = params.pool_id;
    }

    if (params.project_id) {
        reqParams.project_id = params.project_id;
    }

    if (params.project_group_id) {
        // TODO: Add child project_ids
    }

    let response = {};
    let promises = Object.keys(SERVER_STATE).map(async (state) => {
        reqParams.query.filter = [{
            k: 'state',
            v: state,
            o: 'eq'
        }];

        let stateResponse = await inventoryV1.Server.list(reqParams);
        response[SERVER_STATE[state]] = stateResponse.total_count;
    });

    await Promise.all(promises);
    return response;
};

export default getServerState;
