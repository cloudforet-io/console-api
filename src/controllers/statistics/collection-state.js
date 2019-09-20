import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
import _ from 'lodash';

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

    reqParams.query.filter = [_.clone(defaultFilter, true), {
        k: 'collect_info.state',
        v: 'NEW',
        o: 'eq'
    }];
    let newResponse = await inventoryV1.Server.list(reqParams);

    reqParams.query.filter = [_.clone(defaultFilter, true), {
        k: 'collect_info.state',
        v: 'ACTIVE',
        o: 'eq'
    }];
    let activeResponse = await inventoryV1.Server.list(reqParams);

    reqParams.query.filter = [_.clone(defaultFilter, true), {
        k: 'collect_info.state',
        v: 'DUPLICATED',
        o: 'eq'
    }];
    let duplicatedResponse = await inventoryV1.Server.list(reqParams);

    reqParams.query.filter = [_.clone(defaultFilter, true), {
        k: 'collect_info.state',
        v: 'DISCONNECTED',
        o: 'eq'
    }];
    let disconnectedResponse = await inventoryV1.Server.list(reqParams);

    return {
        new: newResponse.total_count,
        active: activeResponse.total_count,
        duplicated: duplicatedResponse.total_count,
        disconnected: disconnectedResponse.total_count
    };
};

const getNetworkState = async (inventoryV1, domain_id) => {
    let reqParams = {
        domain_id: domain_id,
        query: {
            count_only: true
        }
    };

    reqParams.query.filter = [{
        k: 'collect_info.state',
        v: 'NEW',
        o: 'eq'
    }];
    let newResponse = await inventoryV1.Network.list(reqParams);

    reqParams.query.filter = [{
        k: 'collect_info.state',
        v: 'ACTIVE',
        o: 'eq'
    }];
    let activeResponse = await inventoryV1.Network.list(reqParams);

    reqParams.query.filter = [{
        k: 'collect_info.state',
        v: 'DUPLICATED',
        o: 'eq'
    }];
    let duplicatedResponse = await inventoryV1.Network.list(reqParams);

    reqParams.query.filter = [{
        k: 'collect_info.state',
        v: 'DISCONNECTED',
        o: 'eq'
    }];
    let disconnectedResponse = await inventoryV1.Network.list(reqParams);

    return {
        new: newResponse.total_count,
        active: activeResponse.total_count,
        duplicated: duplicatedResponse.total_count,
        disconnected: disconnectedResponse.total_count
    };
};

const getIPAddressState = async (inventoryV1, domain_id) => {
    let reqParams = {
        domain_id: domain_id,
        query: {
            count_only: true
        }
    };

    reqParams.query.filter = [{
        k: 'collect_info.state',
        v: 'NEW',
        o: 'eq'
    }];
    let newResponse = await inventoryV1.IPAddress.list(reqParams);

    reqParams.query.filter = [{
        k: 'collect_info.state',
        v: 'ACTIVE',
        o: 'eq'
    }];
    let activeResponse = await inventoryV1.IPAddress.list(reqParams);

    reqParams.query.filter = [{
        k: 'collect_info.state',
        v: 'DUPLICATED',
        o: 'eq'
    }];
    let duplicatedResponse = await inventoryV1.IPAddress.list(reqParams);

    reqParams.query.filter = [{
        k: 'collect_info.state',
        v: 'DISCONNECTED',
        o: 'eq'
    }];
    let disconnectedResponse = await inventoryV1.IPAddress.list(reqParams);

    return {
        new: newResponse.total_count,
        active: activeResponse.total_count,
        duplicated: duplicatedResponse.total_count,
        disconnected: disconnectedResponse.total_count
    };
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
