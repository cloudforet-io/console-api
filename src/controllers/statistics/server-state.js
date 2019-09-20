import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
import _ from 'lodash';

const getServerState = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');

    let reqParams = {
        domain_id: params.domain_id,
        query: {
            count_only: true,
            filter: [{
                k: 'state',
                v: 'DELETED',
                o: 'not'
            }]
        }
    };

    reqParams.query.filter = [{
        k: 'state',
        v: 'INSERVICE',
        o: 'eq'
    }];
    let inserviceResponse = await inventoryV1.Server.list(reqParams);

    reqParams.query.filter = [{
        k: 'state',
        v: 'MAINTENANCE',
        o: 'eq'
    }];
    let maintenanceResponse = await inventoryV1.Server.list(reqParams);

    reqParams.query.filter = [{
        k: 'state',
        v: 'CLOSED',
        o: 'eq'
    }];
    let closedResponse = await inventoryV1.Server.list(reqParams);

    return {
        INSERVICE: inserviceResponse.total_count,
        MAINTENANCE: maintenanceResponse.total_count,
        CLOSED: closedResponse.total_count
    };
};

export default getServerState;
