import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
import _ from 'lodash';

const ITEM_TYPES = ['server'];

const makeResponse = (itemsInfo, itemType) => {
    let response = {};
    itemsInfo.map((itemInfo) => {
        if (itemType == 'region') {
            response[itemInfo.region_id] = {
                name: itemInfo.tags.description || itemInfo.name,
                count: 0
            };
        } else if (itemType == 'zone') {
            response[itemInfo.zone_id] = {
                name: itemInfo.tags.description || itemInfo.name,
                count: 0
            };
        } else {
            response[itemInfo.pool_id] = {
                name: itemInfo.tags.description || itemInfo.name,
                count: 0
            };
        }
    });

    return response;
};

const listRegions = async (inventoryV1) => {
    let reqParams = {
        query: {
            minimal: true
        }
    };

    let response = await inventoryV1.Region.list(reqParams);
    return makeResponse(response.results, 'region');
};

const listZones = async (inventoryV1, region_id) => {
    let reqParams = {
        region_id: region_id,
        query: {
            minimal: true
        }
    };

    let response = await inventoryV1.Zone.list(reqParams);
    return makeResponse(response.results, 'zone');
};

const listPools = async (inventoryV1, zone_id) => {
    let reqParams = {
        zone_id: zone_id,
        query: {
            minimal: true
        }
    };

    let response = await inventoryV1.Pool.list(reqParams);
    return makeResponse(response.results, 'pool');
};

const getServerCount = async (inventoryV1, response, queryType) => {
    let reqParams = {
        query: {
            count_only: true
        }
    };

    let promises = Object.keys(response).map(async (itemId) => {
        if (queryType == 'region') {
            reqParams.region_id = itemId;
        } else if (queryType == 'zone') {
            reqParams.zone_id = itemId;
        } else {
            reqParams.pool_id = itemId;
        }

        let serverResponse = await inventoryV1.Server.list(reqParams);
        console.log(reqParams);
        console.log(serverResponse);
        response[itemId].count = serverResponse.total_count;
    });

    await Promise.all(promises);

    return response;
};

const getDataCenterItems = async (params) => {
    if (!params.item_type) {
        throw new Error('Required parameter. (key = item_type)');
    } else {
        if (ITEM_TYPES.indexOf(params.item_type) < 0) {
            throw new Error(`Parameter is invalid. (item_type = ${params.item_type})`);
        }
    }

    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let response = {};
    let queryType = null;

    if (params.region_id) {
        queryType = 'zone';
        response = await listZones(inventoryV1, params.region_id);
    } else if (params.zone_id) {
        queryType = 'pool';
        response = await listPools(inventoryV1, params.zone_id);
    } else {
        queryType = 'region';
        response = await listRegions(inventoryV1);
    }

    if (params.item_type == 'server') {
        response = await getServerCount(inventoryV1, response, queryType);
    }

    return response;
};

export default getDataCenterItems;
