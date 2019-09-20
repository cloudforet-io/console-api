import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
import _ from 'lodash';

const COLLECTION_STATE = [
    'NEW',
    'ACTIVE',
    'DUPLICATED',
    'DISCONNECTED'
];

const getServerState = async (inventoryV1, domain_id) => {
    let reqParams = {
        domain_id: domain_id,
        query: {
            count_only: true
        }
    };

    let defaultFilter = {
        k: 'state',
        v: 'DELETED',
        o: 'not'
    };

    let response = {};
    let promises = COLLECTION_STATE.map(async (state) => {
        reqParams.query.filter = [_.clone(defaultFilter, true), {
            k: 'collect_info.state',
            v: state,
            o: 'eq'
        }];

        let stateResponse = await inventoryV1.Server.list(reqParams);
        response[state] = stateResponse.total_count;
    });

    await Promise.all(promises);
    return response;
};

const getNetworkState = async (inventoryV1, domain_id) => {
    let reqParams = {
        domain_id: domain_id,
        query: {
            count_only: true
        }
    };

    let response = {};
    let promises = COLLECTION_STATE.map(async (state) => {
        reqParams.query.filter = [{
            k: 'collect_info.state',
            v: state,
            o: 'eq'
        }];

        let stateResponse = await inventoryV1.Network.list(reqParams);
        response[state] = stateResponse.total_count;
    });

    await Promise.all(promises);
    return response;
};

const getIPAddressState = async (inventoryV1, domain_id) => {
    let reqParams = {
        domain_id: domain_id,
        query: {
            count_only: true
        }
    };

    let response = {};
    let promises = COLLECTION_STATE.map(async (state) => {
        reqParams.query.filter = [{
            k: 'collect_info.state',
            v: state,
            o: 'eq'
        }];

        let stateResponse = await inventoryV1.IPAddress.list(reqParams);
        response[state] = stateResponse.total_count;
    });

    await Promise.all(promises);
    return response;
};

const getCollectionState = async (params) => {
    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = {};

    if (params.resource_type == 'server') {
        response.server = await getServerState(inventoryV1, params.domain_id);
    } else if (params.resource_type == 'network') {
        response.network = await getNetworkState(inventoryV1, params.domain_id);
    } else if (params.resource_type == 'ip_address') {
        response.ip_address = await getIPAddressState(inventoryV1, params.domain_id);
    } else {
        response.server = await getServerState(inventoryV1, params.domain_id);
        response.network = await getNetworkState(inventoryV1, params.domain_id);
        response.ip_address = await getIPAddressState(inventoryV1, params.domain_id);
    }

    return response;
};

export default getCollectionState;
